---
name: agency-workspace
description: Rules for agency work in an Analify client folder — one client per session, which connection to use, how findings, audits and decisions reach that client's Brain. Use whenever the session context says ANALIFY AGENCY WORKSPACE.
---

# Working in an Analify client folder

- **One client.** The folder is one client's workspace. Use only that client's `mcp__analify-<client>__` connection; the plugin blocks every other Analify connection here. Never bring numbers or notes from another client into this folder.
- **Confirm first.** Start with `analify_brain_session_start` (sessionId = this Claude Code session id). It names the Brand the connection is signed in to. If it is not this client's Brand, stop and tell the user how to reconnect (`/mcp` → this connection → clear authentication → sign in → pick the right Brand).
- **Start from what the Brain knows.** `analify_brain_search` before answering; respect the founder's rules and the operating contract. The founder's rules always outrank the agency's advice.
- **Say whose number it is.** Every figure names the client and period. Profit means Blended Profit. Never invent a number; say what's missing.
- **Changes need approval.** Pausing ads, budgets, prices: only after the user approves the exact action.
- **Put finished work in `reports/`** as Markdown or CSV (audits, research, plans). Only `reports/` is offered to the client's Brain. Agency-only notes (margins, internal methods, drafts) go anywhere else, such as `private/`, and are never offered.
- **Autosave.** When a BRAIN AUTOSAVE CHECKPOINT arrives, follow its steps: findings with the data behind them go to `analify_brain_remember`, decisions and client rules to `analify_brain_capture`, reports as files, and the session record as a staged file. Write the agency's way of working *as it applies to this client* ("For Caliego we stop an ad set after 3 days of losses after returns"), not as a general agency playbook.
