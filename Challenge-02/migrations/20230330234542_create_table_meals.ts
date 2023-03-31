import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable().checkLength('<=', 100)
    table.text('description').notNullable().checkLength('<=', 255)
    table.timestamp('moment').notNullable()
    table.boolean('on_diet').defaultTo(false)
    table.uuid('user_id').references('users.id')
    table.unique(['moment', 'user_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

