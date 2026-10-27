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
  woocommerce: 'WooCommerce',
  salla: 'Salla',
  easyorders: 'EasyOrders',
  amazon: 'Amazon',
}

export function platformName(key) {
  return PLATFORM_NAMES[key] || String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export const AD_PLATFORMS = ['meta_ads', 'tiktok_ads', 'google_ads', 'snapchat_ads']
export const STORE_PLATFORMS = ['shopify', 'woocommerce', 'salla', 'easyorders', 'amazon']

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
        const p = (out[i.platform] = out[i.platform] || { connected: 0, disconnected: 0, accounts: [], offAccounts: [] })
        if (i.status === 'connected') {
          p.connected += 1
          if (i.account_name && p.accounts.length < 5) p.accounts.push(String(i.account_name))
        } else {
          p.disconnected += 1
          if (i.account_name && p.offAccounts.length < 5) p.offAccounts.push(String(i.account_name))
        }
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
  if (!STORE_PLATFORMS.some(on)) gaps.push('no store connected in Analify (Shopify, WooCommerce, Salla, EasyOrders or Amazon), so no orders or real profit yet')
  if (!AD_PLATFORMS.some(on)) gaps.push('no ad platform connected in Analify (Meta, TikTok, Google or Snapchat)')
  for (const [key, p] of Object.entries(platforms || {})) {
    if (!p.disconnected) continue
    const names = p.offAccounts?.length ? ` (${p.offAccounts.join(', ')})` : ''
    if (p.connected === 0) gaps.push(`${platformName(key)} disconnected${names}: reconnect it in Analify`)
    else gaps.push(`${p.disconnected} of ${p.connected + p.disconnected} ${platformName(key)} accounts disconnected${names}: if any still runs, its numbers are missing from totals; reconnect it or remove it in Analify`)
  }
  return gaps
}

// Patterns removed from session records before they can leave the machine.
// A safety net, not a guarantee: names and street addresses aren't detectable.
const REDACTIONS = [
  [/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, '[private key removed]'],
  [/\b(?:sk|pk|rk|ghp|gho|github_pat|xox[abpr]|AKIA|AIza|ya29|shpat|shpca|shpss|EAA)[A-Za-z0-9_\-.]{12,}/g, '[key removed]'],
  [/\b(?:bearer|token|api[_-]?key|secret|password|passwd|pwd)\b\s*[:=]\s*\S+/gi, '[secret removed]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[token removed]'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email removed]'],
  // International (+20 100 123 4567, 0020…) and Egyptian mobile (01001234567).
  [/(?:\+|\b00)\d{1,3}[\s.-]?(?:\(?\d{1,4}\)?[\s.-]?){2,4}\d{2,4}\b/g, '[phone removed]'],
  [/\b01[0125][\s-]?\d{4}[\s-]?\d{4}\b/g, '[phone removed]'],
]

// Card numbers: 13–19 digits (spaces or dashes allowed) that pass the Luhn check.
const CARD = /\b\d(?:[ -]?\d){12,18}\b/g
function luhn(digits) {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2
    sum += d
  }
  return sum % 10 === 0
}

/** Remove emails, phone numbers, card numbers and key-like strings. */
export function redact(text) {
  let out = String(text || '')
  for (const [re, label] of REDACTIONS) out = out.replace(re, label)
  return out.replace(CARD, m => {
    const digits = m.replace(/\D/g, '')
    // Long digit runs without separators are usually ad-account or order ids;
    // only 15–16 digit runs (card length) are checked when unseparated.
    const cardShaped = /[ -]/.test(m) || digits.length === 15 || digits.length === 16
    return cardShaped && luhn(digits) ? '[card number removed]' : m
  })
}

/**
 * Did Analify accept this save? Reads the tool response: an error, a refusal,
 * a wrong-brand or capture-off answer is not a save; a duplicate is (it was
 * already in the Brain). Returns { ok, note }.
 */
export function saveResult(response) {
  const found = { error: null, outcome: null, note: null }
  // isText: a whole tool-result text block. Only a block that isn't JSON is
  // read as plain words; values inside JSON (like a note) are never errors.
  const visit = (v, depth = 0, isText = false) => {
    if (v == null || depth > 6) return
    if (typeof v === 'string') {
      const parsed = parseJson(v)
      if (parsed && typeof parsed === 'object') visit(parsed, depth + 1)
      else if (isText && /error|invalid|unauthori[sz]ed|forbidden|refused/i.test(v) && !found.error) found.error = v.slice(0, 200)
      return
    }
    if (Array.isArray(v)) return v.forEach(x => visit(x, depth + 1))
    if (typeof v === 'object') {
      if (v.isError === true && !found.error) found.error = 'tool error'
      if (v.error && !found.error) found.error = typeof v.error === 'string' ? v.error : v.error.message || v.error.code || 'error'
      if (typeof v.outcome === 'string' && !found.outcome) found.outcome = v.outcome
      if (typeof v.note === 'string' && !found.note) found.note = v.note
      for (const key of Object.keys(v)) if (key !== 'error') visit(v[key], depth + 1, key === 'text')
    }
  }
  visit(response, 0, typeof response === 'string')
  if (found.error) return { ok: false, note: String(found.error).slice(0, 200) }
  if (['refused', 'wrong_org', 'capture_off', 'rejected', 'failed'].includes(found.outcome)) {
    return { ok: false, note: `${found.outcome}${found.note ? `: ${found.note.slice(0, 160)}` : ''}` }
  }
  return { ok: true, note: null }
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
