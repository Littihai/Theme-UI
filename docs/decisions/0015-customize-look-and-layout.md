# 0015 — Customize: the look and the layout are the person's to change

Status: accepted and built.

## Context

The owner asked for a Customize panel in the style of Tabler's theme builder, so a person can shape the interface: colour
scheme, accent, font, grey base, corner radius, and the layout (where the menu lives, page width, what stays on screen while
scrolling, bars attached or floating, side panels attached or floating).

[ADR 0012](0012-top-navigation-and-tabler-style.md) made the top bar plus a horizontal menu the interface and removed the sidebar
([0002](0002-sidebar-navigation.md)). That stays the **default**: a person who never opens Customize sees exactly what 0012 describes.
The sidebar returns only as one of three choices for the menu, not as the platform's layout.

## Decision

Eleven per-device choices, each an attribute on `<html>`; a default has no attribute, so the stylesheet's own values stay the
default look. One table (`CHOICES` in `src/lib/appearance.ts`) lists key, attribute, default and allowed values;
`public/theme-init.js` repeats the table so the attributes are set before first paint (a layout must not jump when the app
loads). Colour scheme and text size keep their own providers.

| Choice | Values (default first) | Where it lands |
|---|---|---|
| accent | steel, azure, teal, green, indigo, violet, rose, amber, slate | `tokens.css`, the ramp is mixed from one colour |
| font | inter, plex, sarabun, system | `tokens.css` stacks; the two extra faces are separate chunks loaded on demand (`lib/fonts.ts`) |
| base (grey palette) | slate, gray, zinc, neutral, stone | `tokens.css`, generated: each step keeps its lightness, only hue and saturation change, muted grey checked at 4.5:1 |
| radius | sm, none, md, lg, xl | `--radius-*` tokens |
| nav | top, side, rail | `AppShell` picks `NavBar` or `SideNav`; a phone always gets the top bar and its menu panel |
| container | standard, narrow, wide, fluid | `--page-max` |
| sticky | header, all, none | `styles/layout.css` |
| navStyle, panelStyle | attached, floating | `styles/layout.css`; the panel style covers the Customize panel and the phone menu |

The controls exist once (`AppearanceControls`) and appear in two places: the Customize off-canvas panel (brush in the top bar, or the
account menu on a phone) and the top of Settings > General. The panel does not dim the page, so a change is seen as it is made.

The menu items are built once (`useNavItems`) and drawn by the top bar, the sidebar and the phone panel, so the three cannot disagree
about what a person may open.

## Options not taken

- Store the choices on the server per user: they would follow the person between devices, but it adds a table, an endpoint and a
  migration for a cosmetic setting, and the existing theme, accent and text size are per device already.
- A red accent: it would read as "danger" next to the red status tones, so it is left out.
- Install a CSS framework for the theme builder: ADR 0012 already chose our own tokens.

## Consequences

- Two typefaces (`@fontsource/ibm-plex-sans-thai`, `@fontsource/sarabun`) are new dependencies; neither is downloaded until chosen.
- The allowed values live in two files (`appearance.ts`, `theme-init.js`); change both. A mismatch only costs a flash before React runs.
- The grey bases are generated CSS: change a base by regenerating it, not by hand-editing one step.
- Printed documents ignore all of this: `.pr-paper` and `.mt-paper` declare the light palette, and the sidebar and panels are hidden on paper.
