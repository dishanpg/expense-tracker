import { ApiProperty } from "@nestjs/swagger";

export class CategoryBreakdown {
  @ApiProperty({ description: "Expense category", example: "grocery" })
  category: string;

  @ApiProperty({
    description: "Total amount for this category",
    example: 150.5,
  })
  total: number;

  @ApiProperty({
    description: "Number of expenses in this category",
    example: 5,
  })
  count: number;
}

export class MonthlyExpenseSummaryDto {
  @ApiProperty({ description: "User ID", example: 1 })
  userId: number;

  @ApiProperty({ description: "Year", example: 2026 })
  year: number;

  @ApiProperty({ description: "Month (1-12)", example: 3 })
  month: number;

  @ApiProperty({
    description: "Total expense amount for the month",
    example: 1250.75,
  })
  totalAmount: number;

  @ApiProperty({ description: "Total number of expenses", example: 15 })
  totalCount: number;

  @ApiProperty({
    type: [CategoryBreakdown],
    description: "Category-wise breakdown",
  })
  categoryBreakdown: CategoryBreakdown[];
}
