---
name: import-clients
description: Create client folders for many brands at once from a CSV file (columns name, brand, site, shopify, meta).
argument-hint: "<clients.csv> [--autosave on|off]"
disable-model-invocation: true
allowed-tools: Bash(node *), Read
---

# Import clients from a CSV

1. If the user has no file yet, show this template and stop:
   ```
   name,brand,site,shopify,meta
   Caliego,Caliego,https://caliego.com,caliego.myshopify.com,act_1234567890
   ```
   `brand` is the Brand name in Analify (defaults to `name`). `shopify` and `meta` are optional notes used in the setup checklist.
2. Run from the agency folder:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" import $ARGUMENTS`
3. Report how many folders were created and list any rows that failed with the reason.
4. Give the per-client next steps in one short list: create the Brand in Analify (Agency → Clients), connect Shopify and Meta inside it, then open the client's folder in Claude Code and authenticate its connection in `/mcp`. Suggest doing them in batches of about ten, and asking each client for Shopify collaborator access first, because waiting on that is the slowest part.
