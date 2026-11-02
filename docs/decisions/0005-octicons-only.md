# 0005 — Icons come from Octicons only

Status: accepted

## Context
Icons were a mix of emoji, line icons and one-off SVGs.

## Decision
Use Octicons (`@primer/octicons-react`) through `<Icon name>` only. No emoji as icons. A new icon is added to the `ICON` map
first.

## Consequences
- One visual language, one place to change it.
- The Lotline mark itself is an inline SVG (`LotlineLogo`), the one exception.
