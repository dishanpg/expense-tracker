import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Name of the user",
    example: "John Doe",
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name: string;

  @ApiPropertyOptional({
    description: "Email address of the user",
    example: "john@example.com",
  })
  @IsOptional()
  @IsEmail({}, { message: "Email must be a valid email address" })
  email?: string;

  @ApiProperty({
    description: "Phone number of the user",
    example: "+1234567890",
  })
  @IsString()
  @IsNotEmpty({ message: "Phone number is required" })
  phone: string;
}
