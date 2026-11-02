# Theme guide

How the look is built, where to change it, and what every layout attribute does. Everything here is CSS and a few
small TypeScript files; no component branches on the theme.

## Tokens (`src/styles/tokens.css`)

Every colour, radius, shadow and type size is a custom property on `:root`. Components read them and never hold a hex
value. The file has four kinds of block:

| Block | What it sets |
|---|---|
| `:root, .theme-light` | the light palette: ground (`--color-bg`, `--color-surface`, `--color-text`), the neutral ramp 50–900, the accent ramp 100–900, the status tones (`--tone-ok/warn/stop-{fg,bg,solid}`), chart colours, shadows, radii, type sizes, the font stacks |
| `html[data-theme="dark"], .theme-dark` | the same names with the dark values |
| `html[data-accent="…"]` | the accent ramp of each of the nine accents (light and dark) |
| `html[data-base="…"]` | the neutral ramp of each grey base (slate, gray, zinc, neutral, stone) |

To retune the default look, edit the values in the first block. To add an accent, add a block for its light and dark
ramps, add its id to `Accent` and `ACCENTS` in `src/lib/appearance.ts`, to the table in `public/theme-init.js`, and its
name to `src/i18n/dict.ts` (`set.accent.<id>`).

`.theme-light` / `.theme-dark` as class names scope a subtree to one palette (the Customize previews use it; a printed
document would too).

## Customize (`src/lib/appearance.ts`, `public/theme-init.js`)

Each choice is one attribute on `<html>`; a default has **no** attribute, so a cleared storage means exactly the
stylesheet's own values.

| Attribute | Values | Read by |
|---|---|---|
| `data-theme` | `dark` (absent = light) | tokens.css |
| `data-accent` | steel · azure · teal · green · indigo · violet · rose · amber · slate | tokens.css |
| `data-base` | slate · gray · zinc · neutral · stone | tokens.css |
| `data-font` | inter · plex · sarabun · system | tokens.css (the font stacks); `src/lib/fonts.ts` loads the files on demand |
| `data-radius` | none · sm · md · lg · xl | tokens.css (`--radius-*`) |
| `data-contrast` | high | tokens.css |
| `data-motion` | reduce · full (absent = follow the OS) | global.css, ui.css |
| `data-size` | s · l (absent = medium) | global.css (`zoom` on `<html>`) |
| `data-nav` | side · rail (absent = top bar) | layout.css, `AppShell` |
| `data-container` | narrow · wide · fluid (absent = standard) | layout.css (`--page-max`) |
| `data-sticky` | all · none (absent = the top bar only) | layout.css |
| `data-nav-style` | floating (absent = attached) | layout.css |
| `data-panel-style` | floating (absent = attached) | layout.css |

`public/theme-init.js` applies the saved values before the first paint so a dark-mode person never sees a white flash;
it carries its own copy of the storage prefix and the allowed values — keep it in step with `CHOICES` in
`appearance.ts` and `STORAGE_PREFIX` in `src/constants/brand.ts`.

The React side: `ThemeProvider` (scheme), `FontSizeProvider` (text size), `AppearanceProvider` (the rest). The
Customize panel (`overlays/CustomizePanel.tsx`) and Settings → General (`modules/settings/GeneralSection.tsx`) both
draw `AppearanceControls`.

## Layout (`src/styles/layout.css`)

- `.app-top` holds the header (and, on a phone, the drawer); `.app-frame` / `.app-col` is the sidebar layout.
- `--page-max` and `--page-pad` size every page's content; `main` in `AppShell` applies them.
- `.app-side` is the sidebar; `html[data-nav="rail"]` narrows it to icons with tooltips (`.rail-tip`).
- `.app-offcanvas` is the Customize panel; `.app-nav-drawer` / `.app-nav-scrim` the phone menu.
- The footer is `.app-footer` with `.ft-*` classes.

The phone layout is decided in `src/lib/layout.ts`: width under 768, or a touch screen as the primary pointer under
1400 (a tablet in either orientation). `useUi().mobile` is that decision; `narrow` (< 1180) and `tight` (< 900) are
the desktop breakpoints the header and the Settings window use.

## Components (`src/styles/ui.css`)

The looks of the kit live here by class: `.btn` and its variants and sizes, `.btn-icon`, `.tabs` / `.tab-pill`,
`.switch`, the Select (`.sel-*`), the pager (`.pager-*`), tables (`.sort-btn`, `.row-click`), the date range, the
toast stack (`.toast*`), the confirm dialog (`.dz-*`), the error card (`.err-*`), the skeleton shimmer, the option
cards of Customize (`.opt-*`). A component sets layout inline (width, gap) and leaves colour and state to the class.

## The colour-scheme switch

`ThemeProvider.setPref(pref, origin)` swaps `data-theme` on `<html>`. Given an `origin` (the pressed button, from
`clickOrigin(e)`), the new look is painted inside a circle that grows out of that point until it covers the window:
`document.startViewTransition` snapshots the page, the tokens swap inside the callback, and the `::view-transition-new(root)`
pseudo-element is animated with a `clip-path: circle()`; `global.css` turns the default cross-fade off. Browsers without
the API, and people who chose reduced motion, get the plain swap.

## Before sign-in

`modules/landing` is the page at `/` for a visitor: `landing.css` holds its own classes (`.lp-*`, the `.rv` scroll
reveal, `.tilt`), `Mini.tsx` the CSS illustrations, all on the tokens. The sign-in page has two layouts chosen by
`BRAND.loginLayout` (`.auth-split` / `.auth-panel` for the brand panel, `.auth-page` for the centred card, both in
`global.css`); `BRAND.stats` are the numbers on the panel and in the hero.

## Fonts

Inter + Noto Sans Thai are bundled and loaded in `src/main.tsx`; IBM Plex Sans Thai and Sarabun are separate chunks
fetched only when picked (`src/lib/fonts.ts`). Nothing comes from Google Fonts: a PC with no internet must not stall.

## Brand

`src/constants/brand.ts` holds the name, the wordmark, the company, the tagline, the storage and event prefixes, the
default language and the default page size. `src/components/ui/AppLogo.tsx` draws the mark (replace `LOGO_MARK` with
your path on a 1000×1000 view box) and `public/favicon.svg` repeats it for the browser tab and the manifest.
