# 0016 — A footer on every page and a Contact page a visitor can open

Status: accepted and built.

## Context

The owner asked for a footer and a Contact page. Until now the foot of a page was one line (copyright and version), the only
contact detail was a mail link in Settings > About and under the sign-in form, and a visitor who could not sign in had nowhere
to look for help except that one line.

## Decision

- One `AppFooter` component, used by the application frame and by the public frame: the brand and what the system is, a
  "Platform" list, a "Help" list, how to reach support, and the small print (company, rights, version). `signedIn` only changes
  the links (a visitor is offered the overview and the sign-in; a signed-in person Home, Applications and Settings > About).
- A `/contact` page. Signed in, it sits inside the application frame. Not signed in, it opens in the public frame
  (`PublicFrame`, shared with the public overview): a visitor locked out of their account is exactly who needs it. It is the only
  page besides `/` that a visitor can open, and it calls no API.
- The page shows email, phone, opening hours and an office address, what to say when asking for help, and the details of this
  device (build, page, language, theme, browser, employee code when signed in) ready to copy. The email button opens the
  person's own mail app (`mailto:`) with the same details filled in. **Nothing is sent by the system**, so there is no form, no
  endpoint, no mail relay to protect and no personal data stored.
- Every contact detail is fictional: `support@example.com`, a number that cannot be dialled, a made-up street
  (ADR [0011](0011-fictional-data-and-demo-access.md)). They live in `lib/support.ts` and the dictionary, not scattered in pages.

## Options not taken

- A contact form posting to the API: it would need rate limiting, spam protection (there is still no CAPTCHA, ADR 0011), storage
  and a place to read the messages, for a portfolio demo that has no support desk behind it.
- Keeping `/contact` behind the sign-in: simpler, but then the people who most need it cannot reach it.

## Consequences

- The footer follows the page-width choice of ADR [0015](0015-customize-look-and-layout.md); the public pages use a fixed width.
- Paper hides the footer (`@media print`), like the sidebar and the panels.
- A real deployment changes the contact details in two places: `lib/support.ts` and the `ct.*` / `ft.*` keys in `i18n/dict.contact.ts`.
