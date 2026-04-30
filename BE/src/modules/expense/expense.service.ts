import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Expense } from "@/modules/expense/entity/expense.entity";
import { CreateExpenseDto } from "@/modules/expense/dto/create-expense.dto";
import { UpdateExpenseDto } from "@/modules/expense/dto/update-expense.dto";
import { DeleteExpenseDto } from "@/modules/expense/dto/delete-expense.dto";
import { GetMonthlySummaryDto } from "@/modules/expense/dto/get-monthly-summary.dto";
import { GetMonthlyExpensesDto } from "@/modules/expense/dto/get-monthly-expenses.dto";
import {
  MonthlyExpenseSummaryDto,
  CategoryBreakdown,
} from "@/modules/expense/dto/monthly-expense-summary.dto";
import { GetLastMonthsSummaryDto } from "@/modules/expense/dto/get-last-months-summary.dto";
import { LastMonthsSummaryDto } from "@/modules/expense/dto/last-months-summary.dto";
import { UserService } from "@/modules/user/user.service";

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly userService: UserService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { userId, description, amount, category, dateOfExpense } =
      createExpenseDto;

    // if user not found, userService will throw an error
    await this.userService.findOne(userId);

    const expense = this.expenseRepository.create({
      userId,
      description,
      amount,
      category,
      dateOfExpense,
    });

    return await this.expenseRepository.save(expense);
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id);
    if (Number(expense.userId) !== Number(updateExpenseDto.userId)) {
      throw new ForbiddenException(
        "You are not allowed to update this expense",
      );
    }
    Object.assign(expense, updateExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async delete(id: number, deleteExpenseDto: DeleteExpenseDto): Promise<void> {
    const expense = await this.findOne(id);
    if (Number(expense.userId) !== Number(deleteExpenseDto.userId)) {
      throw new ForbiddenException(
        "You are not allowed to delete this expense",
      );
    }
    await this.expenseRepository.remove(expense);
  }

  async getMonthlySummary(
    getMonthlySummaryDto: GetMonthlySummaryDto,
  ): Promise<MonthlyExpenseSummaryDto> {
    const { userId, year, month } = getMonthlySummaryDto;

    await this.userService.findOne(userId);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const expenses = await this.expenseRepository.find({
      where: {
        userId,
        dateOfExpense: Between(startDate, endDate),
      },
    });

    const categoryMap = new Map<string, { total: number; count: number }>();

    let totalAmount = 0;
    for (const expense of expenses) {
      const amount = Number(expense.amount);
      totalAmount += amount;

      const existing = categoryMap.get(expense.category);
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        categoryMap.set(expense.category, { total: amount, count: 1 });
      }
    }

    const categoryBreakdown: CategoryBreakdown[] = Array.from(
      categoryMap.entries(),
    ).map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }));

    categoryBreakdown.sort((a, b) => b.total - a.total);

    return {
      userId,
      year,
      month,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalCount: expenses.length,
      categoryBreakdown,
    };
  }

  async getLastMonthsSummary(
    dto: GetLastMonthsSummaryDto,
  ): Promise<LastMonthsSummaryDto> {
    const { userId, months, currentYear, currentMonth } = dto;

    await this.userService.findOne(userId);

    // Build list of (year, month) pairs from oldest to newest
    const periods: { year: number; month: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      periods.push({ year: y, month: m });
    }

    // Fetch all expenses in the full range with a single query
    const oldest = periods[0];
    const newest = periods[periods.length - 1];
    const rangeStart = `${oldest.year}-${String(oldest.month).padStart(2, "0")}-01`;
    const lastDay = new Date(newest.year, newest.month, 0).getDate();
    const rangeEnd = `${newest.year}-${String(newest.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const allExpenses = await this.expenseRepository.find({
      where: { userId, dateOfExpense: Between(rangeStart, rangeEnd) },
    });

    // Group expenses by year-month
    const byMonth = new Map<string, Expense[]>();
    for (const expense of allExpenses) {
      const d = new Date(expense.dateOfExpense);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(expense);
    }

    const summaries: MonthlyExpenseSummaryDto[] = periods.map(
      ({ year, month }) => {
        const expenses = byMonth.get(`${year}-${month}`) ?? [];
        const categoryMap = new Map<string, { total: number; count: number }>();
        let totalAmount = 0;

        for (const expense of expenses) {
          const amount = Number(expense.amount);
          totalAmount += amount;
          const existing = categoryMap.get(expense.category);
          if (existing) {
            existing.total += amount;
            existing.count += 1;
          } else categoryMap.set(expense.category, { total: amount, count: 1 });
        }

        const categoryBreakdown: CategoryBreakdown[] = Array.from(
          categoryMap.entries(),
        )
          .map(([category, data]) => ({
            category,
            total: Math.round(data.total * 100) / 100,
            count: data.count,
          }))
          .sort((a, b) => b.total - a.total);

        return {
          userId,
          year,
          month,
          totalAmount: Math.round(totalAmount * 100) / 100,
          totalCount: expenses.length,
          categoryBreakdown,
        };
      },
    );

    const peakMonth = summaries.reduce<MonthlyExpenseSummaryDto | null>(
      (best, cur) =>
        best === null || cur.totalAmount > best.totalAmount ? cur : best,
      null,
    );

    return {
      summaries,
      peakMonth,
      peakMonthTopCategories: peakMonth
        ? peakMonth.categoryBreakdown.slice(0, 5)
        : [],
    };
  }

  async getMonthlyExpenses(dto: GetMonthlyExpensesDto): Promise<Expense[]> {
    const { userId } = dto;

    const now = new Date();
    const year = dto.year ?? now.getFullYear();
    const month = dto.month ?? now.getMonth() + 1;

    await this.userService.findOne(userId);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return await this.expenseRepository.find({
      where: {
        userId,
        dateOfExpense: Between(startDate, endDate),
      },
      order: {
        dateOfExpense: "DESC",
        createdAt: "DESC",
      },
    });
  }
}
