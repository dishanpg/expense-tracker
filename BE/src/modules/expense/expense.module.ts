import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense } from "@/modules/expense/entity/expense.entity";
import { ExpenseController } from "@/modules/expense/expense.controller";
import { ExpenseService } from "@/modules/expense/expense.service";
import { UserModule } from "@/modules/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), UserModule],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
