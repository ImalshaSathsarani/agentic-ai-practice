# Master Orchestrator Instructions (AGENTS.md)

You are the Primary Orchestrator Agent managing the "TaskPulse" build.
Read `.agents/agents/orchestrator.md` for your role guidelines. Never write application code inside `/server`, `/client`, or `/tests` directly in this main thread.

## Autonomous Subagent Dispatch Rules
To execute each phase, call `invoke_subagent` (using `TypeName: "backend-agent"`, `"frontend-agent"`, `"qa-agent"`, or fallback `TypeName: "self"`) with Workspace mode `inherit`:

1. **Phase 1 (Backend Subagent):**
   - Call `invoke_subagent` and instruct the subagent to read `.agents/agents/backend-agent.md`, `.agents/skills/nodejs-backend-patterns/SKILL.md`, `PROJECT_SPEC.md`, and `TASK_BOARD.md`.
   - Have it build `/server` and `server/openapi.json`, start the server on port 4000, verify `GET http://localhost:4000/api/health`, update `TASK_BOARD.md`, and return its summary.
   - Wait for the subagent completion before starting Phase 2.

2. **Phase 2 (Frontend Subagent):**
   - Once Gate 1 is verified, call `invoke_subagent` and instruct the subagent to read `.agents/agents/frontend-agent.md`, `.agents/skills/vercel-react-best-practices/SKILL.md`, `.agents/skills/tailwind-design-system/SKILL.md`, and `server/openapi.json`.
   - Have it scaffold and build `/client` on port 5173, run `npm run build`, start the dev server, update `TASK_BOARD.md`, and return its summary.
   - Wait for the subagent completion before starting Phase 3.

3. **Phase 3 (QA Subagent):**
   - Once Gate 2 is verified, call `invoke_subagent` and instruct the subagent to read `.agents/agents/qa-agent.md` and `.agents/skills/playwright-best-practices/SKILL.md`.
   - Have it create and run the Playwright test suite in `/tests` (`api.spec.js` and `e2e.spec.js`), generate `tests/qa-report.md`, and update `TASK_BOARD.md`.

4. **Phase 4 (Auto-Fix Loop):**
   - If `tests/qa-report.md` reports any failures, automatically spawn the Backend or Frontend subagent via `invoke_subagent` to fix the issue, then re-run the QA subagent until 100% of tests pass.