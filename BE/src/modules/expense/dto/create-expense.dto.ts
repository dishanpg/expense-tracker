import {
  IsString,
  IsNumber,
  IsDateString,
  IsPositive,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ExpenseCategory } from "@/modules/expense/entity/expense.entity";

export class CreateExpenseDto {
  @ApiProperty({
    description: "ID of the user who owns this expense",
    example: 1,
  })
  @IsInt({ message: "User ID must be an integer" })
  @IsPositive({ message: "User ID must be a positive number" })
  userId: number;

  @ApiProperty({
    description: "Description of the expense",
    example: "Lunch at restaurant",
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty({ message: "Description is required" })
  @MinLength(3, { message: "Description must be at least 3 characters long" })
  description: string;

  @ApiProperty({
    description: "Amount of the expense",
    example: 25.5,
    minimum: 0.01,
  })
  @IsNumber({}, { message: "Amount must be a number" })
  @IsPositive({ message: "Amount must be positive" })
  @Min(0.01, { message: "Amount must be greater than 0" })
  amount: number;

  @ApiProperty({
    description: "Category of the expense",
    enum: ExpenseCategory,
    example: ExpenseCategory.FOODOUTSIDE,
  })
  @IsNotEmpty({ message: "Category is required" })
  @IsEnum(ExpenseCategory, { message: "Invalid expense category" })
  category: ExpenseCategory;

  @ApiProperty({
    description: "Date of the expense",
    example: "2026-03-07",
  })
  @IsDateString(
    {},
    { message: "Date of expense must be a valid ISO date string" },
  )
  @IsNotEmpty({ message: "Date of expense is required" })
  dateOfExpense: string;
}
