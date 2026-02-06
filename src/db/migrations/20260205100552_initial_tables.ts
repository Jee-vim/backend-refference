import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
      END IF;
    END
    $$;
  `);

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("email").unique().notNullable();
    table.text("password_hash").notNullable();
    table
      .jsonb("profile")
      .notNullable()
      .defaultTo(JSON.stringify({ name: null, avatar: null }));
    table.timestamps(true, true);
  });

  await knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("title").notNullable();
    table.specificType("status", "task_status").defaultTo("PENDING");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("name").notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.integer("stock").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("tasks");
  await knex.schema.dropTableIfExists("users");
  await knex.raw("DROP TYPE IF EXISTS task_status");
}
