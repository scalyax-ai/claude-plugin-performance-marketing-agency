---
name: connect
description: Connect Claude to this client's Analify brand from inside its client folder — sign in, confirm it's the right brand, read which platforms (Shopify, Meta, TikTok, Google Ads, Snapchat, couriers) are connected, and show what's still missing.
disable-model-invocation: true
---

# Connect this client

Only in a client folder (the session context says ANALIFY AGENCY WORKSPACE and names the client and its `mcp__analify-<client>__` tools). In the agency folder, tell the user to open the client's folder first.

1. **Sign in.** Call this client's `analify_brain_session_start` with this session's id.
   - If the tool isn't available or answers that authentication is needed: tell the user to run `/mcp`, choose `analify-<client>` → **Authenticate**, pick this client's brand on the Analify screen and tick **Allow changes** (needed to save to the Brain; Claude still asks before changing any ad or price). Then run `/analify-agency:connect` again. Stop here.
   - If it names a different brand: say so plainly and give the fix the plugin shows (clear authentication in `/mcp`, sign in again, pick the right brand). Stop here.
2. **See what's connected.** Call `analify_get_context`. The plugin records it for this client.
3. **Report in plain words:**
   - "Connected: …" (platforms and how many ad accounts).
   - "Missing: …" with what each gap means, for example "No store connected, so I can't see orders or real profit yet" or "Meta disconnected, reconnect it in Analify".
   - What Claude can do now for this client with what is connected (2–3 concrete examples, such as a Meta and TikTok spend check or yesterday's real profit).
4. If anything is missing, give the Analify link (https://analify.scalyax.ai/en/agency/clients → this brand → Settings → Integrations) and suggest running `/analify-agency:connect` again after connecting.
