import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";

import { DatabaseConfig } from "../../config/database.config";
import { loggerConfig } from "../../config/logger.config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ExpenseModule } from "../expense/expense.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    LoggerModule.forRoot(loggerConfig),
    TypeOrmModule.forRootAsync(DatabaseConfig),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ExpenseModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
