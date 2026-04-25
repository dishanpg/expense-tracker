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
}
