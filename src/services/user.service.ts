import db from "../db";
import { NotFoundError } from "../errors/app.error";

export async function get() {
  return await db("users").select(
    "id",
    "email",
    "profile",
    "created_at",
    "update_at",
  );
}

export async function getById(userId: string) {
  const result = await db("user")
    .select("id", "email", "profile", "created_at", "updated_at")
    .where({ id: userId });

  if (!result) {
    throw new NotFoundError("User not found");
  }

  return result;
}

export async function update(
  userId: string,
  data: { profile?: object; email?: string },
) {
  const { profile, email } = data;

  const user = await db("users")
    .where({ id: userId })
    .update({
      profile: profile
        ? db.raw("profile || ?::jsonb", [JSON.stringify(profile)])
        : db.ref("profile"),
      email: email || db.ref("email"),
      updated_at: db.fn.now(),
    })
    .returning(["id", "email", "profile", "created_at", "updated_at"]);

  if (!user || user.length === 0) {
    throw new NotFoundError("User not found");
  }

  return user[0];
}
