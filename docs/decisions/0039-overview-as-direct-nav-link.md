# 0039 — Overview is a direct link beside Home, not a mega-menu entry

Date: 2026-10-24 · Status: accepted · Amends: 0038

## Decision

The system overview (`/overview`) moves out of the mega menu's tools group and becomes a
direct top-level link on every navigation surface, right after Home: a labelled button in
the single-row header, a row in the phone drawer, and a row (icon in the rail) in the
sidebar modes. `useNavGroups` returns it as a standalone entry alongside `home`; the tools
group keeps Barcode and the full application launcher.

## Why

The overview is a cross-module page people open often; burying it one click deep inside the
application menu treated it like just another module. The owner asked for it beside Home.

## Consequence for the header's width

The extra button costs about 100px in Thai, which crushed the language toggle between
~790 and ~990px and overflowed the row at 768px. The header therefore sheds weight earlier,
with header-local breakpoints instead of the shared `tight` (900):

- below **1010px** the labelled search becomes the icon the phone uses (was 900);
- below **910px** the account chip drops its name and role and keeps the avatar (the name
  moves to the button's tooltip), as on a phone;
- the language toggle is `flex-shrink: 0` — if a future addition overflows the row again,
  the overflow must be visible instead of the toggle silently disappearing.

The shared `tight` breakpoint is unchanged (settings layout and page padding still use it).
