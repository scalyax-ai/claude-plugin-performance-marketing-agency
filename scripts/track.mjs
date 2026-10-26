// PostToolUse (matcher mcp__.*|Write|Edit): inside a client folder, record
//  - which Brand the client's connection is signed in to (from session_start),
//  - how much client work and how many Brain saves happened (for autosave),
//  - files written in the folder (audits, reports) to offer to the Brain.
// Silent outside client folders.

import path from 'node:path'
import {
  readStdin,
  parseJson,
  findClient,
  saveClientConfig,
  loadState,
  saveState,
  splitMcpName,
  findOrganization,
  normalizeName,
  emit,
  BRAIN_SAVE_TOOLS,
  BRAIN_SAVE_DISPATCHED,
} from './lib.mjs'

const input = parseJson(readStdin(), {})
const client = findClient(input.cwd || process.cwd())
if (!client) process.exit(0)

const { config } = client
const state = loadState(client.root, input.session_id)
state.workCalls = state.workCalls || 0
state.saveCalls = state.saveCalls || 0
let context = null

const name = splitMcpName(input.tool_name)
if (name && name.server === config.serverName) {
  if (name.tool === 'analify_brain_session_start') {
    const org = findOrganization(input.tool_response)
    if (org) {
      const now = new Date().toISOString()
      const firstTime = !config.bound
      // The first confirmation is checked against the Brand name the folder was
      // created for; later ones against the organization id first confirmed.
      const mismatch = firstTime
        ? normalizeName(org.name) !== normalizeName(config.brand)
        : org.id !== config.bound.id
      state.bound = { id: org.id, name: org.name, at: now, mismatch }
      if (!mismatch) {
        config.bound = { id: org.id, name: org.name, at: now.slice(0, 10) }
        saveClientConfig(client)
        context = `Connection confirmed: signed in to Brand "${org.name}" — correct for ${config.name}. Pass forOrganizationId "${org.id}" on Brain capture calls.`
      } else {
        context = `WRONG BRAND: this connection is signed in to "${org.name}", but this folder is for ${config.name} (expected "${config.bound ? config.bound.name : config.brand}"). Analify tools are blocked here. Tell the user exactly this and how to fix it: run /mcp, pick ${config.serverName}, clear authentication, sign in again and choose the right Brand.`
      }
    }
  } else if (BRAIN_SAVE_TOOLS.has(name.tool)) {
    state.saveCalls += 1
  } else if (name.tool === 'analify_call_write_tool' && BRAIN_SAVE_DISPATCHED.has(input.tool_input?.tool_name)) {
    state.saveCalls += 1
  } else if (!name.tool.endsWith('_search_tools') && name.tool !== 'analify_get_context') {
    state.workCalls += 1
  }
} else if (input.tool_name === 'Write' || input.tool_name === 'Edit') {
  const file = input.tool_input?.file_path
  if (file) {
    const abs = path.resolve(input.cwd || process.cwd(), file)
    const rel = path.relative(client.root, abs)
    const inside = rel && !rel.startsWith('..') && !path.isAbsolute(rel)
    if (inside && !rel.startsWith('.analify') && !rel.startsWith('.claude') && !state.files.includes(rel)) {
      state.files.push(rel)
    }
  }
}

saveState(client.root, input.session_id, state)
if (context) emit({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context } })
process.exit(0)
