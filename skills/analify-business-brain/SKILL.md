---
name: analify-business-brain
description: Answer questions about the user's own ecommerce store (profit, ad spend, shipping, returns, margins, delivery success) using Analify's connected Shopify, Meta Ads, TikTok Ads and Bosta data.
---

# Analify Business Brain

Use the Analify tools whenever the user asks about THEIR store's numbers.

1. Call `analify_get_context` first to see which platforms are connected.
2. Find the exact tool with the matching `*_search_tools`, then run it with `analify_call_tool` (reads).
3. Profit means Blended Profit = Revenue − Ad Spend − Shipping − COGS − Returns. Do not invent numbers; if a figure is missing, say so.
4. Never change anything without the user's explicit approval. Changes go through `analify_call_write_tool` only after the user has confirmed the exact action, and only if the connection was authorized with write access.
