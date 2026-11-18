---
name: import-clients
description: Create client folders for many brands at once from a CSV file (columns name, brand, site, shopify, meta).
argument-hint: "<clients.csv>"
disable-model-invocation: true
allowed-tools: Read, Glob, LS
---

# Import clients from a CSV

You do all the folder and file work yourself with your normal tools. Ask the user once before writing, showing how many client folders you will create or update.

1. **No file yet?** Show this template and stop:
   ```
   name,brand,site,shopify,meta
   Caliego,Caliego,https://caliego.com,caliego.myshopify.com,act_1234567890
   ```
   `brand` is the Brand name in Analify (defaults to `name`). `shopify` and `meta` are optional notes for the setup checklist.
2. **Find the agency.** Walk up from the current folder to the first one holding `.analify/agency.json` that reads as valid JSON. Clients live in `<agency>/<clientsDir>` (`clientsDir` from that file, default `Clients`). If there is none, say: "Not inside an agency folder. Run /analify:agency-setup in the folder that should hold all clients first." and stop.
3. **Read the CSV.** Skip blank lines. Split cells on commas outside quotes (`""` inside quotes is a literal quote), trim each cell. If the first row, lowercased, contains `name`, it is the header; otherwise the columns are `name,brand,site,shopify,meta`. Missing cells are empty.
4. **For each row, create or update the client** (one bad row never stops the rest):
   - **Checks.** Name trimmed must not be empty ("Client name is required."). Slug = the name (lowercase, accents removed, each run of non `a-z0-9` characters turned into `-`, `-` trimmed from both ends, cut to 40 characters); if empty: `Can't make a folder id from "<name>". Use a name with Latin letters.` If another client (any subfolder of the clients folder with a readable `.analify/client.json`) has the same slug but a different name: `Another client already uses the id "<slug>" (<other name>).`
   - **Folder** = `<agency>/<clientsDir>/<name>`, with each of `/ \ : * ? " < > |` replaced by `-`. If a `client.json` is already there, it is `previous`. If both `previous.site` and the row's `site` are set and point to different hosts (lowercase, ignore `https://` and `www.`), fail the row: `"<name>" already exists for <previous.site>. Give this one a different name, or change <name>'s website with /analify:add-client.`
   - **Write `.analify/client.json`** (2-space indent, trailing newline), keys in this order:
     ```json
     { "name": "<name>", "brand": "<brand>", "slug": "<slug>", "serverName": "analify-<slug>",
       "agencyName": "<agency name or null>", "site": null, "shopify": null, "meta": null,
       "bound": null, "createdAt": "<ISO time>" }
     ```
     `brand` = the row's brand, else `previous.brand`, else the name. `site`, `shopify`, `meta` = the row's cell (an empty cell is kept as `""`), else the previous value, else `null`. `bound` = `previous.bound` only if the brand did not change, else `null`. `createdAt` = `previous.createdAt`, else now.
   - **Connection.** In the client folder, read or create `.mcp.json`, remove any other `mcpServers` key starting with `analify-`, keep all other keys, and set:
     ```json
     { "mcpServers": { "analify-<slug>": { "type": "http", "url": "https://analify-mcp.scalyax.ai/" } } }
     ```
     Claude Code asks the user to approve it once when the folder is opened. Never write Claude Code permission settings.
   - **Create `reports/`.** Write `CLAUDE.md` only if the folder has none. Never overwrite an existing one: the agency owns it. Template (fill in name, brand and `analify-<slug>`):
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
   - Note `✓ <name> → analify-<slug>` (add ` (updated)` if `previous` existed) or `✗ <name or (no name)>: <reason>`.
5. **Report** the per-row lines, then:
   ```
   <ok> of <total> client folders ready in <agency>/<clientsDir>.
   ```
   Running the import again with the same file updates clients in place, so it is safe to repeat.
6. **Next steps for each client**, in one short list: open or add the Brand in Analify (https://analify.scalyax.ai/en/agency/clients) and connect its store and ad accounts there (Shopify, Meta, TikTok, Google Ads, Snapchat, couriers), then open the client's folder in Claude Code, approve its connection and run `/analify:connect`. Suggest doing them in batches of about ten, and asking each client for Shopify collaborator access first, because waiting on that is the slowest part.

Never create Analify accounts, enter passwords or click anything in Analify for the user.
