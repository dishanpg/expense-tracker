import { useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthNavigator } from '@/components/expenses/MonthNavigator';
import { ExpenseFormDialog, type ExpenseFormPayload } from '@/components/expenses/ExpenseFormDialog';
import { useUsers } from '@/hooks/useUsers';
import { useExpenses } from '@/hooks/useExpenses';
import type { Expense, ExpenseCategory } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  foodoutside: 'Food (Outside)',
  grocery: 'Grocery',
  movie: 'Movie',
  travel: 'Travel',
  housing: 'Housing',
  cab: 'Cab',
  shopping: 'Shopping',
  medical: 'Medical',
  sports: 'Sports',
  investments: 'Investments',
  internet: 'Internet',
  other: 'Other',
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  foodoutside: 'bg-orange-100 text-orange-700',
  grocery: 'bg-green-100 text-green-700',
  movie: 'bg-purple-100 text-purple-700',
  travel: 'bg-blue-100 text-blue-700',
  housing: 'bg-yellow-100 text-yellow-700',
  cab: 'bg-cyan-100 text-cyan-700',
  shopping: 'bg-pink-100 text-pink-700',
  medical: 'bg-red-100 text-red-700',
  sports: 'bg-lime-100 text-lime-700',
  investments: 'bg-indigo-100 text-indigo-700',
  internet: 'bg-sky-100 text-sky-700',
  other: 'bg-gray-100 text-gray-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { users, loading: usersLoading } = useUsers();
  const effectiveUserId = selectedUserId ?? (users[0] ? String(users[0].id) : null);
  const userId = effectiveUserId ? Number(effectiveUserId) : null;
  const { expenses, loading: expensesLoading, error, createExpense, updateExpense, deleteExpense } = useExpenses(userId, year, month);

  const loading = expensesLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  const handleAdd = async (payload: ExpenseFormPayload) => {
    if (!userId) return;
    await createExpense({ ...payload, userId });
  };

  const handleEdit = async (payload: ExpenseFormPayload) => {
    if (!editingExpense || !userId) return;
    await updateExpense(editingExpense.id, { ...payload, userId });
    setEditingExpense(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete || !userId) return;
    setDeleting(true);
    try {
      await deleteExpense(expenseToDelete.id, userId);
      setExpenseToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track and manage expenses by user and month
          </p>
        </div>
        <Button onClick={() => { setEditingExpense(undefined); setFormOpen(true); }} disabled={!effectiveUserId}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* User selector */}
        <Select
          value={effectiveUserId ?? ''}
          onValueChange={(v) => { if (v) setSelectedUserId(v); }}
          disabled={usersLoading}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string | null) =>
                users.find((u) => String(u.id) === value)?.name ?? 'Select user'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month navigator */}
        <MonthNavigator year={year} month={month} onChange={handleMonthChange} />

        {/* Total pill */}
        {expenses.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} ·{' '}
            <span className="font-medium text-foreground">{formatAmount(totalAmount)}</span>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No expenses for this month.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(expense.dateOfExpense)}
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatAmount(Number(expense.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(expense)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setExpenseToDelete(expense)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit dialog */}
      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditingExpense(undefined); }}
        onSubmit={editingExpense ? handleEdit : handleAdd}
        expense={editingExpense}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={!!expenseToDelete}
        onOpenChange={(o) => { if (!o) setExpenseToDelete(null); }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete{' '}
            <span className="font-medium text-foreground">
              "{expenseToDelete?.description}"
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setExpenseToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
