# 0041 — Material Symbols through `AppIcon`

**Date:** 2026-11-03 · **Status:** accepted · **Amends:** 0005 (Octicons only)

## Context

0005 chose GitHub's Octicons for one visual language across modules. Flutter bundles Material Symbols with the
framework; Octicons would be a third-party package with its own release cadence, or an icon font to generate and keep.

## Decision

Icons are Material Symbols, reached only through the `AppIcon` enum (`lib/constants/icons.dart`): a name per icon,
`AppIconW(AppIcon.bell)` to draw one, a new name added to the enum before it is used. What 0005 protected stays:
one set, one size scale, no emoji, no ad-hoc `Icons.*` in a widget.

## Consequences

- Swapping the set later (Octicons as a font, a custom set) is one file: every call site names an `AppIcon`.
- The names keep the Octicon vocabulary of the React starter (`fileCheck`, `shieldLock`, `threeBars`) so a module's
  menu entry reads the same in both starters.
