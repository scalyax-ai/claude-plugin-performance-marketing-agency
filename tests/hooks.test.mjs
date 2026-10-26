// Run: node --test tests/
// Each hook runs as a real child process with JSON on stdin, the way Claude
// Code runs it, against a throwaway agency folder.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const scripts = path.join(here, '..', 'scripts')
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures', 'post-session-start.json'), 'utf8'))
const ORG = { id: 'bbb86774-c36b-499f-bcb1-565a11669783', name: 'analify-ads' }

function run(script, input, cwd) {
  const r = spawnSync('node', [path.join(scripts, script), ...(input.argv || [])], {
    input: input.argv ? '' : JSON.stringify(input),
    cwd,
    encoding: 'utf8',
  })
  assert.equal(r.status, 0, `${script} exited ${r.status}: ${r.stderr}`)
  return r.stdout ? JSON.parse(r.stdout) : null
}

function cli(args, cwd) {
  const r = spawnSync('node', [path.join(scripts, 'clients.mjs'), ...args], {
    cwd,
    encoding: 'utf8',
    // Never write the real ~/.claude.json from tests: use the .mcp.json fallback.
    env: { ...process.env, ANALIFY_NO_CLAUDE_CLI: '1' },
  })
  return { code: r.status, out: r.stdout, err: r.stderr }
}

// Agency "Zeyad Agency" with client "Analify Ads" whose Brand is "analify-ads".
function setup({ brand = 'analify-ads', autosave } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'analify agency '))
  assert.equal(cli(['init', '--name', 'Zeyad Agency'], root).code, 0)
  const args = ['add', 'Analify Ads', '--brand', brand]
  if (autosave) args.push('--autosave', autosave)
  const r = cli(args, root)
  assert.equal(r.code, 0, r.err)
  const clientDir = path.join(root, 'Clients', 'Analify Ads')
  return { root, clientDir }
}

const SERVER = 'analify-analify-ads'
const sessionStartPost = (cwd, sid = 's1') => ({
  ...fixture,
  session_id: sid,
  cwd,
  tool_name: `mcp__${SERVER}__analify_brain_session_start`,
})
const pre = (cwd, tool, extra = {}) => ({ hook_event_name: 'PreToolUse', session_id: 's1', cwd, tool_name: tool, tool_input: {}, ...extra })
const post = (cwd, tool, tool_input = {}) => ({ hook_event_name: 'PostToolUse', session_id: 's1', cwd, tool_name: tool, tool_input, tool_response: [] })

test('add-client writes the folder and its own connection, without touching permission settings', () => {
  const { clientDir } = setup()
  const mcp = JSON.parse(fs.readFileSync(path.join(clientDir, '.mcp.json'), 'utf8'))
  assert.deepEqual(Object.keys(mcp.mcpServers), [SERVER])
  assert.equal(mcp.mcpServers[SERVER].url, 'https://analify-mcp.scalyax.ai/')
  assert.equal(fs.existsSync(path.join(clientDir, '.claude')), false)
  const cfg = JSON.parse(fs.readFileSync(path.join(clientDir, '.analify', 'client.json'), 'utf8'))
  assert.equal(cfg.agencyName, 'Zeyad Agency')
  assert.equal(cfg.autosave, true)
})

test('hooks are silent outside agency folders', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plain '))
  assert.equal(run('session-start.mjs', { session_id: 's', cwd: dir }, dir), null)
  assert.equal(run('guard.mjs', pre(dir, 'mcp__analify__analify_get_context'), dir), null)
  assert.equal(run('track.mjs', post(dir, 'mcp__analify__analify_get_context'), dir), null)
  assert.equal(run('stop.mjs', { session_id: 's', cwd: dir, stop_hook_active: false }, dir), null)
})

test('session start names the client and its connection', () => {
  const { clientDir } = setup()
  const out = run('session-start.mjs', { session_id: 's1', cwd: path.join(clientDir, 'reports') }, clientDir)
  const ctx = out.hookSpecificOutput.additionalContext
  assert.match(ctx, /client: Analify Ads/)
  assert.match(ctx, new RegExp(`mcp__${SERVER}__analify_brain_session_start`))
  assert.match(ctx, /autosave is ON/)
})

test('session start in the agency root summarises clients', () => {
  const { root } = setup()
  const ctx = run('session-start.mjs', { session_id: 's1', cwd: root }, root).hookSpecificOutput.additionalContext
  assert.match(ctx, /1 client folder\(s\), 0 with a confirmed/)
})

