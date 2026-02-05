import pool from "../db/pool";
import { NotFoundError } from "../errors/app.error";

export async function get() {
  const result = await pool.query(
    "SELECT id, email, profile, created_at, updated_at FROM users",
    []
  );

  return result.rows;
}

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
  const profileJson = profile ? JSON.stringify(profile) : null;

  const result = await pool.query(
    `UPDATE users 
     SET profile = CASE 
                     WHEN $1::jsonb IS NOT NULL THEN profile || $1::jsonb 
                     ELSE profile 
                   END,
         email = CASE 
                   WHEN $2::text IS NOT NULL AND $2::text IS DISTINCT FROM email THEN $2::text 
                   ELSE email 
                 END,
         updated_at = NOW()
     WHERE id = $3 
     RETURNING id, email, profile, created_at, updated_at`,
    [profileJson, email, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return result.rows[0];
}
