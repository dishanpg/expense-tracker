import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Expense } from "@/modules/expense/entity/expense.entity";

@Entity("users")
export class User {
  @ApiProperty({ description: "Unique identifier of the user", example: 1 })
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @ApiProperty({ description: "Name of the user", example: "John Doe" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @ApiProperty({
    description: "Email address of the user",
    example: "john@example.com",
    nullable: true,
  })
  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  email: string | null;

  @ApiProperty({
    description: "Phone number of the user",
    example: "+1234567890",
  })
  @Column({ type: "varchar", length: 20, unique: true })
  phone: string;

  @ApiProperty({ description: "Timestamp when the user was created" })
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    name: "created_at",
  })
  createdAt: Date;

  @ApiProperty({ description: "Timestamp when the user was last updated" })
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    name: "updated_at",
  })
  updatedAt: Date;

  @OneToMany(() => Expense, (expense) => expense.user, {
    lazy: true,
    cascade: ["insert"],
  })
  expenses: Expense[];
}
