# Theme UI

A Flutter starter for internal business applications: the application shell, the design system and the UI kit of the
[Lotline](https://github.com/Littihai/TMCL-PR) platform, rebuilt in Flutter so the next project starts here (the
React version lives in this repository's history up to v1.0.0; see [docs/decisions/0040](docs/decisions/0040-flutter-stack.md)).
Thai and English UI. No backend: the sign-in is an in-memory stand-in, the pages show sample data.

Live demo: **https://littihai.github.io/Theme-UI/** (deployed from `main` by `.github/workflows/pages.yml`) · Thai version: [README.th.md](README.th.md)

[![The landing page of the live demo](docs/screenshot-landing.jpg)](https://littihai.github.io/Theme-UI/)

## What is in the box

| Area | What you get |
|---|---|
| **Shell** | A single-row top bar with a mega menu, or a sidebar / icon rail (the person chooses); phone drawer; account menu; notification bell; Ctrl-K palette; the Settings window as a route (`/settings/<section>`); footer; an API status bar |
| **Look** | Light / dark / system (the switch spreads out of the button as a circle); nine accents; four typefaces (every one reads Thai); five grey bases; corner radius; page width; sticky bars; attached or floating edges; text size S/M/L; high contrast; reduced motion — all per device, read before the first frame |
| **UI kit** | Button, StatusBadge, Avatar, AppSwitch, AppTabs, AppSelect (searchable, grouped, with tones), DateRangeField, Field / AppTextField / FormAlert, Pager, AppTable (sortable, selectable, cards on a phone), CSV export, BulkBar, ActiveFilters, Breadcrumb, PageHeader, StageCard / ActionBar, Timeline, Skeletons, StatTile / CountUp, EmptyState, ErrorState, InlineError (by failure kind), ComingSoon, toasts, confirm / reason dialogs, line / donut / bar charts drawn with `CustomPainter` |
| **Plumbing** | `ApiResponse<T>` envelope + an `http` client with token refresh, offline / timeout detection and readable failures (unit-tested); auth and permission store (`context.stores.auth.can("APP.MODULE.ACTION")`, `RequireCan`); bilingual dictionary with a CI check; Material Symbols only, through `AppIcon` |
| **Before sign-in** | A landing page (hero, a bento of what is inside, the four steps, the way in) with scroll reveals, tilting cards and a glass header; a sign-in page in two layouts (`Brand.loginLayout`) |
| **Demo pages** | Home (overview), Components (every piece), Tables (the complete list page), Charts, Document (stages + approval), Manual (the guide, in the app), Admin (a gated page) |

## Run it

Prerequisites: Flutter 3.47 or newer (Dart 3.13), Chrome for the web target.

```powershell
flutter pub get
flutter run -d chrome
```

Sign in with a sample account: `admin` / `demo` (every permission) or `staff` / `demo` (DEMO.VIEW only). They are
fictional and live in `lib/services/auth_service.dart`.

```powershell
flutter analyze --fatal-infos     # lint + types
dart run tool/check_i18n.dart     # every key the code asks for exists in lib/i18n, both languages (lists unused ones)
flutter test                      # unit tests (API client, tokens, Customize, kit) + the sign-in widget flow
flutter build web --release       # into build/web (add --base-href /<repo>/ for GitHub Pages)
```

## Start a project from it

1. Create a repository from this one (Use this template, or clone and change the remote).
2. Rename the product in `lib/constants/brand.dart`; replace the mark in `lib/components/ui/app_logo.dart`,
   `web/favicon.svg` and `web/icons`; set the tab title and the loading colours in `web/index.html`.
3. Replace `lib/services/auth_service.dart` with calls to your API through `ApiClient` (keep `login`, `verify`,
   `logout`, `forgetSession`); `AuthStore` does not change. The client already handles tokens, refresh and the
   failure envelope; the API base comes in as `--dart-define=API_BASE=…` (see `.env.example`).
4. Add a module: `lib/modules/<name>/` (pages), `lib/services/<name>_service.dart` (the only place that calls the
   API), a route in `lib/app/router.dart`, an entry in `lib/constants/nav.dart`, and `lib/i18n/dict_<name>.dart`.
5. Delete the showcase module (`lib/modules/showcase`, the `demo.*` and `home.*` keys) once real pages exist.

The in-app manual (`/manual`) walks through the same steps; [docs/theme-guide.md](docs/theme-guide.md) explains the
tokens, the Customize choices and the layout; [docs/decisions](docs/decisions) keeps the design decisions this
starter inherits and the ones it made.

## House rules

- Every visible string has `L(th, en)` in `lib/i18n` and is read with `context.t('key')`; no text in widgets.
- Colours, spacing, elevation and corners come only from `context.tokens` (`lib/theme/tokens.dart`).
- Icons are Material Symbols through `AppIcon`; add the name to `lib/constants/icons.dart` first. No emoji.
- A list that can pass 10 rows is paged (`Paged` + `Pager`). One primary button per page; `danger` only for what
  cannot be undone. A mistake the person must fix is shown beside the field, not as a toast.
- Permissions are checked on the client in one place and again by the API on every call.

## Layout

```
lib/app          app.dart (root, tokens, router), router.dart, scope.dart (the stores, context.t / tokens / breakpoints)
lib/components   ui/ (the kit), charts/ (CustomPainter charts)
lib/constants    brand.dart (name, storage prefix), nav.dart (the menu), icons.dart (AppIcon)
lib/i18n         dict.dart (I18nStore, t), dict_core / dict_appearance / dict_demo / dict_landing, errors.dart (HTTP failures)
lib/layouts      app_shell, header, mega_menu, side_nav, nav_drawer (phone), public_frame, app_footer, api_status_bar
lib/modules      auth/, common/ (404, 403), home/, landing/ (before sign-in), settings/, showcase/ (delete me)
lib/overlays     toast, confirm_dialog, command_palette, account_menu, notifications_panel, customize_panel, theme_reveal, anchored
lib/services     api_client.dart, auth_service.dart
lib/state        auth_store.dart, notifications_store.dart
lib/theme        tokens.dart, appearance.dart, theme_store.dart, app_theme.dart, fonts.dart
lib/util         prefs, format, csv (+ web download), platform
tool             check_i18n.dart
test             api_client, appearance / tokens, i18n, kit, the app flow
web              index.html (loading screen, saved scheme before Flutter), favicon, manifest, icons
```

## License

Not yet chosen. Until a license file is added, all rights are reserved by the author. The bundled typefaces are under
the SIL Open Font License.
