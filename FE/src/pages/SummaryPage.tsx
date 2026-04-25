import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthNavigator } from '@/components/expenses/MonthNavigator';
import { useUsers } from '@/hooks/useUsers';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import type { ExpenseCategory, CategoryBreakdown } from '@/types';

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
  foodoutside: 'bg-orange-500',
  grocery: 'bg-green-500',
  movie: 'bg-purple-500',
  travel: 'bg-blue-500',
  housing: 'bg-yellow-500',
  cab: 'bg-cyan-500',
  shopping: 'bg-pink-500',
  medical: 'bg-red-500',
  sports: 'bg-lime-500',
  investments: 'bg-indigo-500',
  internet: 'bg-sky-500',
  other: 'bg-gray-400',
};

const CATEGORY_BG: Record<ExpenseCategory, string> = {
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
  other: 'bg-gray-100 text-gray-600',
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {loading ? <Skeleton className="h-7 w-32" /> : value}
        </CardTitle>
      </CardHeader>
      {sub && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </CardContent>
      )}
    </Card>
  );
}

function CategoryBar({
  item,
  maxTotal,
}: {
  item: CategoryBreakdown;
  maxTotal: number;
}) {
  const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
  const cat = item.category as ExpenseCategory;

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span
        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium w-32 justify-center ${CATEGORY_BG[cat] ?? 'bg-gray-100 text-gray-600'}`}
      >
        {CATEGORY_LABELS[cat] ?? item.category}
      </span>

      {/* Bar */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${CATEGORY_COLORS[cat] ?? 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Amount + count */}
      <div className="flex items-baseline gap-1.5 shrink-0 min-w-[120px] justify-end">
        <span className="text-sm font-medium tabular-nums">
          {formatAmount(item.total)}
        </span>
        <span className="text-xs text-muted-foreground">
          ×{item.count}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SummaryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { users, loading: usersLoading } = useUsers();
  const effectiveUserId = selectedUserId ?? (users[0] ? String(users[0].id) : null);
  const userId = effectiveUserId ? Number(effectiveUserId) : null;
  const { summary, loading, error } = useMonthlySummary(userId, year, month);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  const maxTotal =
    summary && summary.categoryBreakdown.length > 0
      ? summary.categoryBreakdown[0].total
      : 1;

  const avgPerExpense =
    summary && summary.totalCount > 0
      ? summary.totalAmount / summary.totalCount
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monthly Summary</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Category-wise breakdown of expenses for a given month
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
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

        <MonthNavigator year={year} month={month} onChange={handleMonthChange} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Spent"
          value={formatAmount(summary?.totalAmount ?? 0)}
          loading={loading}
        />
        <StatCard
          label="Total Expenses"
          value={String(summary?.totalCount ?? 0)}
          sub="individual transactions"
          loading={loading}
        />
        <StatCard
          label="Avg per Expense"
          value={formatAmount(avgPerExpense)}
          loading={loading}
        />
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>
            Sorted by spend — highest to lowest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : !summary || summary.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expenses for this month.
            </p>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((item) => (
                <CategoryBar
                  key={item.category}
                  item={item}
                  maxTotal={maxTotal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top category callout */}
      {!loading && summary && summary.categoryBreakdown.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Highest spend:{' '}
          <span className="font-medium text-foreground">
            {CATEGORY_LABELS[summary.categoryBreakdown[0].category as ExpenseCategory] ??
              summary.categoryBreakdown[0].category}
          </span>{' '}
          at{' '}
          <span className="font-medium text-foreground">
            {formatAmount(summary.categoryBreakdown[0].total)}
          </span>{' '}
          ({Math.round((summary.categoryBreakdown[0].total / summary.totalAmount) * 100)}% of total)
        </p>
      )}
    </div>
  );
}
