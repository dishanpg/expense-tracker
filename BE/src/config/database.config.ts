import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const DatabaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    type: "mysql",
    host: configService.get("DB_HOST", "127.0.0.1"),
    port: configService.get<number>("DB_PORT", 3306),
    username: configService.get("DB_USERNAME", "db_user"),
    password: configService.get("DB_PASSWORD", "db_password"),
    database: configService.get("DB_NAME", "db_name"),
    ssl:
      configService.get("DB_SSL") === "true"
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined,
    synchronize: false,
    logging: configService.get("NODE_ENV") !== "production",
    autoLoadEntities: true,
    migrationsRun: true,
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  }),
  inject: [ConfigService],
};
