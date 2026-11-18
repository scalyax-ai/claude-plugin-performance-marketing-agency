---
name: clients
description: Show the setup checklist for every client in the Analify agency workspace — which are linked to Claude, which are missing a store or ad account, when each last saved to its Business Brain.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, LS
---

# Client checklist

1. **Find the agency folder.** Starting from the current folder, go up one folder at a time until you find `.analify/agency.json` that reads as valid JSON. If there is none, say: "Not inside an agency folder. Run /analify:agency-setup in the folder that should hold all clients first." and stop.
2. **List the clients.** Look in `<agency>/<clientsDir>` (`clientsDir` from agency.json, default `Clients`). Every subfolder with a readable `.analify/client.json` is a client. Sort them by `name`. If there are none, say: "No clients yet. Add one with /analify:add-client." and stop.
3. **Work out what each client is missing.** Read its client.json. `bound`, `platforms` and `lastSavedAt` are written by `/analify:connect` and `/analify:save` in that client's folder.
   - No `bound`: "Claude not linked yet: open the folder in Claude Code and run /analify:connect".
   - `bound` set but no `platforms`: "connected platforms not checked yet: run /analify:connect in the folder".
   - `platforms` present (each platform key has `connected` and `disconnected` counts):
     - No store with `connected` above 0 (`shopify`, `woocommerce`, `salla`, `easyorders`, `amazon`): "no store connected in Analify (Shopify, WooCommerce, Salla, EasyOrders or Amazon), so no orders or real profit yet".
     - No ad platform with `connected` above 0 (`meta_ads`, `tiktok_ads`, `google_ads`, `snapchat_ads`): "no ad platform connected in Analify (Meta, TikTok, Google or Snapchat)".
     - Any platform with `disconnected` above 0: "reconnect <platform> in Analify" (name the accounts in `offAccounts` if there are any).
4. **Show the result as a short list.** Start with `<agency name>: <n> clients, <linked> linked to Claude.` (linked = clients with `bound`). Then the fully set-up clients in one line ("12 ready: …"). Then each client still missing something, with its connection name (`serverName`), the Brand it is linked to (`bound.name`, or "no"), what's connected, the last confirmed save (`lastSavedAt`, or "none yet"), and what's missing in plain words.
5. **Point at the next best action:** the client closest to ready.
   - Missing store or ad notes are recorded from the agency folder with `/analify:add-client "Name" --shopify <store> --meta <act_id>`.
   - Missing connections are added in Analify: https://analify.scalyax.ai/en/agency/clients.
   - "Not linked" is fixed by opening the client's folder in Claude Code and running `/analify:connect`.

This checklist only reads files. It never changes a client folder.
