---
name: onboard
description: Onboard a performance marketing agency onto Analify in Claude Code — agency name, every client's website, one folder and one Analify connection per client, then connecting each client's Shopify, Meta, TikTok, Google Ads and Snapchat accounts in Analify. Start here.
argument-hint: "[agency name]"
disable-model-invocation: true
allowed-tools: Read, Glob, LS
---

# Onboard the agency

Walk the agency through this one step at a time. Short messages, plain words, one question at a time. The folder the user is in becomes the agency folder. You create every folder and file yourself with your normal tools; the user approves each write. Write every JSON file with 2-space indent and a trailing newline.

## Names you'll need
- **Agency marker:** `.analify/agency.json`. **Client marker:** `.analify/client.json`.
- **Client id (slug):** from the client name: drop accents ("Café" → "cafe"), lowercase, turn every run of other characters into `-`, trim `-` from both ends, keep at most 40 characters. "Café Nour!" → `cafe-nour`. If nothing is left (an Arabic-only name, for example), ask the user for a short Latin id such as `caliego`.
- **Connection name:** `analify-<slug>`. It never changes, not even on rename.
- **Folder name:** the client name with each of `/ \ : * ? " < > |` turned into `-`. Spaces and capitals stay.
- **Name from a website:** take the host without `www.` (it must contain a dot). Use the first part, or the second when the first is `shop` or `store`. Turn `-` and `_` into spaces and capitalise each word. `https://www.caliego.com/shop` → "Caliego".

## Step 1 — The agency
1. Look for `.analify/agency.json` in this folder and every folder above it. If one exists, say "Already an agency folder: <path> (<name>)" and go to Step 2.
2. Otherwise, if `$ARGUMENTS` is empty, ask: "What's your agency called?" Then write `.analify/agency.json`:
   `{ "name": "<agency name>", "clientsDir": "Clients", "createdAt": "<ISO time now>" }`
   and create the empty `Clients/` folder.
3. Tell them this folder now holds all their clients, one folder each, under `Clients/`. Suggest turning on auto-update for this plugin once: `/plugin` → **Marketplaces** → the marketplace they installed from → **Enable auto-update**.

## Step 2 — The clients
Ask: "Paste your clients' website addresses, one per line (or the path to a CSV with columns name,brand,site,shopify,meta)."

**Websites.** Split on spaces, commas and new lines. For each one, work out the name from the website. If another client already has that name for a different website, add the country ending in capitals ("nour.ae" → "Nour AE"); if that is taken too, use "Nour 2", "Nour 3" and so on. Then add the client (below) with `site` set to the address, adding `https://` if it has none. Skip anything that isn't a website and say so; one bad line never stops the rest.

**CSV.** Read the file. If the first row contains `name`, it's the header; otherwise the columns are `name,brand,site,shopify,meta`. Add one client per row. No file yet? Show this template:
```
name,brand,site,shopify,meta
Caliego,Caliego,https://caliego.com,caliego.myshopify.com,act_1234567890
```

**Adding one client** (running it again for the same name updates that client in place):
1. If another client already uses the same id with a different name, ask for a different id.
2. The folder is `Clients/<Folder name>/`. If it already has a client.json for a different website, ask whether this is a new client (give it another name) or a website change.
3. Write `.analify/client.json` with exactly these keys, keeping earlier values when the folder already existed:
   ```json
   { "name": "...", "brand": "<brand, or earlier brand, or name>", "slug": "...",
     "serverName": "analify-<slug>", "agencyName": "<agency name>",
     "site": null, "shopify": null, "meta": null,
     "bound": null, "createdAt": "<earlier createdAt, or now>" }
   ```
   `site` is the website (`https://` added if it has none); `site`, `shopify` and `meta` otherwise keep their earlier value, else `null`. Keep the earlier `bound` only when the brand did not change. Other earlier fields (`platforms`, `lastSavedAt`) are dropped; `/analify:connect` and `/analify:save` fill them in again.
4. Write `.mcp.json` in the client folder with this client's connection. Keep any server whose name doesn't start with `analify-`, and remove other `analify-` entries:
   ```json
   { "mcpServers": { "analify-<slug>": { "type": "http", "url": "https://analify-mcp.scalyax.ai/" } } }
   ```
   Claude Code asks once to approve it the first time that folder is opened. Never write Claude Code permission settings.
5. Create an empty `reports/` folder. Write `CLAUDE.md` only if the folder doesn't have one yet (after that it belongs to the agency):
   ```
   # <name>

   ANALIFY AGENCY WORKSPACE — client: <name> (Analify Brand "<brand>"). Follow the analify:agency-workspace skill.

   - This folder is for <name> only. Use only the `mcp__analify-<slug>__` tools for Analify. Every other Analify connection on this computer belongs to a different business: never use it here, and never bring another client's numbers or notes into this folder.
   - Before any other Analify call, call `analify_brain_session_start` on `analify-<slug>`. If it names a Brand other than "<brand>", stop and tell the user to reconnect: run /mcp, pick analify-<slug>, clear authentication, sign in again and choose <brand>.
   - Put finished audits and reports in `reports/` as Markdown or CSV. Only `reports/` is shared with <brand>'s Brain; agency-only notes go in `private/`.
   - Save findings, decisions and reports to <brand>'s Brain when the user asks (see /analify:save).

   ## How we work for this client

   (Add notes here.)
   ```

Show the list: "✓ <name> (<site>) → folder Clients/<Folder name>, connection analify-<slug>" (add "(updated)" for a client that already existed), or "✗ <site>: not a website address". Two websites with the same name (nour.com and nour.ae) become two clients ("Nour" and "Nour AE"). Ask if any name is wrong.

**Fixing a name.** Find the client by name, id or website. Stop if another client already has the new name or a folder with that name exists. Rename the folder, set `name` to the new name, and change `brand` too if it matched the old name (or set the brand they give you if Analify calls it something else). If the brand changed, set `bound` to null. Keep the id and connection name, so the connection and sign-in carry over. The folder's CLAUDE.md still shows the old name: offer to update it, since it's theirs.

## Step 3 — Connect each client's accounts in Analify
Give them the link: https://analify.scalyax.ai/en/agency/clients (no Analify account yet: https://analify.scalyax.ai/en/signup). Then, for each client:
1. Open or add the client's brand in Analify. Agency is in beta; if the agency view isn't on their account, they can use brands their Analify account already belongs to, or ask Analify to switch Agency on.
2. In that brand, connect what the client runs: **Shopify**, **Meta Ads**, **TikTok Ads**, **Google Ads** (beta), **Snapchat Ads**, **Google Analytics** (beta), and couriers such as **Bosta**.
3. Shopify asks the store to install the Analify app, so ask each client for Shopify collaborator access first; that wait is usually the slowest part.
Suggest batches of about ten clients.

## Step 4 — Connect Claude to each client
For each client: open Claude Code in that client's folder (terminal: `cd "Clients/<Name>" && claude`; desktop app: open the folder as a new session), approve the Analify connection when asked, and run `/analify:connect`. It signs in to that client's brand and reads what's connected.

## Step 5 — Check progress
Read every `Clients/*/.analify/client.json` and show one line per client: name, connection name, and the next thing it needs. If it has no `bound` yet, the next step is "open the folder in Claude Code and run /analify:connect". Missing store or ad accounts are fixed in Analify (Step 3). They can run `/analify:clients` for this checklist any time.

Never create Analify accounts, enter passwords or click anything in Analify for the user: they do the connecting in their browser.
