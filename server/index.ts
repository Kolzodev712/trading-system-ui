import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb, closeDb, type CredentialDoc } from "./db.js";
import { seedCredentials } from "./seed.js";

const PORT = Number(process.env.AUTH_PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-in-production";

interface AuthPayload {
  sub: string;
  role: string;
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username?.trim() || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  try {
    const db = await getDb();
    const user = await db
      .collection<CredentialDoc>("credentials")
      .findOne({ username: username.trim() });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      { sub: user.username, role: user.role } satisfies AuthPayload,
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("[auth] login error:", err);
    res.status(503).json({ error: "Authentication service unavailable" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    res.json({ user: { username: payload.sub, role: payload.role } });
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
});

async function main() {
  const db = await getDb();
  await seedCredentials(db);

  const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`[auth] API listening on http://127.0.0.1:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[auth] Port ${PORT} is already in use. Stop the other process or run: node scripts/free-port.mjs ${PORT}`,
      );
    } else {
      console.error("[auth] Server error:", err);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main().catch((err) => {
  console.error("[auth] failed to start:", err);
  process.exit(1);
});
