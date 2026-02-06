import type knex from "knex";

export async function up(knex: knex.Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.text("current_refresh_token").nullable();
  });
}

export async function down(knex: knex.Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("current_refresh_token");
  });
}
