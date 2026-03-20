# Security review

_Exported on 20/03/2026 at 18:27:14 GMT from Cursor (2.6.20)_

---

**User**

@\_bmad/bmm/agents/pm.md I want somebody to perform a thorough security review of my code. Who can do that?

---

**Cursor**

The PM (Product Manager) agent is focused on requirements, PRDs, and planning — not code security. Let me check what other agents are available to find the right one for a security review.

Let me check the code review skill and the architect agent, which are the most likely candidates for security analysis.

Let me also peek at the code review workflow to see how security-focused it is.

There is no dedicated security agent in your BMAD setup, but here's the best option you have:

**`bmad-code-review` skill** — This is your best bet for a security review. It runs an adversarial code review that explicitly checks each file for:

- Injection risks
- Missing validation
- Auth/authorization issues
- Performance problems
- Error handling gaps
- Test quality

It's not a pure security audit, but the "adversarial" approach means it's actively trying to find what's wrong, and security vulnerabilities are a first-class concern in its checklist.

To trigger it, just say: **"run code review"** (or invoke the `bmad-code-review` skill). It will ask you which story/files to review, read your actual implementation against the story's acceptance criteria, and produce a categorized findings report (Critical / High / Medium / Low) — with the option to fix issues automatically or create action items.

**Two other partial options** worth knowing about:

- The **Architect agent (Winston)** can discuss security architecture concerns in chat — useful if you want to talk through auth design, secrets management, or infrastructure-level security posture.
- The **`bmad-review-adversarial-general` skill** does a general cynical review, which can surface security-adjacent concerns in non-code artifacts (like your architecture doc or PRD).

For a deeper, dedicated security audit (OWASP Top 10, threat modeling, pentest-style analysis), the BMAD framework doesn't currently have a specialized agent for that. You'd need to either extend it with a custom security agent or do that review manually/with a separate tool.

Want me to kick off the code review now?

---

**User**

/bmad-review-adversarial-general please review all code especially focussing on any potential security issues (XSS, injection, etc)

---

**Cursor**

Now let me explore the full codebase to gather everything I need to review.

I now have a comprehensive view of the entire codebase. Here are my findings.

---

## Adversarial Review Findings — Security Focus

---

### 🔴 Critical

1. **`REVALIDATION_SECRET` is defined in both services but never actually enforced anywhere.** `config.ts` and `.env.example` declare it on both the backend and frontend. `actions.ts` calls `revalidatePath("/")` with no secret check whatsoever. This is phantom security infrastructure — it exists in the config, lives in the `.env.example`, gives the developer a false sense of protection, and does absolutely nothing. Any party that can call the server action can revalidate the cache unconditionally.

2. **`REVALIDATION_SECRET` defaults to an empty string.** `config.ts` sets `REVALIDATION_SECRET: process.env.REVALIDATION_SECRET ?? ""`. An empty string is a valid string, not a missing value. If the variable is absent in production, the "secret" is silently `""` — no error, no warning, no startup failure. Combined with finding #1, this means the feature provides zero security even if someone later wires it up naively using a string equality check.

---

### 🟠 High

3. **`stripHtmlTags` is applied at the wrong layer, is incomplete, and only covers `POST`, not `PATCH`.** The function `/<[^>]*>/g` won't catch malformed tags (e.g., `<script` with no closing `>`), SVG-based injection vectors, HTML entities like `&lt;script&gt;alert(1)&lt;/script&gt;`, or `javascript:` URI schemes in attributes. More importantly, React JSX already escapes all text rendered as `{todo.text}` — the correct and complete protection is already in place at the rendering layer. The backend `stripHtmlTags` provides an illusion of sanitisation while silently mutating user input (e.g., `Buy <milk>` becomes `Buy `). If the `updateTodoSchema` is ever extended to allow text edits, the sanitisation path won't be there for `PATCH`.

4. **No rate limiting on any endpoint.** The backend is wide open — any network-accessible client can `POST /api/todos` in a tight loop until the SQLite file fills the disk, or hammer `/api/health` to force continuous DB queries. There is no `@fastify/rate-limit` plugin, no IP-based throttling, and no per-endpoint request caps. A single script can exhaust both storage and I/O.

