---
name: agency-workspace
description: Rules for agency work in an Analify client folder — one client per session, which connection to use, how findings, audits and decisions reach that client's Brain. Use whenever the folder's CLAUDE.md says ANALIFY AGENCY WORKSPACE.
---

# Working in an Analify client folder

- **One client.** The folder is one client's workspace; its `CLAUDE.md` and `.analify/client.json` name the client, its Brand and its connection (`serverName`). Use only that client's `mcp__<serverName>__` tools, never any other Analify connection here, and never bring numbers or notes from another client into this folder. Nothing blocks the other connections for you, so check the tool name before every Analify call.
- **Confirm first.** Start with `analify_brain_session_start` (sessionId = this Claude Code session id). It names the Brand the connection is signed in to. If it is not this client's Brand, stop and tell the user how to reconnect (`/mcp` → this connection → clear authentication → sign in → pick the right Brand). Until it is fixed, make no other Analify call.
- **Start from what the Brain knows.** Before answering, call `analify_brain_search` through `analify_call_tool`. Respect the founder's rules and the operating contract; the founder's rules always outrank the agency's advice.
- **Say whose number it is.** Every figure names the client and period. Profit means Blended Profit (revenue − ad spend − shipping − product costs − returns). Never invent a number; say what's missing.
- **Changes need approval.** Pausing ads, budgets, prices: only after the user approves the exact action.
- **Put finished work in `reports/`** as Markdown or CSV (audits, research, plans). Only `reports/` is offered to the client's Brain. Agency-only notes (margins, internal methods, drafts) go anywhere else, such as `private/`, and are never offered.
- **Brain saves happen when the user asks.** Nothing is saved on its own. When a piece of client work is finished (an audit, a research question answered, a decision made), you may offer in one line to save it; save only after the user says yes or runs /analify:save, following the /analify:save steps. Write the agency's way of working *as it applies to this client* ("For Caliego we stop an ad set after 3 days of losses after returns"), not as a general agency playbook.
