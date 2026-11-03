# Theme guide

How the look is built, where to change it, and what every Customize choice does. Everything here is a few small
Dart files under `lib/theme`; no widget branches on the theme.

## Tokens (`lib/theme/tokens.dart`)

Every colour, radius, shadow and type size is a field of `AppTokens`, a `ThemeExtension` a widget reads with
`context.tokens`. A widget never holds a hex value. `AppTokens.build(...)` makes the tokens for one combination of the
choices below; `lib/app/app.dart` calls it whenever a store changes and hands the result to `buildTheme` (which maps
the tokens onto Material's `ThemeData` for the stock widgets: dialogs, menus, text fields, tooltips).

| Group | Fields |
|---|---|
| ground | `bg`, `surface`, `text`, `accent`, `accent2`, `divider`, `onAccent`, `scrim`, `brandDeep` / `onBrandDeep` |
| neutral ramp | `n50` … `n900` (`muted` = `n600`) |
| accent ramp | `a100` … `a900` |
| status tones | `warnFg/Bg/Solid`, `okFg/Bg/Solid`, `stopFg/Bg/Solid`, `danger`; `tone(StatusTone)` gives the three of one tone |
| charts | `chart1` … `chart5` |
| elevation | `shadowSm`, `shadowMd`, `shadowLg` |
| corners | `radiusSm/Md/Lg/Xl` and the `rSm` … `rXl` `BorderRadius` |
| frame | `pageMax` (the page width), `pagePad`, the type scale (`textXs` … `text3xl`), the control heights |
| type | `fontFamily`, `fontFallback` |

The dark palette mirrors the ramps rather than recolouring them: `n100` is still "the faintest tint above the
surface" and `a700` is still "accent text", so a widget written against the light theme reads correctly in the dark one.

To retune the default look, edit the constants in `tokens.dart` (`_lightBases`, `_darkBases`, `_lightTones`,
`_darkTones`). To add an accent, add a value to `Accent` in `appearance.dart`, one line to `accentSeeds`, and its name
to `dict_core.dart` (`set.accent.<id>`).

## Customize (`lib/theme/appearance.dart`)

Each choice is one enum, remembered under `app.<name>` through `shared_preferences`; a default is never written, so a
cleared storage means exactly the defaults.

| Choice | Values | Read by |
|---|---|---|
| colour scheme (`ThemeStore`) | light · dark · system | `AppTokens.build(dark:)` |
| `accent` | steel · azure · teal · green · indigo · violet · rose · amber · slate | the accent ramp |
| `base` | slate · gray · zinc · neutral · stone | the neutral ramp, `bg`, `surface`, `text` |
| `font` | inter · plex · sarabun · system | `fontFamily` (Plex and Sarabun are registered on demand by `fonts.dart`) |
| `radius` | none · sm · md · lg · xl | the four radii |
| `contrast` | standard · high | the text and the neutral ramp 200–900 |
| `motion` | auto · reduce · full | `context.reducedMotion` (every animation checks it) |
| text size (`FontSizeStore`) | s · m · l | the `MediaQuery` text scaler in `app.dart` |
| `nav` | top · side · rail | `AppShell`: the single-row header, a sidebar, an icon rail |
| `container` | narrow · standard · wide · fluid | `pageMax` |
| `sticky` | header · all · none | `AppShell` (none = the header hides on scroll-down) |
| `navStyle` | attached · floating | the header and the sidebar inset on a shadow |
| `panelStyle` | attached · floating | the drawers (phone menu, Customize) |

`web/index.html` reads the saved scheme (`flutter.app.theme`) before Flutter starts and paints the page background,
so a dark-mode person never sees a white flash; `main()` reads every store before `runApp`.

The Customize panel (`overlays/customize_panel.dart`) and Settings → General (`modules/settings/general_section.dart`)
both draw `AppearanceControls`.

## Layout

- `AppShell` (`lib/layouts/app_shell.dart`): the status bar, the header (or the sidebar + header), the page, the
  footer; the phone menu is the start drawer, Customize the end drawer. Ctrl-K opens the palette, Ctrl-, Settings.
- A page returns `ShellPage(child: PageBody(children: [...]))`: `ShellPage` is the scroll view with the footer at the
  end, `PageBody` the padding and the page width. `Cols` puts panels side by side on a desktop and stacks them on a
  phone; `TileGrid` lays stat tiles out four / two / one across.
- The phone layout is decided by width (`Breakpoints.mobile` = 768); `narrow` (< 1180) and `tight` (< 900) are the
  desktop breakpoints the header and the Settings window use. `context.isMobile`, `isTight`, `isNarrow`.

## The colour-scheme switch

`ThemeStore.setPref(pref, origin: …)` swaps the scheme. Given an origin (the pressed button's centre, from
`originOf(context)`), `ThemeReveal` (`overlays/theme_reveal.dart`) captures the old frame as an image, swaps the theme
underneath, and clips a growing hole out of the old picture until it is gone (520 ms). Reduced motion, or no origin,
means a plain swap.

## Before sign-in

`modules/landing` is the page at `/` for a visitor: `Reveal` fades sections in as they scroll into view, `Tilt` lifts
a card toward the pointer, `mini.dart` draws the small illustrations with widgets, all on the tokens. The sign-in page
has two layouts chosen by `Brand.loginLayout` (a dark brand panel beside the card, or the card alone); `Brand.stats`
are the numbers on the panel and in the landing hero.

## Fonts

Inter + Noto Sans Thai are bundled through `pubspec.yaml` and load with the app; IBM Plex Sans Thai and Sarabun sit
in `assets/fonts/lazy` and are registered by `ensureFont` only when picked. Nothing comes from Google Fonts at run
time: a PC with no internet must not stall. The files carry the Thai and Latin subsets (OFL).

## Brand

`lib/constants/brand.dart` holds the name, the wordmark, the company, the tagline, the sign-in layout, the storage
prefix, the default language and the default page size. `lib/components/ui/app_logo.dart` draws the mark
(`LogoPainter`, a 100×100 canvas); `web/favicon.svg` and the PNGs in `web/icons` repeat it for the browser tab and the
manifest.
