import { ApiProperty } from "@nestjs/swagger";
import {
  MonthlyExpenseSummaryDto,
  CategoryBreakdown,
} from "./monthly-expense-summary.dto";

export class LastMonthsSummaryDto {
  @ApiProperty({
    type: [MonthlyExpenseSummaryDto],
    description: "Per-month summaries ordered oldest to newest",
  })
  summaries: MonthlyExpenseSummaryDto[];

  @ApiProperty({
    type: MonthlyExpenseSummaryDto,
    nullable: true,
    description: "Month with highest total spend",
  })
  peakMonth: MonthlyExpenseSummaryDto | null;

  @ApiProperty({
    type: [CategoryBreakdown],
    description: "Top 5 categories of the peak month",
  })
  peakMonthTopCategories: CategoryBreakdown[];
}
