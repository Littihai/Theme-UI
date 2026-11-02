# 0024 — One error envelope: a code and a reference on every failure, one error panel in the browser

Status: accepted and built.

## Context

The owner opened the new APS pages against an API build that predates them and saw the server's raw sentence,
"ไม่พบ endpoint ที่ร้องขอ", in the middle of the page: true, but it did not say what to do, and the same screen
would have shown nothing useful for a wrong method, a body the server would not read, or an outage. The ask was
to handle every failure the browser can meet (400, 401, 403, 404, 409, 413, 415, 429, 500, 501, 503, offline,
timeout) in one place and to prove each one.

## Decision

- **The envelope gains two optional fields.** `ApiResponse<T>` is still `{ success, message, data, errors }` and now
  carries `code` (a stable UPPER_SNAKE reason: `ENDPOINT_NOT_FOUND`, `MODULE_DISABLED`, `DB_UNAVAILABLE`,
  `SERVER_ERROR`, `VALIDATION`, `NO_SCHEDULE`…) and `ref` (the first eight characters of the request's correlation
  id, when the server logged the failure). Both are omitted on success. The browser decides its wording and its
  action from `code` and the HTTP status, never from the Thai text of `message`. The older `errors: ["CODE"]`
  form of the gates is kept for one release.
- **Framework-level failures answer with the envelope too.** `StatusCodeEnvelope` is the one table of status →
  (code, Thai sentence). It is used by the unmatched-`/api` fallback (404, whose text now says the server may be
  out of date), the JWT challenge (401) and forbidden (403) handlers, the login rate limiter (429), and by
  `UseStatusCodePages` for anything that would otherwise go out bodiless on `/api` (415 not JSON, 406, 411…). MVC's
  own ProblemDetails for client errors is switched off so those stay bodiless until the middleware fills them. A
  request Kestrel itself refuses (413 body too large, 431, a malformed request) keeps its status instead of
  becoming a 500, and is logged as a warning. The global handler's 500 / 503 now put the reference in `ref` and
  keep the message plain.
- **The browser has one failure path.** `apiClient` turns every answer into the envelope with `status`, `code`,
  `ref` and `retryAfter`: a body that is not JSON (a proxy page, the SPA shell on an API path) becomes
  `BAD_RESPONSE`; no answer becomes `OFFLINE`; a call past 60 s becomes `TIMEOUT`. A 404 whose message mentions
  "endpoint" from a server that predates `code` is read as `ENDPOINT_NOT_FOUND`, so the page can still say "the
  server is out of date". The words live in `i18n/errors.ts` (Thai and English), chosen by code first, then by
  status; the server's own sentence is kept only when it is specific (a rule, a field).
- **Three consequences are automatic.** A 401 that survives the refresh attempt drops the tokens, raises
  `SESSION_EXPIRED_EVENT`, and the app signs the person out with one toast; the route guard sends them to sign in
  and brings them back. A 403 `MODULE_DISABLED` raises `MODULE_DISABLED_EVENT`, the feature flags are re-read and
  the module guard shows "turned off". A 403 `PASSWORD_CHANGE_REQUIRED` keeps sending the person to set a password.
- **One error panel.** `useLoad` keeps the whole failure (`fail`), and `InlineError` reads it: a family per code /
  status (offline, timeout, input, sign-in, forbidden, disabled, outdated, missing, stale, busy, down, server) with
  its own icon, title, the message, a hint, the HTTP status, the code and the reference as chips, and only the
  actions that make sense: retry for a hiccup, sign in for a dead session, home for a refusal, reload for a server
  out of step. The APS pages stop comparing the server's Thai text ("ยังไม่มีตาราง") and look at `NO_SCHEDULE`.

## Consequences

- A wrong method on a known path is answered by the `/api` fallback (404 `ENDPOINT_NOT_FOUND`), not 405, because the
  fallback is itself a matching endpoint; the browser still handles a 405 (from a proxy) as "out of step".
- The reference in `ref` is what a user quotes to support; the server log carries the full correlation id.
- Action buttons (save, run, convert) still show the server's sentence in a toast: it is now never empty and
  already localised by status, but it does not show the code or the reference. A toast that carries them is a
  later refinement.
- 30 tests in `Lotline.Api.Tests/Shared/ErrorEnvelopeTests.cs` cover the table, the serialisation, the exception
  handler's code and reference, and the Kestrel refusals. The live matrix (`scratchpad/err_e2e.py`, not in the
  repo) was run against the local copy: 22 cases including 503 from an instance pointed at an unreachable database,
  413 with a 31 MB body, 429 after twelve sign-in attempts, and `MODULE_DISABLED` by switching the flag off and on.
