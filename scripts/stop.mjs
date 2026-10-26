// Stop: Brain autosave checkpoint for client folders.
//
// Stop fires at the end of every turn. When enough client work has happened
// since the last checkpoint (Analify calls on this client's connection, or
// files written in the folder) and nothing was saved to the Brain in between,
// it writes a readable record of that stretch of the session to
// .analify/sessions/ and asks Claude — once — to save it to this client's
// Brain. Silent outside client folders, when autosave is off, and while
// Claude is already continuing because of a stop hook.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { readStdin, parseJson, findClient, loadState, saveState, emit, today, redact } from './lib.mjs'

export const MIN_WORK_CALLS = 2
const RECORD_MAX_CHARS = 40_000
const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.csv'])
const SKIP_DIRS = new Set(['node_modules', '.git'])

/**
 * Files in the client folder changed after `sinceMs` — catches reports written
 * by any tool (Write, Edit, a shell command). Hidden folders such as .analify
 * and .claude are skipped.
 */
export function changedFiles(root, sinceMs, depth = 0, prefix = '') {
  const out = []
  let entries = []
  try {
    entries = fs.readdirSync(path.join(root, prefix), { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue
    const rel = prefix ? path.join(prefix, e.name) : e.name
    if (e.isDirectory()) {
      if (depth < 3) out.push(...changedFiles(root, sinceMs, depth + 1, rel))
    } else if (e.isFile()) {
      try {
        if (fs.statSync(path.join(root, rel)).mtimeMs > sinceMs) out.push(rel)
      } catch {}
    }
  }
  return out.sort()
}

/** Readable record of transcript lines [from, end): what was asked and said, which tools ran. */
export function sessionRecord(transcriptPath, fromLine) {
  let lines = []
  try {
    lines = fs.readFileSync(transcriptPath, 'utf8').split('\n')
  } catch {
    return { text: '', lineCount: fromLine }
  }
  const out = []
  for (const raw of lines.slice(fromLine)) {
    const entry = parseJson(raw)
    if (!entry || entry.isMeta) continue
    const message = entry.message
    if (!message) continue
    if (entry.type === 'user' && message.role === 'user') {
      const text = typeof message.content === 'string'
        ? message.content
        : (message.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
      const clean = stripReminders(text)
      if (clean) out.push(`## User\n${clean}`)
    } else if (entry.type === 'assistant' && message.role === 'assistant') {
      for (const block of message.content || []) {
        if (block.type === 'text' && block.text.trim()) out.push(`## Claude\n${block.text.trim()}`)
        if (block.type === 'tool_use') out.push(`- tool: ${toolLabel(block)}`)
      }
    }
  }
  let text = redact(out.join('\n\n'))
  if (text.length > RECORD_MAX_CHARS) {
    const half = RECORD_MAX_CHARS / 2
    text = `${text.slice(0, half)}\n\n[… middle of the session left out to keep this record short …]\n\n${text.slice(-half)}`
  }
  const lineCount = lines.length && lines[lines.length - 1] === '' ? lines.length - 1 : lines.length
  return { text, lineCount }
}

function stripReminders(text) {
  return String(text || '')
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<(command|local-command)-[a-z]+>[\s\S]*?<\/\1-[a-z]+>/g, '')
    .trim()
}

function toolLabel(block) {
  const input = block.input || {}
  if (block.name.endsWith('analify_call_tool') || block.name.endsWith('analify_call_write_tool')) {
    return `${block.name.replace(/^mcp__[^_]+.*?__/, '')} → ${input.tool_name || '?'}`
  }
  if (input.file_path) return `${block.name} ${input.file_path}`
  return block.name.replace(/^mcp__(.+?)__/, '')
}

export function checkpointReason({ config, sessionId, recordPath, files, boundId }) {
  const server = config.serverName
  const p = `mcp__${server}__`
  const who = config.agencyName ? `Agency ${config.agencyName}` : 'Agency'
  const textFiles = files.filter(f => TEXT_EXTENSIONS.has(path.extname(f).toLowerCase()))
  const otherFiles = files.filter(f => !textFiles.includes(f))
  const steps = [
    `BRAIN AUTOSAVE CHECKPOINT for ${config.name}. The agency owner turned autosave on for this client folder, so saving this work to ${config.brand}'s Brain is approved — do it now, without asking, then tell the user in one line what you saved. Save ONLY what is about ${config.name}'s business.`,
    boundId
      ? `0. Connection already confirmed (organization ${boundId}).`
      : `0. First call ${p}analify_brain_session_start with sessionId "${sessionId}" and check it names ${config.brand}. If it names another Brand, save nothing and tell the user.`,
    `1. Findings worked out from data (research, audit results, analysis): for each, ${p}analify_call_write_tool with tool_name "analify_brain_remember" and arguments { question, answer, toolsUsed }. answer starts with "${who}, ${today()}: …" and states the finding with its numbers and period. toolsUsed lists the Analify tools you actually called (required — skip a finding with no data behind it).`,
    `2. Decisions, tests, client rules and how-we-do-it-for-this-client steps: for each, ${p}analify_brain_capture with sessionId "${sessionId}"${boundId ? `, forOrganizationId "${boundId}"` : ''}, a new eventId, kind (fact | decision | constraint | experiment | procedure), statement ("${who}: …", one or two sentences), date (YYYY-MM-DD it happened), decisionItImproves, and entities (e.g. product / campaign / courier). Not code or engineering work. Recommendations the client has not approved are kind "experiment" or say "proposed", never a rule.`,
    textFiles.length
      ? `3. Files the agency produced here — add each to the Brain: ${p}analify_call_write_tool, tool_name "analify_brain_files_post", arguments { filename, text: <the file's content>, import: true }. Files: ${textFiles.join(', ')}.`
      : `3. No report files to add.`,
    otherFiles.length
      ? `   These files are not plain text, so they can't be sent from here; tell the user to add them in Analify → Brain → Library: ${otherFiles.join(', ')}.`
      : null,
    `4. Session record (kept for the founder, not used for answers): Read ${recordPath} and send it with ${p}analify_call_write_tool, tool_name "analify_brain_files_post", arguments { filename: "${path.basename(recordPath)}", text: <the file's content as written — don't summarise it>, import: false }. The plugin already removed emails, phone numbers, card numbers and keys from it; if you still see a customer's name, address or another private detail, remove that line before sending.`,
    `5. ${p}analify_brain_session_finish with sessionId "${sessionId}" and a two-line summary of the business outcome.`,
    `Never send passwords, keys, or customers' names, phone numbers, emails or addresses. If a save is refused, read the note and fix it once; if it is still refused, tell the user exactly what was not saved.`,
  ]
  return steps.filter(Boolean).join('\n')
}

function main() {
  const input = parseJson(readStdin(), {})
  const client = findClient(input.cwd || process.cwd())
  if (!client || !client.config.autosave || input.stop_hook_active) return

  const state = loadState(client.root, input.session_id)
  const workSince = (state.workCalls || 0) - (state.workAtCheckpoint || 0)
  const savesSince = (state.saveCalls || 0) - (state.savesAtCheckpoint || 0)
  const since = state.checkpointAt || state.startedAt || Date.now()
  // Only finished work in reports/ is offered to the client's Brain. Anything
  // else in the folder (private notes, drafts) stays with the agency.
  const newFiles = [...new Set([...state.files.slice(state.filesAtCheckpoint || 0), ...changedFiles(client.root, since)])]
    .filter(isReportFile)

  // Saves Analify refused since the last checkpoint, with nothing accepted:
  // say so once, so missing work isn't mistaken for saved work.
  const failedSince = (state.failedSaves || 0) - (state.failedAtCheckpoint || 0)
  if (failedSince > 0 && savesSince === 0 && !state.failureReported) {
    state.failureReported = true
    saveState(client.root, input.session_id, state)
    emit({
      decision: 'block',
      reason: `${failedSince} save(s) to ${client.config.brand}'s Brain were refused (last reason: ${state.lastSaveError || 'unknown'}). Fix the cause once and retry; if it still fails, tell the user in plain words which findings, decisions or files were NOT saved.`,
    })
    return
  }

  if (workSince < MIN_WORK_CALLS && newFiles.length === 0) return
  if (savesSince > 0) {
    // Claude already saved this stretch on its own; just move the checkpoint.
    state.checkpointLine = sessionRecord(input.transcript_path, state.checkpointLine || 0).lineCount
    advance(state, input, client)
    return
  }

  const record = sessionRecord(input.transcript_path, state.checkpointLine || 0)
  state.part = (state.part || 0) + 1
  const dir = path.join(client.root, '.analify', 'sessions')
  fs.mkdirSync(dir, { recursive: true })
  const recordPath = path.join(dir, `${today()}-${String(input.session_id).slice(0, 8)}-part${state.part}.md`)
  fs.writeFileSync(
    recordPath,
    `# ${client.config.name} — agency work session, ${today()} (part ${state.part})\n\n${record.text || '(no conversation text)'}\n`
  )
  const reason = checkpointReason({
    config: client.config,
    sessionId: input.session_id,
    recordPath,
    files: newFiles,
    boundId: state.bound && !state.bound.mismatch ? state.bound.id : null,
  })
  state.checkpointLine = record.lineCount
  advance(state, input, client)
  emit({ decision: 'block', reason })
}

export function isReportFile(rel) {
  const parts = String(rel).split(/[\\/]/)
  return parts[0] === 'reports' && parts.length > 1
}

function advance(state, input, client) {
  state.workAtCheckpoint = state.workCalls || 0
  state.savesAtCheckpoint = state.saveCalls || 0
  state.filesAtCheckpoint = state.files.length
  state.checkpointAt = Date.now()
  state.failedAtCheckpoint = state.failedSaves || 0
  state.failureReported = false
  saveState(client.root, input.session_id, state)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
