# Analify for Claude

Ask what your ecommerce store actually made, and get the answer from your live data.

Analify is the AI Business Brain and Ecommerce Operator. Connect your store, ads and shipping once in Analify, then ask Claude what happened and why. Answers use **Blended Profit** (revenue minus ad spend, shipping, COGS and returns), your product costs and your own business rules, read live from Shopify, Meta Ads, TikTok Ads and Bosta.

## Install

In Claude Code:

```
/plugin install analify --marketplace scalyax-ai/analify-claude-plugin
```

Or add the Scalyax marketplace first, then install:

```bash
claude plugin marketplace add scalyax-ai/analify-claude-plugin
claude plugin install analify@scalyax
```

## What's in this plugin

- **Analify connector** (`.mcp.json`): Analify's remote MCP server at `https://analify-mcp.scalyax.ai/`. You sign in with your Analify account through OAuth the first time you use it.
- **Business Brain skill**: tells Claude to check which platforms are connected first, find the right tool, use Blended Profit for "profit", never invent a number, and never change anything without your approval.
- **Agency mode** (commands, skills and hooks below) for agencies that run many client brands.

## Try it

- "What did my store actually make last week after ads, shipping, COGS and returns?"
- "Which Meta campaigns look profitable but lose money after returns?"
- "What are my margins on my top 10 products?"
- "Why did my delivery success rate drop this month?"

## Agency mode: one folder per client

For agencies that manage many brands in Analify. Each client gets its own folder with its own Analify connection, so Claude opened in a client's folder only works with that client, and everything the agency learns there goes into that client's own Business Brain.

### Set up

1. In the folder that should hold all clients: `/analify:agency-setup "Your agency name"`
2. Add clients one by one with `/analify:add-client "Caliego" --shopify caliego.myshopify.com --meta act_123`, or many at once with `/analify:import-clients clients.csv` (columns `name,brand,site,shopify,meta`).
3. For each client:
   - In Analify, create the Brand under Agency → Clients and connect Shopify and Meta in it.
   - Open Claude Code in the client's folder, run `/mcp`, choose `analify-<client>` → Authenticate, pick that client's Brand and tick "Allow changes" (needed to save to the Brain).
4. `/analify:clients` shows which clients are ready and what each one is still missing.

Daily: open the client's folder and work as usual. `/analify:brief` gives the morning brief for that client; `/analify:save` saves something to its Brain right away.

### What the hooks do

- **Session start:** tells Claude which client the folder is for and which connection to use.
- **Wrong-client guard:** inside a client folder, every other Analify connection on the machine is blocked, and the client's own connection is blocked until Analify confirms it is signed in to that client's Brand. A connection signed in to the wrong Brand stays blocked, with the steps to fix it.
- **Brain autosave:** after a stretch of real work (Analify data calls, or reports written in the folder), Claude is asked once to save it to the client's Brain: findings with the data behind them, decisions and client rules, report files (Markdown, CSV, text), and a session record that is kept for the founder to review but not used for answers. Everything is labelled with the agency's name and date, and the founder's own rules always rank above it. Turn it off per client with `/analify:add-client "Name" --autosave off`.

Each client's connection is registered with `claude mcp add --scope local` in that folder, so it needs no extra approval. Claude Code keeps one sign-in per connection name, which is why every client has its own `analify-<client>` connection.

### Roll it out to the whole team

An owner of the agency's Claude organization can install it for everyone through managed settings:

```json
{
  "extraKnownMarketplaces": {
    "scalyax": { "source": { "source": "github", "repo": "scalyax-ai/analify-claude-plugin" } }
  },
  "enabledPlugins": { "analify@scalyax": true }
}
```

## Requirements

An Analify account (free; MCP access is open to every plan) with at least one platform connected: Shopify, Meta Ads, TikTok Ads or Bosta. Sign up at https://analify.scalyax.ai. Agency mode needs Node.js 18 or newer.

## Data and permissions

- **Where data goes:** the plugin talks to one server only, `https://analify-mcp.scalyax.ai` (Analify, operated by Scalyax). It sends the tool calls Claude makes, which contain your question's parameters such as date ranges, product or campaign IDs and filters.
- **What comes back:** figures read from your own connected Shopify, Meta Ads, TikTok Ads and Bosta accounts, which Analify accesses with the authorization you gave when you connected them.
- **Read-only by default.** The sign-in screen lets you choose the Analify workspace and whether to allow changes. Write tools (for example pausing an ad set or updating a product cost) only work if you ticked "Allow changes", and Claude asks you to confirm each one.
- **Notes to your Business Brain** are saved only when you ask, except in agency client folders with autosave on, where saving that client's work to that client's Brain is part of the setup you chose.
- **What runs on your machine:** small Node.js hooks. They do nothing outside folders created by agency mode, and they make no network calls. Inside a client folder they read that session's transcript to write a session record into the folder's `.analify/sessions/`. Anything sent to Analify goes through Claude's own tool calls, which you see in the session.
- Revoke access any time in Analify → Settings → Developer → Applications.

Privacy policy: https://analify.scalyax.ai/en/privacy · Terms: https://analify.scalyax.ai/en/terms · Docs: https://analify-ai.readme.io/docs/mcp

## Development

`npm test` runs the hook tests. `claude plugin validate .` checks the plugin and the marketplace. Try local changes with `claude --plugin-dir .`.

## Support

analify@scalyax.ai · https://analify.scalyax.ai/en/contact

## License

MIT
