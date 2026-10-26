---
name: save
description: Save something to this client's Analify Brain right now — a finding, decision, client rule, audit or file.
argument-hint: "[what to save, or a file path]"
disable-model-invocation: true
---

# Save to this client's Brain

Only in a client folder, using this client's own `mcp__analify-<client>__` tools. The user asked for this save, so it is approved.

What to save: $ARGUMENTS (if empty, save the important findings and decisions from this session so far).

1. Make sure the connection is confirmed (`analify_brain_session_start` with this session's id) and names this client's Brand.
2. A file (Markdown, CSV, text): `analify_call_write_tool` with tool_name `analify_brain_files_post`, arguments `{ filename, text, import: true }`.
3. A finding worked out from data: `analify_call_write_tool` with tool_name `analify_brain_remember`, arguments `{ question, answer, toolsUsed }`.
4. A decision, client rule, test or procedure: `analify_brain_capture` with kind, a one- or two-sentence statement starting with the agency name, the date, decisionItImproves and entities.
5. A rule the client's founder stated in their own words: `analify_call_write_tool` with tool_name `analify_brain_statements`, arguments `{ text }`. Only for the founder's own words.
6. Say in one line what was saved and where.
