import * as fs from "fs";
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
    ssl: { ca: fs.readFileSync(configService.get("DB_SSL_CA", "/path/to/ca.pem")) },
    synchronize: false,
    logging: true,
    autoLoadEntities: true,
    migrationsRun: false,
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  }),
  inject: [ConfigService],
};
