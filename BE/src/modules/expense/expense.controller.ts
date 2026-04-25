import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { ExpenseService } from "./expense.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { DeleteExpenseDto } from "./dto/delete-expense.dto";
import { GetMonthlySummaryDto } from "./dto/get-monthly-summary.dto";
import { MonthlyExpenseSummaryDto } from "./dto/monthly-expense-summary.dto";
import { GetMonthlyExpensesDto } from "./dto/get-monthly-expenses.dto";
import { GetLastMonthsSummaryDto } from "./dto/get-last-months-summary.dto";
import { LastMonthsSummaryDto } from "./dto/last-months-summary.dto";
import { Expense } from "@/modules/expense/entity/expense.entity";

@ApiTags("Expense")
@Controller("v1/api/expenses")
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly expense list with all details" })
  @ApiResponse({
    status: 200,
    description: "Monthly expenses retrieved successfully",
    type: [Expense],
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getMonthlyExpenses(
    @Query() getMonthlyExpensesDto: GetMonthlyExpensesDto,
  ): Promise<Expense[]> {
    return this.expenseService.getMonthlyExpenses(getMonthlyExpensesDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single expense by ID" })
  @ApiParam({ name: "id", description: "Expense ID", type: Number })
  @ApiResponse({ status: 200, description: "Expense found", type: Expense })
  @ApiResponse({ status: 400, description: "Invalid expense ID" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Expense> {
    return this.expenseService.findOne(id);
  }

  @Post("last-months-summary")
  @ApiOperation({
    summary:
      "Get last N months summary — per-month totals, peak month, and top 5 categories",
  })
  @ApiResponse({
    status: 200,
    description: "Last months summary retrieved successfully",
    type: LastMonthsSummaryDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getLastMonthsSummary(
    @Body() dto: GetLastMonthsSummaryDto,
  ): Promise<LastMonthsSummaryDto> {
    return this.expenseService.getLastMonthsSummary(dto);
  }

  @Post("monthly-summary")
  @ApiOperation({
    summary: "Get monthly expense summary with category breakdown",
  })
  @ApiResponse({
    status: 200,
    description: "Monthly summary retrieved successfully",
    type: MonthlyExpenseSummaryDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getMonthlySummary(
    @Body() getMonthlySummaryDto: GetMonthlySummaryDto,
  ): Promise<MonthlyExpenseSummaryDto> {
    return this.expenseService.getMonthlySummary(getMonthlySummaryDto);
  }

  @Post()
  @ApiOperation({ summary: "Create a new expense" })
  @ApiResponse({
    status: 201,
    description: "Expense created successfully",
    type: Expense,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expenseService.create(createExpenseDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an expense" })
  @ApiParam({ name: "id", description: "Expense ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "Expense updated successfully",
    type: Expense,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an expense" })
  @ApiParam({ name: "id", description: "Expense ID", type: Number })
  @ApiResponse({ status: 204, description: "Expense deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 403,
    description: "Not allowed to delete this expense",
  })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
    @Body() deleteExpenseDto: DeleteExpenseDto,
  ): Promise<void> {
    return this.expenseService.delete(id, deleteExpenseDto);
  }
}
