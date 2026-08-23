# MCP / Codex handoff — Digital Ruble UI mock

## Recommended local path

`C:\MCP_Server\projects\digital-ruble-ui`

Do not put project source files directly into `C:\MCP_Server`: keep the MCP server and application project separated.

## Goal

Interactive mobile-first PWA mock of Digital Ruble UI scenarios. No backend yet. The mock should remain easy to replace with real API adapters later.

## Current vertical slice

`Home -> Digital Ruble account -> Top up -> Review -> OTP -> Result`

Result branches:

- success;
- processing, with manual refresh;
- error, with expandable details.

## UX sources

1. Current Digital Ruble UI Standard v5.0 dated 2026-07-01 is authoritative for terminology and mandatory flow requirements.
2. Supplied blue banking screens are the primary style reference.
3. Supplied legacy purple wireframe is a reference for screen composition and operation states, not for current terminology or brand styling.

## Development rules

- React + TypeScript + Vite.
- Mobile-first target: ~390x844.
- Preserve web desktop usability.
- No real personal data; fixtures only.
- Keep backend calls behind a mock/service layer when introduced.
- Do not replace current Digital Ruble terminology with legacy labels such as "Покупка ЦР" where the current Standard requires "Пополнение".
- Every operation must support explicit success/error/processing states where applicable.
- Before a larger change, keep the project runnable with `npm run dev` and buildable with `npm run build`.

## Next scenarios

1. C2C transfer.
2. C2B payment using UПK/payment link.
3. Account opening / access flow.
4. Notifications and operation history.
5. Autotransfers.
