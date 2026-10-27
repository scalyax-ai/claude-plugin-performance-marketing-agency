// Agency client folders: create the agency root, add or import clients, show
// setup status. Run by the /analify-agency:* skills; never touches the network.
//
//   node clients.mjs init   [--name "Agency name"]
//   node clients.mjs add    "<Client name>" [--brand "<Analify Brand>"] [--slug x]
//                           [--site url] [--shopify store.myshopify.com] [--meta act_123]
//                           [--autosave on|off]
//   node clients.mjs add-sites <url> [<url> ...]   (one client per website)
//   node clients.mjs rename "<name or website>" "<new name>" [--brand "<Analify brand>"]
//   node clients.mjs import <file.csv>      (columns: name,brand,site,shopify,meta)
//   node clients.mjs status [--json]
//   node clients.mjs open [agency|signup]    (opens Analify in the browser)

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  ANALIFY_MCP_URL,
  ANALIFY_APP_URL,
  AGENCY_FILE,
  CLIENT_FILE,
  findAgency,
  readJsonFile,
  writeJsonFile,
  slugify,
  nameFromSite,
  connectedPlatforms,
  platformGaps,
} from './lib.mjs'

export function listClients(agency) {
  const dir = path.join(agency.root, agency.config.clientsDir || 'Clients')
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter(e => e.isDirectory())
    .map(e => {
      const root = path.join(dir, e.name)
      return { root, config: readJsonFile(path.join(root, CLIENT_FILE)) }
    })
    .filter(c => c.config)
    .sort((a, b) => a.config.name.localeCompare(b.config.name))
}

export function initAgency(cwd, name) {
  const existing = findAgency(cwd)
  if (existing) return { created: false, agency: existing }
  const config = { name: name || path.basename(cwd), clientsDir: 'Clients', createdAt: new Date().toISOString() }
  writeJsonFile(path.join(cwd, AGENCY_FILE), config)
  fs.mkdirSync(path.join(cwd, 'Clients'), { recursive: true })
  return { created: true, agency: { root: cwd, config } }
}

