---
name: rename-client
description: Rename a client in the Analify agency workspace (fix a name made from a website, or match the brand's real name). Moves its folder and keeps its Analify connection and sign-in.
argument-hint: "\"<current name or website>\" \"<new name>\" [--brand \"<Analify brand name>\"]"
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Rename a client

Run from the agency folder:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" rename $ARGUMENTS`

Quote names with spaces. Add `--brand "<name>"` when the brand is called something else in Analify; the plugin then checks the connection against that brand the next time the client's folder is opened. Say in one line what was renamed and that the connection and sign-in were kept. If the client's folder is open in another Claude Code session, tell the user to close it and open the renamed folder instead.
