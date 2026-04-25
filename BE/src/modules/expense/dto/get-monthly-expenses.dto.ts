import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class GetMonthlyExpensesDto {
  @ApiProperty({ description: "User ID", example: 1 })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    description: "Year (defaults to current year if not provided)",
    example: 2026,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description: "Month (1-12, defaults to current month if not provided)",
    example: 3,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
