# Decisions

The design decisions this starter inherits from the Lotline platform (0002–0039, kept as they were written there; the
numbering is Lotline's and the gaps are decisions about Lotline's own modules) and the ones this starter made itself
(0040 onward). A new project adds its own records to this folder — one file per decision, never editing an earlier one.

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
| [0039](0039-overview-as-direct-nav-link.md) | A direct link beside Home (here: `navDirect` in `lib/constants/nav.dart`) |
| [0040](0040-flutter-stack.md) | The starter is a Flutter app: what each React decision became |
| [0041](0041-material-icons-on-flutter.md) | Material Symbols through `AppIcon` (amends 0005) |
