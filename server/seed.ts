import bcrypt from "bcryptjs";
import { type Db } from "mongodb";
import type { CredentialDoc } from "./db.js";

export async function seedCredentials(db: Db): Promise<void> {
  const collection = db.collection<CredentialDoc>("credentials");
  const count = await collection.countDocuments();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash("admin", 10);
  await collection.insertOne({
    username: "admin",
    passwordHash,
    role: "admin",
    createdAt: new Date(),
  });
  console.log("[auth] Seeded default user: admin / admin");
}
