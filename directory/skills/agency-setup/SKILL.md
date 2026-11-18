---
name: agency-setup
description: Only create the agency folder (no clients). For the full guided setup use /analify:onboard instead.
argument-hint: "[agency name]"
disable-model-invocation: true
---

# Set up the agency workspace

You do this yourself with your normal file tools. Ask the user before writing anything.

1. **Check for an existing agency.** Starting from the current folder and going up one parent at a time, look for `.analify/agency.json` that reads as valid JSON. If you find one, stop and say: "Already an agency folder: <that folder> (<its name>)." Change nothing.
2. **Pick the name.** Use the agency name the user gave. If none was given, use the current folder's name (ask for a better one only if it matters).
3. **Create the agency folder.** In the current folder, after the user agrees:
   - Write `.analify/agency.json` with 2-space indent and a trailing newline:
     ```json
     {
       "name": "<agency name>",
       "clientsDir": "Clients",
       "createdAt": "<current time, ISO 8601>"
     }
     ```
   - Create an empty `Clients/` folder next to it.
   - Say: "Agency folder created: <folder> (<name>). Clients go in <folder>/Clients."
4. **Tell the user, in plain words:**
   - Each client gets its own folder under `Clients/`, with its own Analify connection. Claude opened in a client's folder works only on that client.
   - Next: add clients one by one with `/analify:add-client "Client name"`, or all at once with `/analify:import-clients clients.csv` (columns: name, brand, site, shopify, meta).
   - Findings, audits and decisions reach a client's own Analify Business Brain when you ask: put finished reports in the client's `reports/` folder and run `/analify:save` in that client's folder. Nothing is saved on its own.

Never create Analify accounts, enter passwords or click anything in Analify for the user.
