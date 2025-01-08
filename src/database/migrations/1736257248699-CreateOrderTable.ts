import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTable1736257248699 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders"
       (
           "id"                 SERIAL PRIMARY KEY,
           "renting_history_id" integer     NOT NULL,
           "user_id"            integer     NOT NULL,
           "order_no"           varchar(50) NOT NULL,
           "amount"             float       NOT NULL,
           "status"             varchar(20) NOT NULL,
           "created_at"         TIMESTAMP   NOT NULL DEFAULT now(),
           "updated_at"         TIMESTAMP   NOT NULL DEFAULT now()
       )`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders"
          ADD CONSTRAINT "UQ_order_order_no" UNIQUE ("order_no")`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders"
          ADD CONSTRAINT "UQ_order_user_id_renting_history_id" UNIQUE ("user_id", "renting_history_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
