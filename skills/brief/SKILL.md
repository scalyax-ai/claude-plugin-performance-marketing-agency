---
name: brief
description: Morning brief for the client whose folder this is — yesterday's real profit, ads that need attention, delivery problems — from that client's Analify Brand only.
disable-model-invocation: true
---

# Client brief

Only in a client folder (the session context names the client and its `mcp__analify-<client>__` tools). In the agency root, tell the user to open the client's folder instead.

1. Confirm the connection: `analify_brain_session_start` on this client's connection (skip if already confirmed this session).
2. `analify_get_context`, then `analify_brain_search` for what the Brain already knows (targets, rules, past findings) and `analify_brain_operating_contract`.
3. Yesterday and the last 7 days: Blended Profit (revenue − ad spend − shipping − product costs − returns), ad spend and results per platform (use the `analify_ads_*` tools), delivery and return problems if a courier is connected.
4. Write it as a short brief for the agency: what happened, the one or two things to act on today, and what's missing (for example product costs not set, so profit is incomplete). Name the client at the top. Never invent a number; say what's missing.
5. Changes (pausing ads, budgets) only after the user approves the exact action.
