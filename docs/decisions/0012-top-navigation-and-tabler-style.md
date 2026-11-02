# 0012 — Top navigation and a Tabler-style look, built from our own tokens

Status: accepted. Supersedes [0002](0002-sidebar-navigation.md).

## Context
The owner asked for the interface to look like the Tabler admin dashboard: a white top bar with the brand and the account
controls, a horizontal menu below it, a page header with a small pre-title and the actions on the right, and statistic cards.

## Options
- Install `@tabler/core` and rebuild every page with its classes: the closest look, but a second styling system next to ours.
- Restyle with our own design tokens and components: the same look, one styling system, a smaller bundle.

## Decision
Our own tokens. `styles/tokens.css` now carries a Tabler-like palette (blue accent, cool greys, light and dark), the Inter
typeface (with Noto Sans Thai for Thai text) and 3 to 8 px radii. The sidebar is replaced by `Header` (brand, search, theme,
language, notifications, account chip) and `NavBar` (Home, Applications, each application the person may open, Settings). An item is an icon, a label and a chevron when it has a menu (Applications, Purchase requisition with its pages, Settings with its sections); the current section has a dark line under its label. On a
phone the menu drops down from a button. Every page opens with `PageHeader`. The overview has a welcome card and statistic
tiles. The account menu drops down from the account chip. The mark is a bear in a dark round badge, drawn inline.

No Tabler code, illustration or photo is copied; only the layout ideas are.

## Consequences
- ADR-0002 (sidebar, no top menu) no longer applies. Application group colours are still defined but the grouped sidebar that
  used them is gone; the launcher page still groups by them.
- The default accent is now blue ("Blue" in Settings, id `steel`); the other accents are unchanged.
- Fonts: the Barlow packages are no longer imported (they can be removed from `package.json` when convenient).
