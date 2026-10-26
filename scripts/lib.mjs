// Shared helpers for the Analify agency hooks and the client-admin script.
//
// Every hook runs on every matching event in every Claude Code session on the
// machine, so each one first asks findClient()/findAgency() and exits silently
// when the working folder is not an Analify agency or client folder.
//
// The hooks never touch the network. Anything that reaches Analify goes through
// Claude's own MCP calls, which the user sees in the session.

import fs from 'node:fs'
import path from 'node:path'

export const ANALIFY_MCP_URL = 'https://analify-mcp.scalyax.ai/'
export const ANALIFY_APP_URL = 'https://analify.scalyax.ai'
export const CLIENT_FILE = path.join('.analify', 'client.json')
export const AGENCY_FILE = path.join('.analify', 'agency.json')

// Brain write tools on the Analify MCP server. Calls to these count as "saved
// to the Brain" for the autosave checkpoint.
export const BRAIN_SAVE_TOOLS = new Set([
  'analify_brain_capture',
  'analify_brain_session_finish',
])
// Dispatched writes (through analify_call_write_tool) that save to the Brain.
export const BRAIN_SAVE_DISPATCHED = new Set([
  'analify_brain_remember',
  'analify_brain_files_post',
  'analify_brain_statements',
])
// Tools on the client's own server that are allowed before the connection's
// Brand has been confirmed this session: they only identify the connection.
export const PRE_BIND_TOOLS = new Set([
  'analify_brain_session_start',
  'analify_get_context',
])

/** Read stdin fully (hook input). */
export function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

