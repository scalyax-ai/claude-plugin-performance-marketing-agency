![Analify](./assets/analify-logo.png)

# Analify for Performance Marketing Agencies

**One AI workspace for every ecommerce client you run, inside Claude Code.**

Your team runs Meta, TikTok, Google Ads and Snapchat for many ecommerce brands. Every question means opening each client's ad managers, their Shopify and their courier, one tab at a time.

With this plugin, every client brand gets its own folder in Claude Code, connected live to everything that client runs, through [Analify](https://analify.scalyax.ai), the AI Business Brain and Ecommerce Operator. Open the client's folder and ask: "What did we actually make yesterday after ads, shipping and returns?", "Which ad sets lose money after returns?", "Audit last month's Meta and TikTok." Claude reads that client's live store and ad data through that client's own connection. Then it saves what it found to that client's Business Brain, so next week starts where you stopped.

Open. Ask. Approve. Done.

![Every platform and app your clients run, connected to the Analify Business Brain in Claude Code](./assets/analify-integrations.png)

## What changes for your agency

- **No more tab-hopping.** One folder per client, connected to the client's store (Shopify, WooCommerce, Salla, EasyOrders or Amazon), Meta, TikTok, Google Ads, Snapchat and couriers through one Analify connection.
- **One client per folder, checked.** Inside a client's folder, every other Analify connection is blocked, and the client's own connection stays blocked until Analify confirms it's signed in to that client's brand. After that, the brand is checked by its Analify ID every session. This guards against using the wrong client's Analify data; it doesn't stop someone opening another client's files on the same computer, so keep each person to their own clients' folders.
- **Work that adapts to each client.** The plugin reads what each client has connected and works with exactly that. It says plainly what's missing, for example "no Shopify, so no real profit yet".
- **The work stays with the client.** After real work, Claude saves to that client's Business Brain:
  - findings, with the data behind them
  - decisions and client rules
  - your reports
  - a session record the founder can review, with emails, phone numbers, card numbers and keys removed first

  Everything is labelled with your agency's name and the date. The founder's own rules always rank above yours.
- **Walk into every client call already knowing the story.** `/analify-agency:brief` gives the morning picture for one client: real profit after all costs, the ads that need attention, and what's missing.
- **Nothing changes without you.** Pausing an ad, moving a budget or changing a price happens only after you approve the exact action.

## Who it's for

- Performance marketing agencies, and in-house growth teams, that run several ecommerce brands.
- Running one brand? You don't need this plugin. Connect Analify to Claude directly: https://analify-ai.readme.io/docs/mcp

## Install

In Claude Code:

```
/plugin install analify-agency --marketplace scalyax-ai/claude-plugin-performance-marketing-agency
```

Or from your shell:

```bash
claude plugin marketplace add scalyax-ai/claude-plugin-performance-marketing-agency
claude plugin install analify-agency@scalyax
```

**Turn on auto-update once,** so every new version reaches you on its own: in Claude Code run `/plugin`, open **Marketplaces**, choose **scalyax**, then **Enable auto-update**. Claude Code leaves it off by default for marketplaces it doesn't run itself, and a plugin can't switch it on. For a whole team, your Claude organization owner can switch it on for everyone (see [Roll it out to your whole team](#roll-it-out-to-your-whole-team)).

## Onboard your agency

Run **`/analify-agency:onboard`** in the folder that will hold your clients. It walks you through four steps:

1. **Your agency.** Your agency's name.
2. **Your clients.** Paste their website addresses (or a CSV). Each website becomes a client folder with its own Analify connection.
3. **Their accounts.** It opens Analify, where you connect each client's Shopify, Meta Ads, TikTok Ads, Google Ads, Snapchat Ads and couriers. Tip: ask clients for Shopify collaborator access first, because that wait is usually the slowest part.
4. **Claude to each client.** Open the client's folder in Claude Code and run **`/analify-agency:connect`**:
   1. Sign in to the client's brand and tick **Allow changes**, so Claude can save to the Brain.
   2. The plugin confirms it's the right brand and reads what's connected.
   3. It tells you what Claude can do for that client now.

`/analify-agency:clients` shows, at any time, who is ready and the one next thing each client needs.

## Daily work

Open the client's folder and work as you normally do.

| Command | What it does |
| :- | :- |
| `/analify-agency:brief` | Morning brief for this client |
| `/analify-agency:save` | Save something to this client's Brain right now: a finding, a decision, a client rule, a report |
| `/analify-agency:connect` | Sign in again, or refresh what this client has connected |
| `/analify-agency:clients` | Setup checklist across all clients (run it in the agency folder) |
| `/analify-agency:add-client` | Add one client, or update a client's brand or details |
| `/analify-agency:rename-client` | Rename a client; keeps its connection and sign-in |
| `/analify-agency:import-clients` | Add many clients from a CSV |

Put finished audits and reports in the client's `reports/` folder as Markdown or CSV, and they go to that client's Brain at the next save. **Only `reports/` is shared.** Keep agency-only notes (your margins, internal methods, drafts) anywhere else in the folder, such as `private/`, and they stay with you. To turn saving off for a client, run `/analify-agency:add-client "Name" --autosave off`.

## What Analify connects

### Store, ads and data

| | Platforms |
| :- | :- |
| Store | Shopify · WooCommerce, Salla, EasyOrders, Amazon *(new)* |
| Ads | Meta Ads · TikTok Ads · Google Ads *(beta)* · Snapchat Ads *(new)* |
| Analytics | Google Analytics *(beta)* |
| Shipping | Bosta · Bosta Fulfillment · Aramex, Mylerz, ShipBlu, J&T Express, DHL Express, FedEx, UPS, SMSA, Turbo, QP Express *(beta)* |
| Inventory and ERP | Odoo *(new)* |

You can connect more than one ad account per platform.

### What Claude can do with them

- **Read:** orders, products, customers, inventory and discounts. Campaigns, ad sets, ads, creatives, audiences and results on every connected ad platform. Deliveries, cash collected and shipments. The client's Business Brain.
- **Act, only after you approve** *(beta)*:
  - **Meta:** campaigns, ad sets, ads, creatives, audiences, rules
  - **TikTok:** campaigns, ad groups, ads, audiences
  - **Google Ads:** pause, resume and budgets
  - **Shopify:** products, discounts, orders, inventory
  - **Bosta:** deliveries and pickups
  - **Analify:** product costs

### AI connections (MCP)

This plugin connects each client through the **Analify MCP** (`https://analify-mcp.scalyax.ai/`), one connection that covers the client's Business Brain and every platform the client has connected. Analify also offers platform-only connections, if you ever want one:

| Connection | Address |
| :- | :- |
| Analify MCP (everything, used by this plugin) | `https://analify-mcp.scalyax.ai/` |
| Shopify MCP | `https://analify-mcp.scalyax.ai/shopify` |
| Meta MCP | `https://analify-mcp.scalyax.ai/meta` |
| TikTok MCP | `https://analify-mcp.scalyax.ai/tiktok` |
| Bosta MCP | `https://analify-mcp.scalyax.ai/bosta` |
| Shipping MCP *(beta)* | `https://analify-mcp.scalyax.ai/shipping` |

### Work apps (connectors)

Connected in Analify, and available to Claude through the same client connection:

- **Notion** and **Klaviyo**: read.
- **Canva**, **Zernio**, **Higgsfield**, **ElevenLabs** and **Zapier**: prepare work, with your approval.
- **Custom connector:** add any MCP server by its URL.
- **HubSpot** and **Slack:** coming soon.

## Good to know

- Works in Claude Code: terminal, IDE extensions and the desktop app's Code tab. Needs Node.js 18 or newer.
- The plugin doesn't connect accounts for you. You connect each client's store and ad accounts in Analify, and each Shopify store installs the Analify app.
- Analify's Agency view (all clients in one table in the Analify app) is in beta, so ask Analify to switch it on. This plugin works with any brands your Analify account can open.
- A client's connection is tied to its folder on your computer. If you move the folder or switch computers, run `/analify-agency:add-client` for that client again. Your sign-in carries over.

## What runs on your machine

- **Hooks**, small Node.js scripts. They do nothing outside folders created by this plugin, and they make no network calls.
  - **Session start:** tells Claude which client the folder is for and what that client has connected.
  - **Before each Analify call:** blocks connections that belong to other businesses.
  - **After each call:** notes which brand the connection is signed in to, which platforms are connected, and how much client work was done.
  - **At the end of a turn:** writes a session record into the folder's `.analify/sessions/` and, after real work, asks Claude to save to the client's Brain. To write that record, it reads the current session's transcript and removes emails, phone numbers, card numbers and key-like strings. It also tells you when Analify refused a save, so missing work isn't mistaken for saved work.
- **Setup script** (`scripts/clients.mjs`):
  - creates the client folders
  - registers each client's connection with Claude Code's own `claude mcp add --scope local`, which saves it in your Claude Code settings for that folder only
  - if the `claude` command isn't available, writes a `.mcp.json` in the client folder instead, and Claude Code asks you to approve it once
  - during onboarding, opens Analify's website in your browser

## Data and permissions

- **Where data goes:** only to `https://analify-mcp.scalyax.ai` (Analify, operated by Scalyax), through the tool calls Claude makes. You see every call in the session.
- **What comes back:** figures from the client's connected accounts, read with the access the client gave Analify.
- **Read-only unless you allow changes** on the Analify sign-in screen. Even then, each change waits for your approval.
- **What is saved to a client's Brain:** findings, decisions, client rules, files in `reports/`, and session records from that client's folder, while autosave is on. Session records are cleaned of emails, phone numbers, card numbers and keys before they leave your computer, and Claude is told not to send passwords or customers' details. That cleaning is a safety net, not a guarantee: it can't spot a customer's name or street address, so don't paste customer lists into a client session.
- **Revoke access** any time in Analify → Settings → Developer → Applications.

Privacy policy: https://analify.scalyax.ai/en/privacy · Terms: https://analify.scalyax.ai/en/terms · Docs: https://analify-ai.readme.io/docs/mcp

## Roll it out to your whole team

An owner of your Claude organization can install it for everyone, with auto-update on, through managed settings:

```json
{
  "extraKnownMarketplaces": {
    "scalyax": {
      "source": { "source": "github", "repo": "scalyax-ai/claude-plugin-performance-marketing-agency" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "analify-agency@scalyax": true }
}
```

## Development

- `node --test tests/*.test.mjs` runs the hook tests.
- `claude plugin validate . --strict` checks the plugin and the marketplace.
- `claude --plugin-dir .` tries local changes.
- Raise `version` in `.claude-plugin/plugin.json` on every release: auto-update only installs a new version when that number changes.

## Support

analify@scalyax.ai · https://analify.scalyax.ai/en/contact

## License

MIT
