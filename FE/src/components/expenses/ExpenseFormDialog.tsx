import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Expense, ExpenseCategory } from '@/types';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'foodoutside', label: 'Food (Outside)' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'movie', label: 'Movie' },
  { value: 'travel', label: 'Travel' },
  { value: 'housing', label: 'Housing' },
  { value: 'cab', label: 'Cab' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'medical', label: 'Medical' },
  { value: 'sports', label: 'Sports' },
  { value: 'investments', label: 'Investments' },
  { value: 'internet', label: 'Internet' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_VALUES = [
  'foodoutside', 'grocery', 'movie', 'travel', 'housing', 'cab',
  'shopping', 'medical', 'sports', 'investments', 'internet', 'other',
] as const;

const schema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0.01, {
      message: 'Amount must be at least 0.01',
    }),
  category: z.enum(CATEGORY_VALUES, { error: 'Category is required' }),
  dateOfExpense: z.string().min(1, 'Date is required').refine(
    (v) => v <= localDateString(),
    { message: 'Date cannot be in the future' },
  ),
});

type FormValues = z.infer<typeof schema>;

export interface ExpenseFormPayload {
  description: string;
  amount: number;
  category: ExpenseCategory;
  dateOfExpense: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ExpenseFormPayload) => Promise<void>;
  expense?: Expense; // if provided → edit mode
}

function localDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ExpenseFormDialog({ open, onOpenChange, onSubmit, expense }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!expense;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      category: '' as ExpenseCategory,
      dateOfExpense: localDateString(),
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: String(expense.amount),
        category: expense.category,
        dateOfExpense: expense.dateOfExpense,
      });
    } else {
      form.reset({
        description: '',
        amount: '',
        category: '' as ExpenseCategory,
        dateOfExpense: localDateString(),
      });
    }
  }, [expense, form]);

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await onSubmit({
        description: values.description,
        amount: Number(values.amount),
        category: values.category,
        dateOfExpense: values.dateOfExpense,
      });
      form.reset();
      onOpenChange(false);
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (o: boolean) => {
    if (!o) form.reset();
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-4">

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <Input placeholder="e.g. Lunch at restaurant" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount <span className="text-destructive">*</span></FormLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormItem>
              <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string | null) =>
                          CATEGORIES.find((c) => c.value === value)?.label ?? 'Select a category'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </FormItem>

            {/* Date */}
            <FormField
              control={form.control}
              name="dateOfExpense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date <span className="text-destructive">*</span></FormLabel>
                  <Input type="date" max={localDateString()} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add Expense')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
