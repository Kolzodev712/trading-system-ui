import bcrypt from "bcryptjs";
import { type Db } from "mongodb";
import type { CredentialDoc } from "./db.js";

export async function seedCredentials(
  db: Db,
  opts: { allowDevSeed: boolean } = { allowDevSeed: false },
): Promise<void> {
  const collection = db.collection<CredentialDoc>("credentials");
  const count = await collection.countDocuments();
  if (count > 0) return;

  if (!opts.allowDevSeed) {
    console.warn(
      "[auth] credentials collection empty and laboratory seed disabled; create users explicitly",
    );
    return;
  }

  const passwordHash = await bcrypt.hash("admin", 10);
  await collection.insertOne({
    username: "admin",
    passwordHash,
    role: "admin",
    createdAt: new Date(),
  });
  console.log(
    "[auth] Seeded laboratory user: admin / admin (AUTH_MODE=lab — demonstration only)",
  );
}
