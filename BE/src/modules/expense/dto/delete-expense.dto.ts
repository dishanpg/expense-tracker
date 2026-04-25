import { IsInt, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteExpenseDto {
  @ApiProperty({
    description: "ID of the user who owns this expense",
    example: 1,
  })
  @IsInt({ message: "User ID must be an integer" })
  @IsPositive({ message: "User ID must be a positive number" })
  userId: number;
}
