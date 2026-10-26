---
name: clients
description: Show the setup checklist for every client in the Analify agency workspace — which are linked to Claude, which are missing Shopify or Meta, when each last saved to its Brain.
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Client checklist

1. Run from the agency folder:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" status`
2. Show the result as a short list: clients that are fully set up first in one line ("12 ready: …"), then each client still missing something with what's missing, in plain words.
3. Point at the next best action: the client closest to ready. Missing Shopify or Meta notes are recorded from the agency folder with `/analify:add-client "Name" --shopify <store> --meta <act_id>`; "not linked" is fixed by opening the client's folder in Claude Code and authenticating its connection in `/mcp`.
