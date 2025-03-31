import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.string('encryptedPassword').notNullable();
    t.enum('role', ['ADMIN', 'DEALERSHIP']).notNullable();
    t.integer('dealershipId')
      .unsigned()
      .references('id')
      .inTable('dealerships')
      .onDelete('CASCADE')
      .nullable();

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
