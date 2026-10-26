---
name: agency-setup
description: Turn the current folder into an Analify agency workspace that holds one folder per client brand. Run once, in the folder where all client folders should live.
argument-hint: "[agency name]"
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Set up the agency workspace

1. Run:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" init --name "$ARGUMENTS"`
   (If no agency name was given, drop `--name` and ask the user for it afterwards only if it matters.)
2. Tell the user, in plain words:
   - Each client gets its own folder under `Clients/`, with its own Analify connection. Claude opened in a client's folder only sees that client.
   - Next: add clients one by one with `/analify-agency:add-client "Client name"`, or all at once with `/analify-agency:import-clients clients.csv` (columns: name, brand, site, shopify, meta).
   - Brain autosave is on by default for every client: research, audits and decisions made in a client's folder are saved to that client's own Analify Brain. It can be turned off per client with `--autosave off`.
3. Check `node --version` works (Node 18 or newer). The hooks need it; if it is missing, tell the user to install Node.js from nodejs.org.
