import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772822763995 implements MigrationInterface {
  name = "InitialSchema1772822763995";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`users\` (
                \`id\` bigint NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NULL,
                \`phone\` varchar(20) NOT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                UNIQUE INDEX \`IDX_users_phone\` (\`phone\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`expenses\` (
                \`id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`category\` varchar(255) NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_expenses_user_id\` (\`user_id\`),
                CONSTRAINT \`FK_expenses_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`expenses\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
