import pool from "../db/pool";
import { NotFoundError } from "../errors/app.error";

export async function getById(userId: string) {
  const result = await pool.query(
    "SELECT id, email, profile, created_at, updated_at FROM users WHERE id = $1",
    [userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return result.rows[0];
}

export async function update(userId: string, data: { profile?: object; email?: string }) {
  const { profile, email } = data;

  // Convert object to string to ensure double quotes for Postgres
  const profileJson = profile ? JSON.stringify(profile) : null;

  const result = await pool.query(
    `UPDATE users 
     SET profile = CASE 
                     WHEN $1::jsonb IS NOT NULL THEN profile || $1::jsonb 
                     ELSE profile 
                   END,
         email = COALESCE($2, email),
         updated_at = NOW()
     WHERE id = $3 
     RETURNING id, email, profile, created_at`,
    [profileJson, email, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return result.rows[0];
}
