---
name: add-client
description: Add one client brand to the Analify agency workspace — creates its folder and its own Analify connection, then gives the exact setup steps.
argument-hint: "\"Client name\" [--brand \"Analify Brand name\"] [--shopify store.myshopify.com] [--meta act_123] [--autosave on|off]"
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Add a client

1. Run, from the agency folder (where `/analify-agency:agency-setup` was run):
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" add $ARGUMENTS`
   Quote a client name with spaces. If the script says the folder id can't be made (for example an Arabic-only name), rerun with `--slug <latin-name>`.
2. Show the user the "Next" steps the script printed, as a short numbered list. Keep the exact Brand name and connection name.
3. Then, in the client's folder, `/analify-agency:connect` signs Claude in and reads what's connected. Remind them: the Brand name picked on the Analify sign-in screen must be the one in this folder. If they pick another business by mistake, the plugin blocks every Analify call in that folder and says how to fix it.