test('guard blocks every other Analify connection in a client folder', () => {
  const { clientDir } = setup()
  for (const tool of [
    'mcp__analify__analify_get_context',
    'mcp__analify-jarvis__analify_call_tool',
    'mcp__plugin_analify_analify__analify_brain_search',
  ]) {
    const out = run('guard.mjs', pre(clientDir, tool), clientDir)
    assert.equal(out.hookSpecificOutput.permissionDecision, 'deny', tool)
  }
  // Non-Analify servers are none of our business.
  assert.equal(run('guard.mjs', pre(clientDir, 'mcp__figma__get_metadata'), clientDir), null)
})

test('guard requires the Brand to be confirmed before work, then allows it', () => {
  const { clientDir } = setup()
  assert.equal(run('guard.mjs', pre(clientDir, `mcp__${SERVER}__analify_brain_session_start`), clientDir), null)
  assert.equal(run('guard.mjs', pre(clientDir, `mcp__${SERVER}__meta_search_tools`), clientDir), null)
  const before = run('guard.mjs', pre(clientDir, `mcp__${SERVER}__analify_call_tool`), clientDir)
  assert.equal(before.hookSpecificOutput.permissionDecision, 'deny')

  const bound = run('track.mjs', sessionStartPost(clientDir), clientDir)
  assert.match(bound.hookSpecificOutput.additionalContext, /Connection confirmed/)
  assert.equal(run('guard.mjs', pre(clientDir, `mcp__${SERVER}__analify_call_tool`), clientDir), null)

  const cfg = JSON.parse(fs.readFileSync(path.join(clientDir, '.analify', 'client.json'), 'utf8'))
  assert.equal(cfg.bound.id, ORG.id)

  const wrongOrg = run('guard.mjs', pre(clientDir, `mcp__${SERVER}__analify_brain_capture`, { tool_input: { forOrganizationId: 'other' } }), clientDir)
  assert.equal(wrongOrg.hookSpecificOutput.permissionDecision, 'deny')
})

test('a connection signed in to the wrong Brand is blocked with fix steps', () => {
  const { clientDir } = setup({ brand: 'Caliego' })
  const out = run('track.mjs', sessionStartPost(clientDir), clientDir)
  assert.match(out.hookSpecificOutput.additionalContext, /WRONG BRAND/)
  const denied = run('guard.mjs', pre(clientDir, `mcp__${SERVER}__analify_call_tool`), clientDir)
  assert.equal(denied.hookSpecificOutput.permissionDecision, 'deny')
  assert.match(denied.hookSpecificOutput.permissionDecisionReason, /signed in to "analify-ads"/)
  const cfg = JSON.parse(fs.readFileSync(path.join(clientDir, '.analify', 'client.json'), 'utf8'))
  assert.equal(cfg.bound, null)
})

test('a later session signed in to a different organization is blocked', () => {
  const { clientDir } = setup()
  run('track.mjs', sessionStartPost(clientDir, 'a'), clientDir)
  const other = structuredClone(sessionStartPost(clientDir, 'b'))
  other.tool_response[0].text = other.tool_response[0].text.replace(ORG.id, '00000000-0000-0000-0000-000000000000')
  const out = run('track.mjs', other, clientDir)
  assert.match(out.hookSpecificOutput.additionalContext, /WRONG BRAND/)
})

function transcript(dir, lines) {
  const file = path.join(dir, 'transcript.jsonl')
  fs.writeFileSync(file, lines.map(l => JSON.stringify(l)).join('\n') + '\n')
  return file
}

const T = [
  { type: 'user', message: { role: 'user', content: '<system-reminder>secret context</system-reminder>Audit Caliego Meta ads for last 30 days' } },
  { type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', name: `mcp__${SERVER}__analify_call_tool`, input: { tool_name: 'analify_ads_accounts' } }] } },
  { type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'BIG RAW API OUTPUT' }] } },
  { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'Ad set X loses money after returns.' }] } },
]

