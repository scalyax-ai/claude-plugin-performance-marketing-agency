---
name: client-numbers
description: Answer questions about a client brand's numbers (profit, ad spend, ROAS, shipping, returns, margins, delivery success) from that client's own Analify connection, inside its client folder. Use when the session context says ANALIFY AGENCY WORKSPACE and the question is about this client's store or ads.
---

# A client's numbers

Use only this client's `mcp__analify-<client>__` tools (the session context names them).

1. Confirm the connection first with `analify_brain_session_start` if it isn't confirmed this session.
2. `analify_brain_search` for what this client's Brain already knows, then `analify_get_context` to see which platforms are connected.
3. Find the exact tool with the matching `*_search_tools` (for ads, the `analify_ads_*` tools), then run it with `analify_call_tool`.
4. Profit means Blended Profit = Revenue − Ad Spend − Shipping − Product costs − Returns. Say which client and which dates every number is for. If a figure is missing (for example product costs not set), say so; never invent it.
5. Changes (pausing ads, budgets, prices) only after the user approves the exact action, through `analify_call_write_tool`.
