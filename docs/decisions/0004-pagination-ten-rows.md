# 0004 — Lists over 10 rows paginate at 10

Status: accepted

## Decision
A list or table that can exceed 10 rows paginates at 10 per page (previous / next and "page X / Y"), shows the controls only
when needed, and returns to page 1 when a search or filter changes. New list components use `components/ui/Pager.tsx`.

## Consequences
- Pages stay short and fast on phones.
