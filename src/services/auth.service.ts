import pool from "../db/pool";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const ACCESS_EXPIRE = process.env.NODE_ENV === "production" ? "15m" : "500h";
export function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_EXPIRE }
  );
}

export async function register(email: string, password: string, name: string) {
  const hash = await bcrypt.hash(password, 10);
  const userJson = JSON.stringify({ name, avatar: null });
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, profile) VALUES ($1, $2, $3) RETURNING id',
    [email, hash, userJson]
  );
  return result.rows[0];
}

export async function login(email: string, password: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (result.rowCount === 0) throw new Error("Invalid credentials");

  const dbUser = result.rows[0];
  const valid = await bcrypt.compare(password, dbUser.password_hash);

  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(dbUser.id);
  const refreshToken = jwt.sign(
    { userId: dbUser.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
  await pool.query("UPDATE users SET current_refresh_token = $1 WHERE id = $2", [refreshToken, dbUser.id]);
  const { id, created_at, profile } = dbUser;
  return { accessToken, refreshToken, user: { id, email, created_at, profile } };
}

export async function refresh(userId: string) {
  const result = await pool.query("SELECT current_refresh_token FROM users WHERE id = $1", [userId]);
  return result.rows[0]?.current_refresh_token;
}

export async function logout(userId: string) {
  await pool.query("UPDATE users SET current_refresh_token = NULL WHERE id = $1", [userId]);
}