export function addClient(agency, opts) {
  const name = String(opts.name || '').trim()
  if (!name) throw new Error('Client name is required.')
  const slug = opts.slug ? slugify(opts.slug) : slugify(name)
  if (!slug) throw new Error(`Can't make a folder id from "${name}". Pass --slug with Latin letters, e.g. --slug caliego.`)
  const serverName = `analify-${slug}`
  const clientsDir = path.join(agency.root, agency.config.clientsDir || 'Clients')
  const others = listClients(agency).filter(c => c.config.slug === slug && c.config.name !== name)
  if (others.length) throw new Error(`Another client already uses the id "${slug}" (${others[0].config.name}). Pass a different --slug.`)

  const root = path.join(clientsDir, name.replace(/[/\\:*?"<>|]/g, '-'))
  const configPath = path.join(root, CLIENT_FILE)
  const previous = readJsonFile(configPath)
  // Same name, different website: that's another business, not an update.
  if (previous?.site && opts.site && siteKey(previous.site) !== siteKey(opts.site) && !opts.updateSite) {
    throw new Error(`"${name}" already exists for ${previous.site}. Give this one a different name, or pass --update-site to change ${name}'s website.`)
  }
  const brand = String(opts.brand || previous?.brand || name).trim()
  const config = {
    name,
    brand,
    slug,
    serverName,
    agencyName: agency.config.name || null,
    site: opts.site ?? previous?.site ?? null,
    shopify: opts.shopify ?? previous?.shopify ?? null,
    meta: opts.meta ?? previous?.meta ?? null,
    autosave: opts.autosave != null ? opts.autosave : previous ? previous.autosave : true,
    // Changing the Brand means the old confirmation no longer applies.
    bound: previous && previous.brand === brand ? previous.bound || null : null,
    createdAt: previous?.createdAt || new Date().toISOString(),
  }
  writeJsonFile(configPath, config)

  const connection = registerConnection(root, serverName)

  fs.mkdirSync(path.join(root, 'reports'), { recursive: true })
  const claudeMd = path.join(root, 'CLAUDE.md')
  if (!fs.existsSync(claudeMd)) {
    fs.writeFileSync(
      claudeMd,
      `# ${name}\n\nAgency workspace for ${name} (Analify Brand "${brand}").\n\n` +
        `- Analify connection for this client: \`${serverName}\`. Never use another Analify connection here.\n` +
        `- Put audits and reports in \`reports/\` as Markdown or CSV so they can be added to ${brand}'s Brain.\n` +
        `- Add notes about how we work for this client below.\n`
    )
  }
  return { root, config, connection, updated: Boolean(previous) }
}

/** "https://www.Nour.com/shop" -> "nour.com": how two websites are compared. */
export function siteKey(site) {
  try {
    const url = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`)
    return url.hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return String(site || '').toLowerCase()
  }
}

/** A client name for a website that doesn't clash with another client's. */
export function uniqueSiteName(agency, site) {
  const base = nameFromSite(site)
  if (!base) return ''
  const taken = new Map(listClients(agency).map(c => [c.config.name.toLowerCase(), c.config]))
  const clash = n => {
    const other = taken.get(n.toLowerCase())
    return other && !(other.site && siteKey(other.site) === siteKey(site))
  }
  if (!clash(base)) return base
  const tld = siteKey(site).split('.').slice(1).join('.').toUpperCase()
  if (tld && !clash(`${base} ${tld}`)) return `${base} ${tld}`
  for (let i = 2; ; i++) if (!clash(`${base} ${i}`)) return `${base} ${i}`
}

/**
 * Rename a client: moves its folder and updates its name, keeping its
 * connection name, so the Analify sign-in carries over.
 */
export function renameClient(agency, from, to) {
  const newName = String(to || '').trim()
  if (!newName) throw new Error('New name is required.')
  const key = String(from || '').toLowerCase()
  const client = listClients(agency).find(
    c => c.config.name.toLowerCase() === key || c.config.slug === key || (c.config.site && siteKey(c.config.site) === siteKey(from))
  )
  if (!client) throw new Error(`No client called "${from}".`)
  if (listClients(agency).some(c => c !== client && c.config.name.toLowerCase() === newName.toLowerCase())) {
    throw new Error(`Another client is already called "${newName}".`)
  }
  const newRoot = path.join(path.dirname(client.root), newName.replace(/[/\\:*?"<>|]/g, '-'))
  if (newRoot !== client.root) {
    if (fs.existsSync(newRoot)) throw new Error(`A folder named "${path.basename(newRoot)}" already exists.`)
    fs.renameSync(client.root, newRoot)
  }
  const config = { ...client.config, name: newName }
  if (client.config.brand === client.config.name) config.brand = newName
  if (config.brand !== client.config.brand) config.bound = null
  writeJsonFile(path.join(newRoot, CLIENT_FILE), config)
  const connection = registerConnection(newRoot, config.serverName)
  return { root: newRoot, config, connection, from: client.config.name }
}

/**
 * The client's own Analify connection, only visible inside its folder.
 *
 * Preferred: Claude Code's local scope (`claude mcp add --scope local`), which
 * is tied to the folder on this machine and needs no approval prompt. Claude
 * Code keeps one sign-in per connection name, so every client has its own name.
 * Fallback when the `claude` command isn't on PATH: a project .mcp.json, which
 * Claude Code asks the user to approve once when the folder opens. The plugin
 * never writes Claude Code permission settings itself.
 */
function registerConnection(root, serverName) {
  if (!process.env.ANALIFY_NO_CLAUDE_CLI) {
    const r = spawnSync('claude', ['mcp', 'add', '--scope', 'local', '--transport', 'http', serverName, ANALIFY_MCP_URL], {
      cwd: root,
      encoding: 'utf8',
      timeout: 60_000,
    })
    if (r.status === 0 || /already exists/i.test(`${r.stdout}${r.stderr}`)) return 'local'
  }
  const mcpPath = path.join(root, '.mcp.json')
  const mcp = readJsonFile(mcpPath, { mcpServers: {} })
  mcp.mcpServers = mcp.mcpServers || {}
  for (const key of Object.keys(mcp.mcpServers)) {
    if (key.startsWith('analify-') && key !== serverName) delete mcp.mcpServers[key]
  }
  mcp.mcpServers[serverName] = { type: 'http', url: ANALIFY_MCP_URL }
  writeJsonFile(mcpPath, mcp)
  return 'project'
}

export function parseCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    const cells = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (ch === '"') quoted = false
        else cur += ch
      } else if (ch === '"') quoted = true
      else if (ch === ',') { cells.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cells.push(cur.trim())
    rows.push(cells)
  }
  if (!rows.length) return []
  const header = rows[0].map(h => h.toLowerCase())
  const hasHeader = header.includes('name')
  const cols = hasHeader ? header : ['name', 'brand', 'site', 'shopify', 'meta']
  return (hasHeader ? rows.slice(1) : rows).map(r => Object.fromEntries(cols.map((c, i) => [c, r[i] || ''])))
}

export function clientStatus(client) {
  const c = client.config
  const missing = []
  if (!c.bound) missing.push('Claude not linked yet: open the folder in Claude Code and run /analify-agency:connect')
  if (c.platforms) missing.push(...platformGaps(c.platforms))
  else if (c.bound) missing.push('connected platforms not checked yet: run /analify-agency:connect in the folder')
  // The last save Analify accepted (recorded from its answer), not a local file date.
  const lastSave = c.lastSavedAt || null
  return {
    name: c.name,
    brand: c.brand,
    site: c.site,
    folder: client.root,
    connection: c.serverName,
    linkedBrand: c.bound ? c.bound.name : null,
    connected: c.platforms ? connectedPlatforms(c.platforms) : null,
    autosave: c.autosave,
    lastSave,
    missing,
  }
}

/** Open a URL in the default browser; returns false when it can't. */
export function openUrl(url) {
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : ['xdg-open', [url]]
  const r = spawnSync(cmd, args, { stdio: 'ignore', timeout: 10_000 })
  return r.status === 0
}

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) out[key] = true
      else { out[key] = next; i++ }
    } else out._.push(a)
  }
  return out
}

function nextSteps(client) {
  const c = client.config
  return [
    `Client folder ready: ${client.root}`,
    `  Analify connection: ${c.serverName} (Brand "${c.brand}") · autosave ${c.autosave ? 'on' : 'off'}`,
    client.connection === 'project'
      ? `  (The claude command wasn't found, so the connection is in this folder's .mcp.json — approve it once when Claude Code asks.)`
      : null,
    `Next, for ${c.name}:`,
    `  1. In Analify (${ANALIFY_APP_URL}/en/agency/clients), open or add "${c.brand}" and connect its store and ad accounts: Shopify, Meta, TikTok, Google Ads, Snapchat, plus couriers if you use them.`,
    `  2. Open Claude Code in the client folder and run /analify-agency:connect. It signs Claude in to "${c.brand}" and reads what's connected.`,
  ]
    .filter(Boolean)
    .join('\n')
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  const args = parseArgs(rest)
  const cwd = process.cwd()
  const autosave = args.autosave === undefined ? undefined : !/^(off|false|no|0)$/i.test(String(args.autosave))

  if (cmd === 'init') {
    const { created, agency } = initAgency(cwd, typeof args.name === 'string' ? args.name : undefined)
    console.log(created ? `Agency folder created: ${agency.root} (${agency.config.name}). Clients go in ${path.join(agency.root, 'Clients')}.` : `Already an agency folder: ${agency.root} (${agency.config.name}).`)
    return
  }

  const agency = findAgency(cwd)
  if (!agency) {
    console.error('Not inside an agency folder. Run /analify-agency:agency-setup in the folder that should hold all clients first.')
    process.exit(1)
  }

  if (cmd === 'add') {
    const client = addClient(agency, { name: args._.join(' '), brand: args.brand, slug: args.slug, site: args.site, shopify: args.shopify, meta: args.meta, autosave, updateSite: Boolean(args['update-site']) })
    console.log(nextSteps(client))
    return
  }

  if (cmd === 'add-sites') {
    const sites = args._.flatMap(a => a.split(/[\s,]+/)).filter(Boolean)
    if (!sites.length) { console.error('Usage: add-sites <website> [<website> ...]'); process.exit(1) }
    for (const site of sites) {
      const name = uniqueSiteName(agency, site)
      if (!name) { console.log(`✗ ${site}: not a website address`); continue }
      try {
        const client = addClient(agency, { name, site: /^https?:/i.test(site) ? site : `https://${site}`, autosave })
        console.log(`✓ ${client.config.name} (${site}) → folder ${path.relative(agency.root, client.root)}, connection ${client.config.serverName}${client.updated ? ' (updated)' : ''}`)
      } catch (e) {
        console.log(`✗ ${site}: ${e.message}`)
      }
    }
    return
  }

  if (cmd === 'rename') {
    const [from, to] = args._
    if (!from || !to) { console.error('Usage: rename "<current name or website>" "<new name>" [--brand "<Analify brand>"]'); process.exit(1) }
    const r = renameClient(agency, from, to)
    if (typeof args.brand === 'string') addClient(agency, { name: r.config.name, brand: args.brand, slug: r.config.slug })
    console.log(`✓ ${r.from} → ${r.config.name} (folder ${path.relative(agency.root, r.root)}, connection ${r.config.serverName} kept)`)
    return
  }

  if (cmd === 'open') {
    const target = args._[0] === 'signup' ? `${ANALIFY_APP_URL}/en/signup` : `${ANALIFY_APP_URL}/en/agency/clients`
    console.log(openUrl(target) ? `Opened ${target}` : `Open this in your browser: ${target}`)
    return
  }

  if (cmd === 'import') {
    const file = args._[0]
    if (!file) { console.error('Usage: import <file.csv>'); process.exit(1) }
    const rows = parseCsv(fs.readFileSync(path.resolve(cwd, file), 'utf8'))
    let ok = 0
    for (const row of rows) {
      try {
        const client = addClient(agency, { ...row, autosave })
        ok++
        console.log(`✓ ${client.config.name} → ${client.config.serverName}${client.updated ? ' (updated)' : ''}`)
      } catch (e) {
        console.log(`✗ ${row.name || '(no name)'}: ${e.message}`)
      }
    }
    console.log(`\n${ok} of ${rows.length} client folders ready in ${path.join(agency.root, agency.config.clientsDir || 'Clients')}.`)
    console.log(`Next for each: open or add the Brand in ${ANALIFY_APP_URL}/en/agency/clients and connect its accounts, then open the client's folder in Claude Code and run /analify-agency:connect.`)
    return
  }

  if (cmd === 'status') {
    const rows = listClients(agency).map(clientStatus)
    if (args.json) { console.log(JSON.stringify(rows, null, 2)); return }
    if (!rows.length) { console.log('No clients yet. Add one with /analify-agency:add-client.'); return }
    const linked = rows.filter(r => r.linkedBrand).length
    console.log(`${agency.config.name}: ${rows.length} clients, ${linked} linked to Claude.\n`)
    for (const r of rows) {
      console.log(`${r.missing.length ? '•' : '✓'} ${r.name}  [${r.connection}]  linked: ${r.linkedBrand || 'no'} · connected: ${r.connected ? r.connected.join(', ') || 'nothing' : 'not checked'} · autosave ${r.autosave ? 'on' : 'off'} · last confirmed save ${r.lastSave || 'none yet'}`)
      for (const m of r.missing) console.log(`    - ${m}`)
    }
    return
  }

  console.error('Commands: init | add | add-sites | rename | import | status | open')
  process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
