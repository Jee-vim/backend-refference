import pool from "../db/pool";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(email: string, hash: string, name: string) {
  const userJson = JSON.stringify({ name, avatar: null });
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, profile) VALUES ($1, $2, $3) RETURNING id',
    [email, hash, userJson]
  );
  return result.rows[0]
}

export async function login(email: string, password: string, res: any) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const dbUser = result.rows[0];
  const valid = await bcrypt.compare(password, dbUser.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: dbUser.id },
    process.env.JWT_SECRET as string
  );
  const { id, created_at, profile } = dbUser

  return {
    token, user: {
      id, email, created_at, profile,
    }
  }
}
