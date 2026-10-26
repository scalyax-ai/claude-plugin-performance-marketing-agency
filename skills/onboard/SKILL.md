---
name: onboard
description: Onboard a performance marketing agency onto Analify in Claude Code — agency name, every client's website, one folder and one Analify connection per client, then connecting each client's Shopify, Meta, TikTok, Google Ads and Snapchat accounts in Analify. Start here.
argument-hint: "[agency name]"
disable-model-invocation: true
allowed-tools: Bash(node *), Read, Write
---

# Onboard the agency

Walk the agency through this one step at a time. Short messages, plain words, one question at a time. Run every script from the folder the user is in (it becomes the agency folder).

## Step 1 — The agency
If `$ARGUMENTS` is empty, ask: "What's your agency called?" Then run:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" init --name "<agency name>"`
Tell them this folder now holds all their clients, one folder each. Then ask them to turn on auto-update once, so new versions of this plugin reach them on their own: `/plugin` → **Marketplaces** → **scalyax** → **Enable auto-update** (a plugin can't switch this on itself; an organization owner can switch it on for the whole team, see the README).

## Step 2 — The clients
Ask: "Paste your clients' website addresses, one per line (or the path to a CSV with columns name,brand,site,shopify,meta)."
- Websites: `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" add-sites <url> <url> ...`
- CSV: `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" import <file.csv>`
Show the list of clients created. Two websites with the same name (nour.com and nour.ae) become two clients ("Nour" and "Nour AE"). Ask if any name is wrong; fix it with `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" rename "<current name or website>" "<right name>"`, adding `--brand "<Analify brand name>"` if the brand is named differently in Analify. Renaming keeps the client's connection and sign-in.

## Step 3 — Connect each client's accounts in Analify
Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" open` to open Analify's Agency → Clients page (no Analify account yet: `open signup`). Then tell them, for each client:
1. Open or add the client's brand in Analify. Agency is in beta; if the agency view isn't on their account, they can use brands their Analify account already belongs to, or ask Analify to switch Agency on.
2. In that brand, connect what the client runs: **Shopify**, **Meta Ads**, **TikTok Ads**, **Google Ads** (beta), **Snapchat Ads**, **Google Analytics** (beta), and couriers such as **Bosta**.
3. Shopify asks the store to install the Analify app, so ask each client for Shopify collaborator access first; that wait is usually the slowest part.
Suggest batches of about ten clients.

## Step 4 — Connect Claude to each client
For each client: open Claude Code in that client's folder (terminal: `cd "Clients/<Name>" && claude`; desktop app: open the folder as a new session) and run `/analify-agency:connect`. It signs in to that client's brand and reads what's connected, so the plugin works with exactly what each client has.

## Step 5 — Check progress
`node "${CLAUDE_PLUGIN_ROOT}/scripts/clients.mjs" status` — show who is ready and, for the rest, the one next thing each needs. Remind them they can run `/analify-agency:clients` any time.

Never create Analify accounts, enter passwords or click anything in Analify for the user: they do the connecting in their browser.
