import { IsInt, IsPositive, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetMonthlySummaryDto {
  @ApiProperty({
    description: "ID of the user",
    example: 1,
  })
  @IsInt({ message: "User ID must be an integer" })
  @IsPositive({ message: "User ID must be a positive number" })
  userId: number;

  @ApiProperty({
    description: "Year (e.g., 2026)",
    example: 2026,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt({ message: "Year must be an integer" })
  @Min(2000, { message: "Year must be at least 2000" })
  @Max(2100, { message: "Year must be at most 2100" })
  year: number;

  @ApiProperty({
    description: "Month (1-12)",
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsInt({ message: "Month must be an integer" })
  @Min(1, { message: "Month must be between 1 and 12" })
  @Max(12, { message: "Month must be between 1 and 12" })
  month: number;
}
