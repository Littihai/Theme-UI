# Decisions

The design decisions this starter inherits from the Lotline platform, kept as they were written there (the numbering
is Lotline's; the gaps are decisions about Lotline's own modules, which do not apply here). A new project adds its own
records to this folder — one file per decision, never editing an earlier one.

| # | Decision |
|---|---|
| [0002](0002-sidebar-navigation.md) | A sidebar navigation (later one of three layouts the person chooses) |
| [0004](0004-pagination-ten-rows.md) | Any list that can pass ten rows is paged |
| [0005](0005-octicons-only.md) | Octicons are the only icons; no emoji |
| [0012](0012-top-navigation-and-tabler-style.md) | Top navigation and the Tabler-like look |
| [0015](0015-customize-look-and-layout.md) | Customize: every look-and-layout choice as an attribute on `<html>` |
| [0016](0016-footer-and-contact-page.md) | The footer and how support is reached |
| [0024](0024-one-error-envelope.md) | One error envelope, readable failures by status and code |
| [0034](0034-ui-completeness-batch.md) | The completeness batch: empty, error and loading states everywhere |
| [0038](0038-single-row-header-mega-menu.md) | One header row: Home plus the application mega menu |
| [0039](0039-overview-as-direct-nav-link.md) | A direct link beside Home (here: `NAV_DIRECT` in `src/constants/nav.ts`) |
