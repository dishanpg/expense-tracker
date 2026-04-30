import { IsInt, IsPositive, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetLastMonthsSummaryDto {
  @ApiProperty({ description: "ID of the user", example: 1 })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: "Number of past months to include (including current)",
    example: 6,
    minimum: 1,
    maximum: 24,
  })
  @IsInt()
  @Min(1)
  @Max(24)
  months: number;

  @ApiProperty({ description: "Current year in caller's local timezone", example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  currentYear: number;

  @ApiProperty({ description: "Current month (1–12) in caller's local timezone", example: 5 })
  @IsInt()
  @Min(1)
  @Max(12)
  currentMonth: number;
}
