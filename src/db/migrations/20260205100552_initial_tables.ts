import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // 2. Create Enum for Task Status
  // Note: Check if it exists first to avoid errors on rollback/retry
  await knex.raw(
    "CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED')",
  );

  // 3. Users Table
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

  // 4. Tasks Table
  await knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.text("title").notNullable();
    table.specificType("status", "task_status").defaultTo("PENDING");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 5. Products Table
  await knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.text("name").notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.integer("stock").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("tasks");
  await knex.schema.dropTableIfExists("users");
  await knex.raw("DROP TYPE IF EXISTS task_status");
}
