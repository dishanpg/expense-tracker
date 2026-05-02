import { User } from "@/modules/user/entity/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export enum ExpenseCategory {
  FOODOUTSIDE = "foodoutside",
  GROCERY = "grocery",
  MOVIE = "movie",
  TRAVEL = "travel",
  HOUSING = "housing",
  CAB = "cab",
  SHOPPING = "shopping",
  MEDICAL = "medical",
  SPORTS = "sports",
  INVESTMENTS = "investments",
  INTERNET = "internet",
  ENTERTAINMENT = "entertainment",
  CREDITCARD = "credit-card",
  OTHER = "other",
}

@Entity("expenses")
export class Expense {
  /**
   * TODO : introduce currency of the expense
   */

  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "bigint", name: "user_id" })
  userId: number;

  @Column()
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "varchar" })
  category: ExpenseCategory;

  @Column({ type: "date", name: "date_of_expense" })
  dateOfExpense: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  @JoinColumn({ name: "user_id" })
  user: User;
}
