---
name: save
description: Save something to this client's Analify Brain right now — a finding, decision, client rule, audit or file.
argument-hint: "[what to save, or a file path]"
disable-model-invocation: true
---

# Save to this client's Brain

Only in a client folder, using this client's own `mcp__<serverName>__` tools (named in the folder's `CLAUDE.md` and `.analify/client.json`). The user asked for this save, so it is approved.

What to save: $ARGUMENTS (if empty, save the important findings and decisions from this session so far). Save only what is about this client's business.

1. Make sure the connection is confirmed (`analify_brain_session_start` with this session's id) and names this client's Brand. If it names another Brand, save nothing and give the reconnect steps from the folder's `CLAUDE.md`.
2. A file (Markdown, CSV, text), normally from `reports/`: `analify_call_write_tool` with tool_name `analify_brain_files_post`, arguments `{ filename, text: <the file's content>, import: true }`. Never offer files from outside `reports/` unless the user names them.
3. A finding worked out from data: `analify_call_write_tool` with tool_name `analify_brain_remember`, arguments `{ question, answer, toolsUsed }`. The answer states the finding with its numbers and period; `toolsUsed` lists the Analify tools you actually called.
4. A decision, client rule, test or procedure: `analify_brain_capture` with sessionId, a new eventId, kind (fact, decision, constraint, experiment or procedure), a one- or two-sentence statement starting with the agency name, the date it happened, decisionItImproves and entities. Recommendations the client has not approved are kind experiment, never a rule.
5. A rule the client's founder stated in their own words: `analify_call_write_tool` with tool_name `analify_brain_statements`, arguments `{ text }`. Only for the founder's own words.
6. Never send passwords, keys, or customers' names, phone numbers, emails or addresses. If Analify refuses a save, read the note and fix it once; if it is still refused, tell the user exactly what was not saved.
7. When at least one save was accepted, set `lastSavedAt` in `.analify/client.json` to today (`YYYY-MM-DD`), keeping every other key (2-space indent, trailing newline), so `/analify:clients` shows it.
8. Say in one line what was saved and where.