5. **No HTTP security headers on either service.** `next.config.ts` has no `headers()` configuration. The Fastify backend has no `@fastify/helmet` plugin. Neither service sets `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy`. The frontend has no CSP that would contain any actual or future XSS, and the backend responses carry no defensive headers.

6. **Route parameter `id` is not validated as a UUID on the backend.** `PATCH /api/todos/:id` and `DELETE /api/todos/:id` pass `request.params.id` directly to Drizzle ORM without any format check. While Drizzle's parameterized queries prevent SQL injection, there is no guard against extremely long strings, null bytes, or other crafted values. The `todoSchema` validates `id` as UUID but only in the shared types — it is never applied server-side at the route boundary.

---

### 🟡 Medium

7. **`CORS_ORIGIN` silently falls back to `http://localhost:3000` if the environment variable is unset in production.** `getConfig()` uses `process.env.CORS_ORIGIN ?? "http://localhost:3000"` with no warning, no error, and no startup validation. In a misconfigured deployment, the backend would accept cross-origin requests from `localhost:3000` — which in production resolves to nothing useful, but could also be exploited if an attacker controls a service running on that address in the same network.

8. **`apiError.message` from the backend is propagated directly to the frontend UI.** In `use-todos.ts`, all three mutation functions (`addTodo`, `toggleTodo`, `deleteTodo`) extract `apiError?.message` from the API response and store it in state. While the global error handler in `error-handler.ts` correctly sanitises 500 messages to "An unexpected error occurred", any 400-class error message from validation or elsewhere passes through verbatim and can appear in the UI. If a verbose or internal detail ever leaks into a 4xx error message, it surfaces directly to the user.

9. **`NEXT_PUBLIC_API_URL=http://localhost:3001` is hardcoded as a Docker build argument.** Because Next.js bakes `NEXT_PUBLIC_*` variables at compile time, this value (`http://localhost:3001` — including the internal port number) is permanently embedded in the JavaScript bundle served to every browser client. This leaks architecture details, and more practically, the image cannot be redeployed to a different host or port without a full rebuild.

10. **The health endpoint performs a live database query with no authentication.** `GET /api/health` executes `SELECT 1` against the SQLite database on every call, is completely unauthenticated, and returns `{ db: "ok" }`. Any external client can continuously poll this to both confirm internal service topology and place repeated database load. In a public-facing deployment this is a free, unauthenticated, rate-unlimited DB probe.

11. **No authentication or authorisation on any route.** All CRUD operations (`GET /api/todos`, `POST`, `PATCH`, `DELETE`) are fully open to any client with network access to port 3001. In the Docker setup, the backend port is mapped to the host (`3001:3001`), meaning it is reachable outside the container network by anything that can reach the host. There is no API key, token, session, or IP allowlist.

12. **`API_URL` (server-side fetch target) is taken from environment with no validation.** `api.ts` reads `process.env.API_URL` and builds fetch URLs directly as `${API_URL}/api/todos`. The value is never validated as a legitimate URL. A misconfigured or injected `API_URL` (e.g., pointing to an internal network service) would turn the Next.js server into an unintentional SSRF proxy, forwarding all SSR todo fetches to an attacker-controlled or internal endpoint.

---

### 🟢 Low

13. **`formatTimestamp` does not guard against `Invalid Date`.** If a todo's `createdAt` field contains a non-parseable string, `new Date(dateString)` silently produces `Invalid Date`, and all subsequent `.getDate()`/`.getMonth()` calls return `NaN`. The rendered output `NaN/NaN/NaN NaN:NaN` is shown directly to the user with no fallback. While the backend controls `createdAt` today, this is a silent failure path for any data integrity issue.

14. **No startup validation of required configuration.** `getConfig()` returns values with silent fallbacks for every field. There is no check that `DATABASE_PATH` is writable, that `CORS_ORIGIN` is a valid URL, or that `PORT` is within a valid range. The app will start with obviously broken configuration and fail at runtime with potentially confusing errors rather than a clear startup message.

15. **`docker-compose.yml` exposes the backend port (`3001:3001`) directly to the host network.** There is no reverse proxy in front of the backend. The backend API — with no auth — is reachable on the host machine directly, not just via the frontend. Any user or process that can reach the host can call the API without going through the frontend at all.

---

**User**

/bmad-quick-spec Please make a quick spec to cover the critical and high security issues
