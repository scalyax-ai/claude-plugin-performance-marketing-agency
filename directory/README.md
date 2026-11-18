![Analify](./icon.png)

# Analify for Performance Marketing Agencies

**One AI workspace for every ecommerce client you run, inside Claude Code.**

Your team runs Meta, TikTok, Google Ads and Snapchat for many ecommerce brands. Every question means opening each client's ad managers, their Shopify and their courier, one tab at a time.

With this plugin, every client brand gets its own folder in Claude Code, connected live to everything that client runs, through [Analify](https://analify.scalyax.ai), the AI Business Brain and Ecommerce Operator. Open the client's folder and ask: "What did we actually make yesterday after ads, shipping and returns?", "Which ad sets lose money after returns?", "Audit last month's Meta and TikTok." Claude reads that client's live store and ad data through that client's own connection. Then it saves what it found to that client's Business Brain, so next week starts where you stopped.

Open. Ask. Approve. Done.

## What changes for your agency

- **No more tab-hopping.** One folder per client, connected to the client's store (Shopify, WooCommerce, Salla, EasyOrders or Amazon), Meta, TikTok, Google Ads, Snapchat and couriers through one Analify connection.
- **One client per folder.** Each client's folder has its own `CLAUDE.md` that names the client and its Analify connection, and Claude is told to use only that connection there. Claude follows these rules, but nothing in this version enforces them, so keep each person to their own clients' folders.
- **Work that adapts to each client.** Claude reads what each client has connected and works with exactly that. It says plainly what's missing, for example "no Shopify, so no real profit yet".
- **The work stays with the client.** When you ask, Claude saves to that client's Business Brain:
  - findings, with the data behind them
  - decisions and client rules
  - your reports

  Everything is labelled with your agency's name and the date. The founder's own rules always rank above yours.
- **Walk into every client call already knowing the story.** `/analify:brief` gives the morning picture for one client: real profit after all costs, the ads that need attention, and what's missing.
- **Nothing changes without you.** Pausing an ad, moving a budget or changing a price happens only after you approve the exact action.

The full version, with the automatic client guard and Brain autosave, installs from the Scalyax marketplace: https://github.com/scalyax-ai/claude-plugin-performance-marketing-agency

## Who it's for

- Performance marketing agencies, and in-house growth teams, that run several ecommerce brands.
- Running one brand? You don't need this plugin. Connect Analify to Claude directly: https://analify-ai.readme.io/docs/mcp

## Get started

1. **Make a folder for each client.** Open the folder that holds your clients in Claude Code and run `/analify:add-client` with the client's name and website. Claude creates the client's folder and its `CLAUDE.md`, and asks you before it writes anything.
2. **Connect their accounts in Analify.** Connect each client's Shopify, Meta Ads, TikTok Ads, Google Ads, Snapchat Ads and couriers in Analify. Tip: ask clients for Shopify collaborator access first, because that wait is usually the slowest part.
3. **Add the client's Analify connection to Claude Code.** In the client's folder, add the Analify MCP (`https://analify-mcp.scalyax.ai/`) as a remote MCP server. Claude Code's docs show how: https://code.claude.com/docs/en/mcp
4. **Connect Claude to the client.** Open the client's folder in Claude Code and run `/analify:connect`:
   1. Sign in to the client's brand and tick **Allow changes**, so Claude can save to the Brain.
   2. Claude confirms it's the right brand and reads what's connected.
   3. It tells you what Claude can do for that client now.

## Daily work

Open the client's folder and work as you normally do.

Try these in a client's folder:

1. "What did we actually make yesterday after ads, shipping and returns?"
2. "Which Meta and TikTok ad sets lose money once returns are counted?"
3. "Audit last month's Meta and TikTok spend and save the audit to reports/."
4. "Give me the morning brief for this client." (or `/analify:brief`)

| Command | What it does |
| :- | :- |
| `/analify:brief` | Morning brief for this client |
| `/analify:save` | Save something to this client's Brain: a finding, a decision, a client rule, a report |
| `/analify:connect` | Sign in again, or refresh what this client has connected |
| `/analify:onboard` | Guided setup: your agency folder, every client's folder, then connecting their accounts |
| `/analify:add-client` | Set up a folder for one client |
| `/analify:import-clients` | Set up folders for many clients from a CSV |
| `/analify:rename-client` | Rename a client and keep its connection |
| `/analify:clients` | Checklist of every client and what each one still needs |
| `/analify:agency-setup` | Only create the agency folder |

Two skills work in the background, without a command: one keeps Claude to this client's rules and connection, and one answers questions about this client's numbers.

Put finished audits and reports in the client's `reports/` folder as Markdown or CSV, then run `/analify:save` to send them to that client's Brain. **Only `reports/` is shared.** Keep agency-only notes (your margins, internal methods, drafts) anywhere else in the folder, such as `private/`, and they stay with you.

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

Setup guide: https://analify-ai.readme.io/docs/mcp

### Work apps (connectors)

Connected in Analify, and available to Claude through the same client connection:

- **Notion** and **Klaviyo**: read.
- **Canva**, **Zernio**, **Higgsfield**, **ElevenLabs** and **Zapier**: prepare work, with your approval.
- **Custom connector:** add any MCP server by its URL.
- **HubSpot** and **Slack:** coming soon.

## Good to know

- Works in Claude Code: terminal, IDE extensions and the desktop app's Code tab.
- This version adds skills only. Claude does folder and file work with its normal tools and asks you before writing.
- The plugin doesn't connect accounts for you. You connect each client's store and ad accounts in Analify, and each Shopify store installs the Analify app.
- Analify's Agency view (all clients in one table in the Analify app) is in beta, so ask Analify to switch it on. This plugin works with any brands your Analify account can open.

## Data and permissions

- **Where data goes:** only to `https://analify-mcp.scalyax.ai` (Analify, operated by Scalyax), through the tool calls Claude makes. You see every call in the session.
- **What comes back:** figures from the client's connected accounts, read with the access the client gave Analify.
- **Read-only unless you allow changes** on the Analify sign-in screen. Even then, each change waits for your approval.
- **What is saved to a client's Brain:** only what you ask Claude to save: findings, decisions, client rules and files in `reports/`. Claude is told not to send passwords or customers' details, so don't paste customer lists into a client session.
- **Revoke access** any time in Analify → Settings → Developer → Applications.

Privacy policy: https://analify.scalyax.ai/en/privacy · Terms: https://analify.scalyax.ai/en/terms · Docs: https://analify-ai.readme.io/docs/mcp

## Support

analify@scalyax.ai · https://analify.scalyax.ai/en/contact

## License

MIT
