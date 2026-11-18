---
name: add-client
description: Add one client brand to the Analify agency workspace — creates its folder and its own Analify connection, then gives the exact setup steps.
argument-hint: "\"Client name\" [--brand \"Analify Brand name\"] [--slug id] [--site https://...] [--shopify store.myshopify.com] [--meta act_123] [--update-site]"
disable-model-invocation: true
---

# Add a client

You do every step yourself with your normal file tools. Write every JSON file with 2-space indent and a trailing newline, and create parent folders as needed. The user approves each write.

1. **Find the agency.** Walk up from the current folder to the first one holding `.analify/agency.json` that reads as valid JSON. That folder is the agency; `clientsDir` in that file (default `Clients`) holds the clients. If there is none, say: "Not inside an agency folder. Run /analify:agency-setup in the folder that should hold all clients first." and stop.
2. **Check the name.** Trim it. If it is empty, say "Client name is required." and stop.
3. **Make the id (slug)** from `--slug`, or else the name: drop accents (é → e), lowercase, turn each run of anything that is not a-z or 0-9 into `-`, trim `-` from both ends, keep at most 40 characters. "Café Nour!" becomes `cafe-nour`. If it comes out empty (an Arabic-only name, say), stop: `Can't make a folder id from "<name>". Pass --slug with Latin letters, e.g. --slug caliego.` The connection name is `analify-<slug>`, and it never changes later, not even on rename.
4. **Avoid clashes.** Read every `<agency>/<clientsDir>/*/.analify/client.json`. If another client has this slug but a different name, stop: `Another client already uses the id "<slug>" (<other name>). Pass a different --slug.`
5. **Pick the folder:** `<agency>/<clientsDir>/<folder name>`, where the folder name is the client name with each of `/ \ : * ? " < > |` replaced by `-` (spaces and case stay). If it already has a `.analify/client.json`, that is `previous`. If `previous.site` and `--site` are both set, point to different websites (compare the hostname, lowercased, without a leading `www.`), and `--update-site` was not given, stop: `"<name>" already exists for <previous.site>. Give this one a different name, or pass --update-site to change <name>'s website.`
6. **Write `.analify/client.json`** with exactly these keys, in this order:
   ```json
   { "name": "<name>", "brand": "<brand>", "slug": "<slug>", "serverName": "analify-<slug>",
     "agencyName": "<agency name or null>", "site": null, "shopify": null, "meta": null,
     "bound": null, "createdAt": "<ISO time>" }
   ```
   - `brand` = `--brand`, else `previous.brand`, else the name (trimmed).
   - `site`, `shopify`, `meta` = the flag if given, else the previous value, else `null`.
   - `bound` = `previous.bound` only when `previous.brand` equals the new brand, else `null`.
   - `createdAt` = `previous.createdAt`, else now.
   - `name`, `slug`, `serverName` and `agencyName` are always set fresh. Other fields from an earlier file (`platforms`, `lastSavedAt`) are not carried over; `/analify:connect` and `/analify:save` fill them in again.
7. **Add the connection.** Read or create `.mcp.json` in the client folder. Remove any other `mcpServers` entry whose key starts with `analify-`, keep every other key, and set:
   ```json
   { "mcpServers": { "analify-<slug>": { "type": "http", "url": "https://analify-mcp.scalyax.ai/" } } }
   ```
   Claude Code asks the user to approve this connection once, the first time they open the folder. Only this folder sees it. Never change Claude Code permission settings.
8. **Create an empty `reports/` folder.** Write `CLAUDE.md` only if the folder has none yet: an existing one belongs to the agency and is never overwritten. Use this text, filling in the name, Brand and connection name:

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

9. **Tell the user what's next.** Keep the exact Brand and connection names:
   - "Client folder ready: <folder>. Analify connection: analify-<slug> (Brand "<brand>")."
   - 1. In Analify (https://analify.scalyax.ai/en/agency/clients), open or add "<brand>" and connect its store and ad accounts: Shopify, Meta, TikTok, Google Ads, Snapchat, plus couriers if they use them.
   - 2. Open Claude Code in the client folder, approve the `analify-<slug>` connection, and run /analify:connect. It signs Claude in to "<brand>" and reads what's connected.
   - Remind them: the Brand picked on the Analify sign-in screen must be the one for this folder. Claude checks this before any other Analify step and says how to fix it if the wrong business was picked.

Running this again with the same name updates the client in place, so it is safe to repeat.
