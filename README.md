# Analify for Claude

Ask what your ecommerce store actually made, and get the answer from your live data.

Analify is the AI Business Brain and Ecommerce Operator. Connect your store, ads and shipping once in Analify, then ask Claude what happened and why. Answers use **Blended Profit** (revenue minus ad spend, shipping, COGS and returns), your product costs and your own business rules, read live from Shopify, Meta Ads, TikTok Ads and Bosta.

## What's in this plugin

- **Analify connector** (`.mcp.json`): Analify's remote MCP server at `https://analify-mcp.scalyax.ai/`. You sign in with your Analify account through OAuth the first time you use it.
- **Business Brain skill** (`skills/analify-business-brain`): tells Claude to check which platforms are connected first, find the right tool, use Blended Profit for "profit", never invent a number, and never change anything without your approval.

## Try it

- "What did my store actually make last week after ads, shipping, COGS and returns?"
- "Which Meta campaigns look profitable but lose money after returns?"
- "What are my margins on my top 10 products?"
- "Why did my delivery success rate drop this month?"

## Requirements

An Analify account (free; MCP access is open to every plan) with at least one platform connected: Shopify, Meta Ads, TikTok Ads or Bosta. Sign up at https://analify.scalyax.ai.

## Data and permissions

- **Where data goes:** the plugin talks to one server only, `https://analify-mcp.scalyax.ai` (Analify, operated by Scalyax). It sends the tool calls Claude makes, which contain your question's parameters such as date ranges, product or campaign IDs and filters. It does not send your conversation.
- **What comes back:** figures read from your own connected Shopify, Meta Ads, TikTok Ads and Bosta accounts, which Analify accesses with the authorization you gave when you connected them.
- **Read-only by default.** The sign-in screen lets you choose the Analify workspace and whether to allow changes. Write tools (for example pausing an ad set or updating a product cost) only work if you ticked "Allow changes", and Claude asks you to confirm each one.
- **Notes to your Business Brain** are saved only when you ask Claude to save them.
- Nothing runs on your machine: no scripts, hooks or package installs.
- Revoke access any time in Analify → Settings → Developer → Applications.

Privacy policy: https://analify.scalyax.ai/en/privacy · Terms: https://analify.scalyax.ai/en/terms · Docs: https://analify-ai.readme.io/docs/mcp

## Support

analify@scalyax.ai · https://analify.scalyax.ai/en/contact

## License

MIT
