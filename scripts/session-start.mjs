// SessionStart: tell Claude which client this folder is for, which connection
// to use, and how saving to the Brain works here. Silent outside agency folders.

import { readStdin, parseJson, findClient, findAgency, loadState, saveState, emit, today, connectedPlatforms, platformGaps } from './lib.mjs'
import { listClients } from './clients.mjs'

const input = parseJson(readStdin(), {})
const cwd = input.cwd || process.cwd()
const client = findClient(cwd)

if (client) {
  const { config } = client
  const state = loadState(client.root, input.session_id)
  if (!state.startedAt) {
    state.startedAt = Date.now()
    saveState(client.root, input.session_id, state)
  }
  const prefix = `mcp__${config.serverName}__`
  const bound = config.bound
  const lines = [
    `ANALIFY AGENCY WORKSPACE — client: ${config.name}.`,
    `This folder is for ${config.name} only (Analify Brand "${config.brand}"${config.agencyName ? `, managed by ${config.agencyName}` : ''}).`,
    `Use ONLY the ${prefix}* tools for Analify. Every other Analify connection on this machine belongs to a different business and is blocked here.`,
    `Before any other Analify call, call ${prefix}analify_brain_session_start with sessionId "${input.session_id}". It confirms which Brand this connection is signed in to; until then the other Analify tools are blocked.`,
    bound
      ? `Last confirmed connection: Brand "${bound.name}" (${bound.id}) on ${bound.at}.`
      : `This connection has not been confirmed yet. If session_start names a Brand other than "${config.brand}", stop and tell the user to reconnect: run /mcp, pick ${config.serverName}, sign out, sign in again and choose ${config.brand}.`,
    config.platforms
      ? `Connected for ${config.name} (as of ${config.platformsCheckedAt}): ${connectedPlatforms(config.platforms).join(', ') || 'nothing yet'}.${platformGaps(config.platforms).length ? ` Missing: ${platformGaps(config.platforms).join('; ')}.` : ''} Plan the work around what is connected; call analify_get_context to refresh.`
      : `Call ${prefix}analify_get_context after session_start to see which platforms ${config.name} has connected, and plan the work around them.`,
    `Then read what this Brand already knows with analify_brain_search (via ${prefix}analify_call_tool) before answering business questions. Tell every number which client it belongs to.`,
    config.autosave
      ? `Brain autosave is ON for this client: the agency owner turned it on for this folder, so saving this client's research, findings, audits and decisions to ${config.brand}'s Brain is approved. When a save checkpoint arrives, follow its steps. Never save anything about another business here.`
      : `Brain autosave is OFF for this client. Save to the Brain only when the user asks (/analify-agency:save).`,
    `Today is ${today()}.`,
  ]
  emit({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } })
  process.exit(0)
}

const agency = findAgency(cwd)
if (agency) {
  const clients = listClients(agency)
  const linked = clients.filter(c => c.config.bound).length
  const lines = [
    `ANALIFY AGENCY ROOT — ${agency.config.name || 'agency'}. ${clients.length} client folder(s), ${linked} with a confirmed Analify connection.`,
    `Client work happens inside each client's folder (open Claude Code there), never here: this root has no client connection.`,
    `Commands: /analify-agency:add-client, /analify-agency:import-clients, /analify-agency:clients.`,
  ]
  emit({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } })
}
process.exit(0)
