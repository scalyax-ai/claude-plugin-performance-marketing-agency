---
name: rename-client
description: Rename a client in the Analify agency workspace (fix a name made from a website, or match the brand's real name). Moves its folder and keeps its Analify connection and sign-in.
argument-hint: "\"<current name, id or website>\" \"<new name>\" [--brand \"<Analify brand name>\"]"
disable-model-invocation: true
---

# Rename a client

Arguments: the current name, id or website, then the new name, then optionally `--brand "<name>"` when the brand is called something else in Analify. If either name is missing, show the usage line (`/analify:rename-client "<current name, id or website>" "<new name>" [--brand "<Analify brand name>"]`) and stop. Write every JSON file with 2-space indent and a trailing newline, and ask the user before you write or move anything.

1. **Find the agency.** Walk up from the current folder to the first folder holding `.analify/agency.json` that reads as valid JSON. If none: "Not inside an agency folder. Run /analify:agency-setup in the folder that should hold all clients first." Clients live in `<agency>/<clientsDir>/` (`clientsDir` from that file, default `Clients`); each client is a subfolder with a readable `.analify/client.json`.
2. **Find the client.** Match the first argument against each client's `name` (ignoring case), its `slug`, or its website (compare host names, lowercase, without `https://` or a leading `www.`). If none: `No client called "<from>".`
3. **Check the new name.** Trim it; if empty: "New name is required." If another client already has that name (ignoring case): `Another client is already called "<new>".` The new folder name is the new name with each of `/ \ : * ? " < > |` turned into `-`. If that folder already exists and is not this client's folder: `A folder named "<x>" already exists.`
4. **Move the folder** to the new folder name in the same clients folder. If you can't move it with your tools, ask the user to rename it in Finder or File Explorer and wait until they confirm.
5. **Update `.analify/client.json`** in the moved folder:
   - `name` = the new name.
   - If `brand` equalled the old name, `brand` = the new name. If `--brand` was given, `brand` = that (trimmed).
   - If `brand` changed, set `bound` to `null` (Claude must confirm the brand again).
   - Keep `slug`, `serverName` and every other field as they are. The connection name never changes.
6. **Keep the connection.** The folder's `.mcp.json` moves with it. Make sure it still holds the client's connection: keep any keys that don't start with `analify-`, drop other `analify-` keys, and set
   `"<serverName>": { "type": "http", "url": "https://analify-mcp.scalyax.ai/" }` under `mcpServers`. Claude Code may ask the user to approve it again when the renamed folder is opened.
7. **Report in one line:** `✓ <old> → <new> (folder <path from the agency>, connection <serverName> kept)`. Then:
   - The folder's `CLAUDE.md` still shows the old name and brand. Offer to update those lines; don't change the rest, the agency owns that file.
   - If the brand changed, run `/analify:connect` in the renamed folder to confirm the right brand.
   - If the client's folder is open in another Claude Code session, close it and open the renamed folder instead.