test('stop asks once to save after real client work, with the record written', () => {
  const { clientDir } = setup()
  const tp = transcript(clientDir, T)
  run('track.mjs', sessionStartPost(clientDir), clientDir)
  for (let i = 0; i < 3; i++) run('track.mjs', post(clientDir, `mcp__${SERVER}__analify_call_tool`, { tool_name: 'analify_ads_accounts' }), clientDir)
  run('track.mjs', post(clientDir, 'Write', { file_path: path.join(clientDir, 'reports', 'meta-audit.md') }), clientDir)

  const stop = { session_id: 's1', cwd: clientDir, transcript_path: tp, stop_hook_active: false }
  const out = run('stop.mjs', stop, clientDir)
  assert.equal(out.decision, 'block')
  assert.match(out.reason, /BRAIN AUTOSAVE CHECKPOINT for Analify Ads/)
  assert.match(out.reason, /analify_brain_remember/)
  assert.match(out.reason, /reports\/meta-audit\.md/)
  assert.match(out.reason, new RegExp(`forOrganizationId "${ORG.id}"`))
  assert.match(out.reason, /Agency Zeyad Agency/)

  const sessions = fs.readdirSync(path.join(clientDir, '.analify', 'sessions'))
  assert.equal(sessions.length, 1)
  const record = fs.readFileSync(path.join(clientDir, '.analify', 'sessions', sessions[0]), 'utf8')
  assert.match(record, /Audit Caliego Meta ads/)
  assert.match(record, /Ad set X loses money/)
  assert.match(record, /analify_call_tool → analify_ads_accounts/)
  assert.doesNotMatch(record, /secret context|BIG RAW API OUTPUT/)

  // Claude continuing because of the hook: never block again.
  assert.equal(run('stop.mjs', { ...stop, stop_hook_active: true }, clientDir), null)
  // Next turn with no new work: nothing to save.
  assert.equal(run('stop.mjs', stop, clientDir), null)
})

test('stop stays quiet for small talk, when Claude already saved, or with autosave off', () => {
  const { clientDir } = setup()
  const tp = transcript(clientDir, T)
  const stop = { session_id: 's1', cwd: clientDir, transcript_path: tp, stop_hook_active: false }
  run('track.mjs', post(clientDir, `mcp__${SERVER}__analify_call_tool`), clientDir)
  assert.equal(run('stop.mjs', stop, clientDir), null)

  for (let i = 0; i < 3; i++) run('track.mjs', post(clientDir, `mcp__${SERVER}__analify_call_tool`), clientDir)
  run('track.mjs', post(clientDir, `mcp__${SERVER}__analify_call_write_tool`, { tool_name: 'analify_brain_remember' }), clientDir)
  assert.equal(run('stop.mjs', stop, clientDir), null)

  const off = setup({ autosave: 'off' })
  for (let i = 0; i < 5; i++) run('track.mjs', post(off.clientDir, `mcp__${SERVER}__analify_call_tool`), off.clientDir)
  assert.equal(run('stop.mjs', { ...stop, cwd: off.clientDir }, off.clientDir), null)
})

test('import creates many client folders and status reports what is missing', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agency '))
  cli(['init', '--name', 'Zeyad Agency'], root)
  fs.writeFileSync(
    path.join(root, 'clients.csv'),
    'name,brand,site,shopify,meta\nCaliego,Caliego,https://caliego.com,caliego.myshopify.com,act_1\n"Brand, Two",,,,\nكافيه,,,,\n'
  )
  const r = cli(['import', 'clients.csv'], root)
  assert.match(r.out, /2 of 3 client folders ready/)
  assert.match(r.out, /✗ كافيه: .*--slug/)
  const status = JSON.parse(cli(['status', '--json'], root).out)
  assert.equal(status.length, 2)
  const two = status.find(s => s.name === 'Brand, Two')
  assert.equal(two.connection, 'analify-brand-two')
  assert.ok(two.missing.some(m => /Shopify/.test(m)))
})

test('add-client outside an agency folder explains what to do', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nowhere '))
  const r = cli(['add', 'X'], dir)
  assert.equal(r.code, 1)
  assert.match(r.err, /agency-setup/)
})

test('stop notices a report written by a shell command, not only by Write', () => {
  const { clientDir } = setup()
  run('session-start.mjs', { session_id: 's9', cwd: clientDir }, clientDir)
  const tp = path.join(os.tmpdir(), `t-${Date.now()}.jsonl`)
  fs.writeFileSync(tp, JSON.stringify(T[0]) + '\n')
  const later = new Date(Date.now() + 2000)
  const report = path.join(clientDir, 'reports', 'shell-audit.md')
  fs.writeFileSync(report, '# audit\n')
  fs.utimesSync(report, later, later)
  const out = run('stop.mjs', { session_id: 's9', cwd: clientDir, transcript_path: tp, stop_hook_active: false }, clientDir)
  assert.equal(out.decision, 'block')
  assert.match(out.reason, /reports\/shell-audit\.md/)
  assert.doesNotMatch(out.reason, /CLAUDE\.md/)
})
