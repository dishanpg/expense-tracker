# Bug Tracker

| # | Description | Status | Reported |
|---|-------------|--------|----------|
| 1 | Expense created for a different month incorrectly appears in the current month's list on the Expenses page (UI only — backend stores correctly). `createExpense` was appending to local state without checking if the expense date falls within the viewed month/year. Same issue on edit when date is changed to a different month. | Fixed | 2026-04-25 |
