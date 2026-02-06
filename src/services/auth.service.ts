import db from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const ACCESS_EXPIRE =
  process.env.NODE_ENV === "production" ? "15m" : "500h";

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_EXPIRE,
  });
}

export async function register(email: string, password: string, name: string) {
  const hash = await bcrypt.hash(password, 10);

  const profile = { name, avatar: null };

  const [user] = await db("users")
    .insert({
      email,
      password_hash: hash,
      profile,
    })
    .returning("id");

  return user;
}

export async function login(email: string, password: string) {
  const dbUser = await db("users").where({ email }).first();

  if (!dbUser) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, dbUser.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(dbUser.id);
  const refreshToken = jwt.sign(
    { userId: dbUser.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );

  await db("users")
    .where({ id: dbUser.id })
    .update({ current_refresh_token: refreshToken });

  const { id, created_at, profile } = dbUser;

  return {
    accessToken,
    refreshToken,
    user: { id, email: dbUser.email, created_at, profile },
  };
}

export async function refresh(userId: string) {
  const user = await db("users")
    .select("current_refresh_token")
    .where({ id: userId })
    .first();

  return user?.current_refresh_token;
}

export async function logout(userId: string) {
  await db("users")
    .where({ id: userId })
    .update({ current_refresh_token: null });
}