export function parseJson(text, fallback = null) {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

export function readJsonFile(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

export function writeJsonFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n')
  fs.renameSync(tmp, file)
}

/** Walk up from `start` looking for `rel`; returns the directory holding it. */
function findUp(start, rel) {
  if (!start) return null
  let dir = path.resolve(start)
  for (;;) {
    if (fs.existsSync(path.join(dir, rel))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** The client folder containing `cwd`, with its config, or null. */
export function findClient(cwd) {
  const root = findUp(cwd, CLIENT_FILE)
  if (!root) return null
  const config = readJsonFile(path.join(root, CLIENT_FILE))
  if (!config || typeof config.serverName !== 'string') return null
  return { root, config }
}

/** The agency folder containing `cwd`, with its config, or null. */
export function findAgency(cwd) {
  const root = findUp(cwd, AGENCY_FILE)
  if (!root) return null
  const config = readJsonFile(path.join(root, AGENCY_FILE))
  if (!config) return null
  return { root, config }
}

export function saveClientConfig(client) {
  writeJsonFile(path.join(client.root, CLIENT_FILE), client.config)
}

// Per-session state lives next to the client config, so it is per client.
function stateFile(clientRoot, sessionId) {
  const safe = String(sessionId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '_')
  return path.join(clientRoot, '.analify', 'state', `${safe}.json`)
}

export function loadState(clientRoot, sessionId) {
  return readJsonFile(stateFile(clientRoot, sessionId), {
    checkpointLine: 0,
    part: 0,
    files: [],
    bound: null,
  })
}

export function saveState(clientRoot, sessionId, state) {
  writeJsonFile(stateFile(clientRoot, sessionId), state)
}

/** "mcp__analify-caliego__analify_get_context" → { server, tool }. */
export function splitMcpName(toolName) {
  const m = /^mcp__(.+?)__(.+)$/.exec(toolName || '')
  return m ? { server: m[1], tool: m[2] } : null
}

/** Any server that talks to Analify: analify, analify-x, plugin_analify_analify… */
export function isAnalifyServer(server) {
  return /analify/i.test(server || '')
}

/** Lowercase, collapse spaces/punctuation: brand names are compared this way. */
export function normalizeName(name) {
  return String(name || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\-_.'’"]+/g, '')
}

export function slugify(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/** Hook JSON output. */
export function emit(obj) {
  process.stdout.write(JSON.stringify(obj))
}

/**
 * Find `organization: { id, name }` anywhere inside a tool response, whatever
 * shape Claude Code wraps an MCP result in (object, content blocks, a JSON
 * string inside a text block).
 */
export function findOrganization(value, depth = 0) {
  if (value == null || depth > 6) return null
  if (typeof value === 'string') {
    const parsed = parseJson(value)
    if (parsed && typeof parsed === 'object') return findOrganization(parsed, depth + 1)
    return null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findOrganization(item, depth + 1)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    const org = value.organization
    if (org && typeof org === 'object' && typeof org.id === 'string') {
      return { id: org.id, name: typeof org.name === 'string' ? org.name : null }
    }
    for (const key of Object.keys(value)) {
      const found = findOrganization(value[key], depth + 1)
      if (found) return found
    }
  }
  return null
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

const PLATFORM_NAMES = {
  shopify: 'Shopify',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  google_ads: 'Google Ads',
  snapchat_ads: 'Snapchat Ads',
  google_analytics: 'Google Analytics',
  google_sheets: 'Google Sheets',
  bosta: 'Bosta',
  bosta_fulfillment: 'Bosta Fulfillment',
  odoo: 'Odoo',
}

export function platformName(key) {
  return PLATFORM_NAMES[key] || String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export const AD_PLATFORMS = ['meta_ads', 'tiktok_ads', 'google_ads', 'snapchat_ads']

/**
 * The `integrations` list from an analify_get_context response, summarised per
 * platform: { meta_ads: { connected: 2, disconnected: 1, accounts: [...] } }.
 */
export function summarizeIntegrations(value, depth = 0) {
  if (value == null || depth > 6) return null
  if (typeof value === 'string') {
    const parsed = parseJson(value)
    return parsed && typeof parsed === 'object' ? summarizeIntegrations(parsed, depth + 1) : null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = summarizeIntegrations(item, depth + 1)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.integrations)) {
      const out = {}
      for (const i of value.integrations) {
        if (!i || typeof i.platform !== 'string') continue
        const p = (out[i.platform] = out[i.platform] || { connected: 0, disconnected: 0, accounts: [] })
        if (i.status === 'connected') {
          p.connected += 1
          if (i.account_name && p.accounts.length < 5) p.accounts.push(String(i.account_name))
        } else p.disconnected += 1
      }
      return out
    }
    for (const key of Object.keys(value)) {
      const found = summarizeIntegrations(value[key], depth + 1)
      if (found) return found
    }
  }
  return null
}

/** "Shopify, Meta Ads (2 accounts)" for connected platforms; [] when none. */
export function connectedPlatforms(platforms) {
  return Object.entries(platforms || {})
    .filter(([, p]) => p.connected > 0)
    .map(([key, p]) => (p.connected > 1 ? `${platformName(key)} (${p.connected} accounts)` : platformName(key)))
}

/** What a client still needs before Analify can answer its business questions. */
export function platformGaps(platforms) {
  const on = key => (platforms?.[key]?.connected || 0) > 0
  const gaps = []
  if (!on('shopify')) gaps.push('Shopify not connected in Analify')
  if (!AD_PLATFORMS.some(on)) gaps.push('no ad platform connected in Analify (Meta, TikTok, Google or Snapchat)')
  for (const [key, p] of Object.entries(platforms || {})) {
    if (p.connected === 0 && p.disconnected > 0) gaps.push(`${platformName(key)} disconnected, reconnect it in Analify`)
  }
  return gaps
}

/** Brand name guessed from a website: "https://www.caliego.com/shop" -> "Caliego". */
export function nameFromSite(site) {
  let host = String(site || '').trim()
  try {
    host = new URL(/^https?:\/\//i.test(host) ? host : `https://${host}`).hostname
  } catch {
    return ''
  }
  if (!host.includes('.')) return ''
  const parts = host.replace(/^www\./i, '').split('.')
  const base = parts[0] === 'shop' || parts[0] === 'store' ? parts[1] || parts[0] : parts[0]
  const label = base.replace(/[-_]+/g, ' ').trim()
  return label.replace(/\b\w/g, c => c.toUpperCase())
}
