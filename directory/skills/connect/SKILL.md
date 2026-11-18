---
name: connect
description: Connect Claude to this client's Analify brand from inside its client folder — sign in, confirm it's the right brand, read which platforms (Shopify, Meta, TikTok, Google Ads, Snapchat, couriers) are connected, and show what's still missing.
disable-model-invocation: true
---

# Connect this client

Only in a client folder (its `CLAUDE.md` says ANALIFY AGENCY WORKSPACE, and `.analify/client.json` names the client, its `brand` and its connection `serverName`). In the agency folder, tell the user to open the client's folder first.

1. **Sign in.** Call this client's `mcp__<serverName>__analify_brain_session_start` with this session's id.
   - If the tool isn't available or answers that authentication is needed: tell the user to run `/mcp`, choose `<serverName>` → **Authenticate**, pick this client's brand on the Analify screen and tick **Allow changes** (needed to save to the Brain; Claude still asks before changing any ad or price). Then run `/analify:connect` again. Stop here.
2. **Check it's the right brand.** Take the organization it names (id and name).
   - If client.json has no `bound` yet, the name must match `brand` (ignore case and extra spaces). If client.json has `bound`, the id must equal `bound.id`.
   - If it doesn't match: say plainly which brand it is signed in to and which one this folder is for, and give the fix: run `/mcp`, pick `<serverName>`, clear authentication, sign in again and choose "<brand>". If that other name really is this client's brand in Analify, they can correct the folder from the agency folder with `/analify:add-client "<name>" --brand "<that name>"`. Make no other Analify call. Stop here.
   - If it matches and `bound` is missing or different, ask once, then write `bound` into `.analify/client.json`: `{ "id": "<organization id>", "name": "<organization name>", "at": "<today, YYYY-MM-DD>" }`. Keep every other key and the key order; 2-space indent and a trailing newline.
3. **See what's connected.** Call `analify_get_context`. From its list of integrations, count per platform how many accounts are connected and how many are not. With the user's OK, record it in `.analify/client.json` so `/analify:clients` can show it:
   - `platforms`: one key per platform as Analify names it (for example `shopify`, `meta_ads`), each `{ "connected": <n>, "disconnected": <n>, "accounts": [<up to 5 connected account names>], "offAccounts": [<up to 5 disconnected account names>] }`.
   - `platformsCheckedAt`: today, `YYYY-MM-DD`.
4. **Report in plain words:**
   - "Connected: …" (platforms and how many ad accounts).
   - "Missing: …" with what each gap means, for example "No store connected, so I can't see orders or real profit yet" or "Meta disconnected, reconnect it in Analify".
   - What Claude can do now for this client with what is connected (2–3 concrete examples, such as a Meta and TikTok spend check or yesterday's real profit).
5. If anything is missing, give the Analify link (https://analify.scalyax.ai/en/agency/clients → this brand → Settings → Integrations) and suggest running `/analify:connect` again after connecting.
