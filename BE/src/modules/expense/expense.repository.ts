import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expense } from "@/modules/expense/entity/expense.entity";
import { CreateExpenseDto } from "@/modules/expense/dto/create-expense.dto";

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<void> {
    const expense = this.expenseRepository.create(createExpenseDto);
    await this.expenseRepository.save(expense);
  }

  async getExpense(): Promise<Expense[]> {
    const expenses = await this.expenseRepository.find();
    return expenses;
  }

  async getExpenseById(id: number): Promise<Expense | null> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    return expense;
  }
}
