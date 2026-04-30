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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useUsers } from '@/hooks/useUsers';
import { useLastMonthsSummary } from '@/hooks/useLastMonthsSummary';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import type { ExpenseCategory, MonthlyExpenseSummary, CategoryBreakdown } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    maximumFractionDigits: 0,
  }).format(amount);
}

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1]} '${String(year).slice(2)}`;
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({
  summaries,
  peakMonth,
}: {
  summaries: MonthlyExpenseSummary[];
  peakMonth: MonthlyExpenseSummary | null;
}) {
  const maxAmount = Math.max(...summaries.map((s) => s.totalAmount), 1);

  return (
    <div className="flex items-end gap-3 pt-8" style={{ height: '168px' }}>
      {summaries.map((s) => {
        const heightPct = (s.totalAmount / maxAmount) * 100;
        const isPeak =
          peakMonth && s.year === peakMonth.year && s.month === peakMonth.month && s.totalAmount > 0;
        const opacity = s.totalAmount > 0 ? 0.25 + (s.totalAmount / maxAmount) * 0.45 : 0.08;
        const tooltipText = s.totalAmount > 0
          ? `${MONTH_NAMES[s.month - 1]} ${s.year} · ${formatAmount(s.totalAmount)} · ${s.totalCount} txn${s.totalCount !== 1 ? 's' : ''}`
          : `${MONTH_NAMES[s.month - 1]} ${s.year} · No expenses`;

        return (
          <div key={`${s.year}-${s.month}`} className="flex-1 flex flex-col items-center h-full justify-end">
            <Tooltip>
              <TooltipTrigger
                render={<div />}
                className="w-full flex flex-col items-center justify-end cursor-default"
                style={{ flex: 1 }}
              >
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(heightPct, s.totalAmount > 0 ? 6 : 2)}%`,
                    maxHeight: '108px',
                    background: isPeak
                      ? 'linear-gradient(to top, #0369a1, #38bdf8)'
                      : `rgba(14, 165, 233, ${opacity})`,
                    boxShadow: isPeak ? '0 4px 14px rgba(3, 105, 161, 0.35)' : 'none',
                  }}
                />
                <span className={`text-[10px] mt-1.5 leading-none font-medium ${isPeak ? 'text-sky-600' : 'text-muted-foreground'}`}>
                  {monthLabel(s.year, s.month)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">{tooltipText}</TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({ item, rank }: { item: CategoryBreakdown; rank: number }) {
  const cat = item.category as ExpenseCategory;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{rank}</span>
      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BG[cat] ?? 'bg-gray-100 text-gray-600'}`}>
        {CATEGORY_LABELS[cat] ?? item.category}
      </span>
      <div className="flex-1" />
      <span className="text-sm font-medium tabular-nums">{formatAmount(item.total)}</span>
      <span className="text-xs text-muted-foreground w-8 text-right">×{item.count}</span>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex items-end gap-3 pt-8" style={{ height: '168px' }}>
      {[60, 40, 75, 30, 90, 55].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end">
          <Skeleton className="w-full rounded-t-md" style={{ height: `${h}px` }} />
          <Skeleton className="h-3 w-8 mt-1.5" />
        </div>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users, loading: usersLoading } = useUsers();
  const effectiveUserId = selectedUserId ?? (users[0] ? String(users[0].id) : null);
  const userId = effectiveUserId ? Number(effectiveUserId) : null;

  const { data, loading, error } = useLastMonthsSummary(userId, 6, currentYear, currentMonth);
  const { summary: currentSummary, loading: currentLoading } = useMonthlySummary(userId, currentYear, currentMonth);

  const peakMonth = data?.peakMonth ?? null;
  const topCategories = data?.peakMonthTopCategories ?? [];
  const hasData = peakMonth && peakMonth.totalAmount > 0;

  const currentTopCategories = currentSummary?.categoryBreakdown.slice(0, 5) ?? [];
  const currentAvg = currentSummary && currentSummary.totalCount > 0
    ? currentSummary.totalAmount / currentSummary.totalCount
    : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Last 6 months at a glance</p>
        </div>
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
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* 6-month bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Spend</CardTitle>
          <CardDescription>Month-wise total · peak month highlighted</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? <ChartSkeleton /> : (
            <BarChart summaries={data.summaries} peakMonth={peakMonth} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Current month — left */}
        <Card>
          <CardHeader>
            <CardTitle>{MONTH_NAMES[currentMonth - 1]} {currentYear} — So Far</CardTitle>
            <CardDescription>Ongoing month spend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {currentLoading ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-9 w-36" />
                  <div className="flex gap-6 pt-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <CategoriesSkeleton />
              </div>
            ) : !currentSummary || currentSummary.totalCount === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses recorded this month yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6 divide-x">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-semibold tabular-nums">{formatAmount(currentSummary.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">total spend</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Transactions</p>
                      <p className="font-medium">{currentSummary.totalCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg per txn</p>
                      <p className="font-medium">{formatAmount(currentAvg)}</p>
                    </div>
                  </div>
                </div>
                <div className="pl-6">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Top categories</p>
                  <div className="space-y-3">
                    {currentTopCategories.map((item, i) => (
                      <CategoryRow key={item.category} item={item} rank={i + 1} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak month — right */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Month</CardTitle>
            <CardDescription>
              {hasData
                ? `Highest spend · ${MONTH_NAMES[peakMonth!.month - 1]} ${peakMonth!.year}`
                : 'Highest spending month in the last 6'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-6 pt-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <CategoriesSkeleton />
              </div>
            ) : !hasData ? (
              <p className="text-sm text-muted-foreground">No expenses in the last 6 months.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6 divide-x">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-semibold tabular-nums">{formatAmount(peakMonth!.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {MONTH_NAMES[peakMonth!.month - 1]} {peakMonth!.year}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Transactions</p>
                      <p className="font-medium">{peakMonth!.totalCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg per txn</p>
                      <p className="font-medium">
                        {peakMonth!.totalCount > 0
                          ? formatAmount(peakMonth!.totalAmount / peakMonth!.totalCount)
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pl-6">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Top categories</p>
                  {topCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data.</p>
                  ) : (
                    <div className="space-y-3">
                      {topCategories.map((item, i) => (
                        <CategoryRow key={item.category} item={item} rank={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
