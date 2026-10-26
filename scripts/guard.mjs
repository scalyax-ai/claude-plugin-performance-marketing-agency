// PreToolUse (matcher mcp__.*): inside a client folder, only that client's own
// Analify connection may be used, and only after it has been confirmed to be
// signed in to the right Brand this session. Silent outside client folders.

import {
  readStdin,
  parseJson,
  findClient,
  loadState,
  splitMcpName,
  isAnalifyServer,
  emit,
  PRE_BIND_TOOLS,
} from './lib.mjs'

function deny(reason) {
  emit({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  })
  process.exit(0)
}

const input = parseJson(readStdin(), {})
const client = findClient(input.cwd || process.cwd())
const name = splitMcpName(input.tool_name)
if (!client || !name) process.exit(0)

const { config } = client
const own = config.serverName

if (name.server !== own) {
  if (isAnalifyServer(name.server)) {
    deny(
      `Blocked: this folder is for ${config.name}. "${name.server}" is a different Analify connection (another business). Use mcp__${own}__${name.tool} instead.`
    )
  }
  process.exit(0)
}

if (PRE_BIND_TOOLS.has(name.tool) || name.tool.endsWith('_search_tools')) process.exit(0)

const state = loadState(client.root, input.session_id)
const bound = state.bound
if (!bound) {
  deny(
    `Not yet confirmed which Brand this connection is signed in to. Call mcp__${own}__analify_brain_session_start with sessionId "${input.session_id}" first, then retry.`
  )
}
if (bound.mismatch) {
  deny(
    `Blocked: this connection is signed in to "${bound.name}", but this folder is for ${config.name} (Brand "${config.brand}"). Ask the user to reconnect: /mcp → ${own} → clear authentication, sign in again and choose "${config.brand}". If "${bound.name}" really is this client's Brand, run /analify-agency:add-client "${config.name}" --brand "${bound.name}" to correct the folder, then call analify_brain_session_start again.`
  )
}

// Capture tools take an optional forOrganizationId; it must be this Brand.
const forOrg = input.tool_input && input.tool_input.forOrganizationId
if (forOrg && forOrg !== bound.id) {
  deny(`Blocked: forOrganizationId ${forOrg} is not ${config.brand} (${bound.id}).`)
}
process.exit(0)
