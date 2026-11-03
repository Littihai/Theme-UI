# 0040 — The starter is a Flutter app

**Date:** 2026-11-03 · **Status:** accepted · **Supersedes:** the React/Vite stack of 0001–0039 for this repository

## Context

Theme UI began as the React + TypeScript shell lifted out of the Lotline platform (0001–0039 record the decisions it
inherits). The owner wants the next projects on Flutter: one code base for the web, Windows and, later, Android, with
the same shell, tokens and house rules.

## Decision

The repository is rewritten as a Flutter 3.47 / Dart 3.13 application. Everything the React starter decided keeps its
meaning; only the mechanism changes:

| Decision | React starter | Flutter starter |
|---|---|---|
| tokens (0015) | CSS custom properties on `<html data-*>` | `AppTokens`, a `ThemeExtension` built by `AppTokens.build` from the Customize choices (`lib/theme/tokens.dart`) |
| Customize per device | localStorage + `theme-init.js` before first paint | `shared_preferences` read in `main()` before `runApp`; `web/index.html` paints the saved scheme's background before Flutter starts |
| two languages | `DICT` with `t()` + `check-i18n.mjs` | `dict` with `context.t()` + `tool/check_i18n.dart`, the same keys |
| one API envelope (0024) | `apiClient.ts` on `fetch` | `ApiClient` on `package:http`, same refresh / timeout / event behaviour, unit-tested |
| permissions in one place | `usePermissions().can` + `<RequireCan>` | `context.stores.auth.can` + `RequireCan` |
| Settings as a route | background-location pattern | a non-opaque `GoRoute` on the root navigator (`/settings/<section>`) |
| colour-scheme circle | View Transitions API | `ThemeReveal`: the old frame captured with `RenderRepaintBoundary.toImage`, a growing hole clipped out of it |
| icons (0005) | Octicons | Material Symbols through `AppIcon` (see 0041) |
| fonts | `@fontsource` woff2, Plex / Sarabun on demand | bundled TTF (Inter + Noto Sans Thai); Plex / Sarabun as plain assets registered with `FontLoader` when picked |
| state | React context providers | `ChangeNotifier` stores behind one `AppScope` inherited widget; no state library |

## Consequences

- One `flutter build web` is the Pages demo; `flutter build windows` works once the Visual Studio C++ workload is
  installed; Android needs the Android SDK. CI builds the web target only.
- The in-memory session (without Remember me) is lost on a page reload on the web: `shared_preferences` has no
  sessionStorage. A real sign-in keeps its tokens through `ApiClient.setTokens(persist: …)` the same way.
- No library for widgets, state or charts: the kit, the stores and the three chart painters are the project's own,
  so a project can change any of them without a dependency's opinion. Packages: `go_router`, `http`,
  `shared_preferences`, `web`.
