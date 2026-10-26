# Analify for Performance Marketing Agencies

**Every client in Claude Code. Never mixed up. Never starting from zero.**

You run ads for many ecommerce brands. Claude can do the audit, the analysis and the Monday report. But every chat starts blank, and one wrong connection puts one client's numbers into another client's work.

This plugin gives every client brand its own folder in Claude Code, with its own live connection to that brand's Shopify, Meta and TikTok data in Analify. Open Caliego's folder and Claude works on Caliego only. What your team works out there (the audit, the finding, the decision) is saved to Caliego's Business Brain, so next week starts where you stopped, even when the account manager changes.

Keep your Claude. Give it every client, one at a time.

## What changes for your agency

- **One folder per client.** Add clients one by one, or your whole list at once from a CSV.
- **No client's numbers in another client's work.** Inside a client's folder, every other Analify connection is blocked. The client's own connection stays blocked until Analify confirms it is signed in to that client's brand.
- **The work stays with the client.** After real work, Claude saves what it learned to that client's Business Brain:
  - findings, with the data behind them
  - decisions and client rules
  - your reports
  - a session record the client's founder can review

  Everything is labelled with your agency's name and the date. The founder's own rules always rank above yours.
- **Walk into every client call already knowing the story.** `/analify-agency:brief` gives a morning brief for the client whose folder you're in:
  - yesterday's real profit after ads, shipping, product costs and returns
  - the ads that need attention
  - what's missing
- **See who's ready.** `/analify-agency:clients` lists every client: linked to Claude or not, Shopify and Meta recorded, last save.

## Who it's for

- Performance marketing agencies, and in-house teams, running several ecommerce brands in [Analify](https://analify.scalyax.ai).
- Running one brand? You don't need this plugin. Connect Analify to Claude directly: https://analify-ai.readme.io/docs/mcp

## Install

In Claude Code:

```
/plugin install analify-agency --marketplace scalyax-ai/analify-claude-plugin
```

Or from your shell:

```bash
claude plugin marketplace add scalyax-ai/analify-claude-plugin
claude plugin install analify-agency@scalyax
```

If you installed the earlier `analify` plugin from this marketplace, Claude Code moves you to `analify-agency` automatically.

## Set up your clients

1. In the folder that will hold all your clients: `/analify-agency:agency-setup "Your agency name"`
2. Add clients:
   - one at a time: `/analify-agency:add-client "Caliego" --shopify caliego.myshopify.com --meta act_123`
   - or all at once: `/analify-agency:import-clients clients.csv`, with columns `name,brand,site,shopify,meta`
3. For each client:
   1. In Analify, make sure the client's brand exists and has Shopify and Meta connected.
   2. Open Claude Code in the client's folder and run `/mcp`.
   3. Choose `analify-<client>` → Authenticate, pick that client's brand, and tick **Allow changes**. Saving to the Brain needs it, and Claude still asks before it changes any ad or price.
4. Run `/analify-agency:clients` to see who is ready and what each client is still missing.

Tip: ask each client for Shopify collaborator access first. Waiting on those approvals is usually the slowest part.

## Daily work

Open the client's folder and work as you normally do.

| Command | What it does |
| :- | :- |
| `/analify-agency:brief` | Morning brief for this client |
| `/analify-agency:save` | Save something to this client's Brain right now: a finding, a decision, a client rule, a report |
| `/analify-agency:clients` | Setup checklist across all clients (run it in the agency folder) |
| `/analify-agency:add-client` | Add a client, or update its brand, Shopify or Meta details |
| `/analify-agency:import-clients` | Add many clients from a CSV |

Put finished audits and reports in the client's `reports/` folder as Markdown or CSV, and they go to that client's Brain at the next save. To turn saving off for a client, run `/analify-agency:add-client "Name" --autosave off`.

## Good to know

- Works in Claude Code: terminal, IDE extensions and the desktop app's Code tab. Needs Node.js 18 or newer.
- The plugin doesn't connect Shopify or Meta for you. Each store still installs the Analify app, and each brand connects its ad accounts in Analify.
- Analify's Agency portfolio (all clients in one view in the Analify app) is in beta: request access in Analify. This plugin works with any brands your Analify account can open.
- A client's connection is tied to its folder on your computer. If you move the folder or switch computers, run `/analify-agency:add-client` for that client again. Your sign-in carries over.

## What runs on your machine

- **Hooks**, small Node.js scripts. They do nothing outside folders created by `/analify-agency:agency-setup` and `/analify-agency:add-client`, and they make no network calls.
  - **Session start:** tells Claude which client the folder is for.
  - **Before each Analify call:** blocks connections that belong to other businesses.
  - **After each call:** notes which brand the connection is signed in to and how much client work was done.
  - **At the end of a turn:** writes a session record into the folder's `.analify/sessions/` and, after real work, asks Claude to save to the client's Brain. To write that record, it reads the current session's transcript.
- **Setup script** (`scripts/clients.mjs`):
  - creates the client folders
  - registers each client's connection with Claude Code's own `claude mcp add --scope local`, which saves it in your Claude Code settings for that folder only
  - if the `claude` command isn't available, writes a `.mcp.json` in the client folder instead, and Claude Code asks you to approve it once

## Data and permissions

- **Where data goes:** only to `https://analify-mcp.scalyax.ai` (Analify, operated by Scalyax), through the tool calls Claude makes. You see every call in the session.
- **What comes back:** figures from the client's connected Shopify, Meta Ads, TikTok Ads and courier accounts, read with the access the client gave Analify.
- **Read-only unless you allow changes** on the Analify sign-in screen. Changes to ads, budgets or prices happen only after you approve the exact action.
- **What is saved to a client's Brain:** findings, decisions, client rules, reports and session records from that client's folder, while autosave is on. Passwords, keys and customers' personal details are never sent.
- **Revoke access** any time in Analify → Settings → Developer → Applications.

Privacy policy: https://analify.scalyax.ai/en/privacy · Terms: https://analify.scalyax.ai/en/terms · Docs: https://analify-ai.readme.io/docs/mcp

## Roll it out to your whole team

An owner of your Claude organization can install it for everyone through managed settings:

```json
{
  "extraKnownMarketplaces": {
    "scalyax": { "source": { "source": "github", "repo": "scalyax-ai/analify-claude-plugin" } }
  },
  "enabledPlugins": { "analify-agency@scalyax": true }
}
```

## Development

- `node --test tests/*.test.mjs` runs the hook tests.
- `claude plugin validate . --strict` checks the plugin and the marketplace.
- `claude --plugin-dir .` tries local changes.

## Support

analify@scalyax.ai · https://analify.scalyax.ai/en/contact

## License

MIT
