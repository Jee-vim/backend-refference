import pool from "../db/pool";
import { NotFoundError } from "../errors/app.error";

export async function getById(userId: string) {
  const result = await pool.query(
    "SELECT id, email, profile, created_at FROM users WHERE id = $1",
    [userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return result.rows[0];
}

export async function update(userId: string, data: { profile?: { name: string, avatat: string }; email?: string }) {
  const { profile, email } = data;

  const result = await pool.query(
    `UPDATE users 
     SET profile= COALESCE($1, profile), 
         email = COALESCE($2, email),
         updated_at = NOW()
     WHERE id = $3 
     RETURNING id, email, profile, created_at`,
    [profile, email, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return result.rows[0];
}
