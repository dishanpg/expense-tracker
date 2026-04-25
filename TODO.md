# Expense Tracker — V2 TODO

Items identified after MVP. Pick up in the next version.

---

## UX / Interaction

- [ ] **Toast notifications** — show success/error snackbar on create, update, delete across all pages
- [ ] **Auto-close form on submit** — ExpenseFormDialog and CreateUserDialog should close and reset after a successful save
- [ ] **Empty state illustration** — replace plain "No expenses" text with a proper empty state on the Expenses page

## Data & Filtering

- [ ] **Category filter on Expenses page** — dropdown to filter the table by one or more categories
- [ ] **Multi-month comparison on Summary page** — allow selecting a range or showing a sparkline trend alongside the single-month view
- [ ] **All-users aggregate on Dashboard** — option to see combined spend across all users in the bar chart

## Validation & Edge Cases

- [ ] **Delete user guard** — warn (and optionally block) when deleting a user who has existing expenses; those expenses become orphaned
- [ ] **Negative amount guard** — add `min: 0.01` validation on the amount field in the expense form
- [ ] **Category casing normalisation** — backend should normalise category values to lowercase before saving to avoid duplicates in breakdown

## Visual / Polish

- [ ] **Favicon + page title** — set a proper favicon and `<title>` (e.g. "Expense Tracker")
- [ ] **User initials avatar** — show a coloured circle with initials on the Users page so rows are easier to scan
- [ ] **Mobile layout** — test and fix sidebar + table layout on small screens

## Technical

- [ ] **Pagination on Expenses table** — add server-side pagination (page + limit query params) to handle 100+ entries
- [ ] **User-friendly API error messages** — map common HTTP error codes to readable strings instead of showing raw error text
- [ ] **App shell loading state** — show a skeleton or spinner in the sidebar while the users list is fetching on first load
