import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('vehicles', (t) => {
    t.increments('id');
    t.string('brand').notNullable();
    t.string('name').notNullable();
    t.string('model').notNullable();
    t.string('year').notNullable();
    t.string('comments').nullable();

    t.integer('dealershipId').unsigned().notNullable().references('id').inTable('dealerships');

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('vehicles');
}
