# Theme UI

A React + TypeScript starter for internal business applications: the application shell, the design system and the UI kit
of the [Lotline](https://github.com/Littihai/TMCL-PR) platform, lifted out of that project so the next one starts here.
Thai and English UI. No backend: the sign-in is an in-memory stand-in, the pages show sample data.

Live demo: **https://littihai.github.io/Theme-UI/** (deployed from `main` by `.github/workflows/pages.yml`) · Thai version: [README.th.md](README.th.md)

## What is in the box

| Area | What you get |
|---|---|
| **Shell** | Top bar with a Linear-style mega menu, or a sidebar / icon rail (the person chooses); phone drawer; account menu; notification bell; Ctrl-K palette; the Settings window as a route (`/settings/<section>`); footer |
| **Look** | Light / dark / system (the switch spreads out of the button as a circle, View Transitions API); nine accents; four typefaces (every one reads Thai); five grey bases; corner radius; page width; sticky bars; attached or floating edges; text size S/M/L; high contrast; reduced motion — all per device, applied before first paint (`public/theme-init.js`) |
| **UI kit** | Button, Badge, Switch, Tabs, Select (searchable, grouped, with tones), DateRange, Field / FormAlert / Dialog, Pager, sortable table headers, CSV export, BulkBar, ActiveFilters, Breadcrumb, PageHeader, StageCard / ActionBar, Timeline, Skeletons, EmptyState, ErrorState, InlineError (by failure kind), ComingSoon, Toast, confirm / reason dialogs, hand-drawn SVG charts |
| **Plumbing** | `ApiResponse<T>` envelope + a fetch client with token refresh, offline / timeout detection and readable failures; auth and permission providers (`usePermissions().can("APP.MODULE.ACTION")`, `<RequireCan>`); bilingual dictionary with a CI check; Octicons only |
| **Before sign-in** | A landing page (hero, a bento of what is inside, the four steps, the way in) with scroll reveals, tilting cards and a glass header; a sign-in page in two layouts (`BRAND.loginLayout`: a dark brand panel beside the card, or the card alone) |
| **Demo pages** | Home (overview), Components (every piece), Tables (the complete list page), Charts, Document (stages + approval), Manual (this guide, in the app), Admin (a gated page) |

## Run it

Prerequisites: Node.js 22 or newer.

```powershell
npm ci
npm run dev          # http://localhost:5173
```

Sign in with a sample account: `admin` / `demo` (every permission) or `staff` / `demo` (DEMO.VIEW only). They are
fictional and live in `src/services/authService.ts`.

```powershell
npx tsc --noEmit     # type check
npm run check:i18n   # every key the code asks for exists in src/i18n (and lists unused ones)
npm run build        # type check + production build into dist/
```

## Start a project from it

1. Create a repository from this one (Use this template, or clone and change the remote).
2. Rename the product in `src/constants/brand.ts`; replace the mark in `src/components/ui/AppLogo.tsx` and `public/favicon.svg`
   (and add a 180×180 PNG for iOS home screens if you need one).
3. Replace `src/services/authService.ts` with calls to your API (keep `login`, `verify`, `logout`, `forgetSession`); the
   `AuthProvider` does not change. `services/apiClient.ts` already handles tokens, refresh and the failure envelope.
4. Add a module: `src/modules/<name>/` (pages), `src/services/<name>Service.ts` (the only place that calls the API),
   a route in `src/app/routes.tsx`, an entry in `src/constants/nav.ts`, and `src/i18n/dict.<name>.ts`.
5. Delete the showcase module (`src/modules/showcase`, the `demo.*` and `home.*` keys) once real pages exist.

The in-app manual (`/manual`) walks through the same steps; [docs/theme-guide.md](docs/theme-guide.md) explains the
tokens, the Customize attributes and the layout CSS; [docs/decisions](docs/decisions) keeps the design decisions this
starter inherits.

## House rules

- Every visible string has `{ th, en }` in `src/i18n` and is read with `t("key")`; no text in components.
- Colours, spacing, elevation and corners come only from the tokens in `src/styles/tokens.css`.
- Icons are Octicons through `<Icon name="…" />`; add the name to `src/constants/icons.ts` first. No emoji.
- A list that can pass 10 rows is paged (`usePaged` + `<Pager>`). One primary button per page; `danger` only for what
  cannot be undone. A mistake the person must fix is shown beside the field, not as a toast.
- Permissions are checked on the client in one place and again by the API on every call.

## Layout

```
src/app          App.tsx (providers), routes.tsx, ErrorBoundary, providers/ (theme, text size, customize, i18n, auth, permissions, ui)
src/components   ui/ (the kit), charts/ (SVG charts)
src/constants    brand.ts (name, storage prefix), nav.ts (the menu), icons.ts
src/hooks        focus trap, escape layer, scroll lock, hotkeys, anchored panels…
src/i18n         dict.ts (core), dict.appearance.ts, dict.demo.ts, errors.ts (HTTP failures)
src/layouts      AppShell, Header, MegaMenu, NavBar (phone drawer), SideNav, PublicFrame, ApiStatusBar
src/lib          appearance, fontSize, fonts, notify (toasts, confirm), notifications store, dates, csv, formDraft…
src/modules      auth/, common/ (404, 403), home/, landing/ (before sign-in), settings/, showcase/ (delete me)
src/overlays     Toast, ConfirmDialog, CommandPalette, AccountMenu, NotificationsPanel, CustomizePanel
src/services     apiClient.ts, authService.ts
src/styles       tokens.css, global.css, ui.css, layout.css
public           theme-init.js (applies the saved look before React), favicon, manifest
```

## License

Not yet chosen. Until a license file is added, all rights are reserved by the author.
