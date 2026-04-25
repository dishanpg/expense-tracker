import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateOfExpense1777105878726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`expenses\`
            ADD COLUMN \`date_of_expense\` date NOT NULL DEFAULT '2026-01-01'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`expenses\`
            DROP COLUMN \`date_of_expense\`
        `);
  }
}
