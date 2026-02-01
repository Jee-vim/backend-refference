import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool";
import { sendResponse } from "../utils/lib";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, hash]
    );

    return sendResponse(res, 201, { userId: result.rows[0].id }, "User registered successfully");
  } catch (error: any) {
    if (error.code === "23505") {
      return sendResponse(res, 400, null, "Email is already registered");
    }

    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string
  );

  return sendResponse(res, 200, { token }, "Login successful");
};
