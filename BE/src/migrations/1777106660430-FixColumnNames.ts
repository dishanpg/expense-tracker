import { MigrationInterface, QueryRunner } from "typeorm";

export class FixColumnNames1777106660430 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix expenses table: camelCase → snake_case to match entity definitions
    await queryRunner.query(`
            ALTER TABLE \`expenses\`
            CHANGE \`createdAt\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CHANGE \`updatedAt\` \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`expenses\`
            CHANGE \`created_at\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CHANGE \`updated_at\` \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
  }
}
