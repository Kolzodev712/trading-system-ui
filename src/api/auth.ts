import type { AuthUser } from "@/lib/authStorage";
import { loadUser } from "@/lib/authStorage";

const API = "/api";

async function parseJsonBody<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? "Auth API returned invalid JSON"
        : `Auth API error (${res.status}): ${text.slice(0, 120)}`,
    );
  }
}

function authUnavailableMessage(): string {
  return (
    "Auth API is not reachable. Start Mongo (docker-compose up) and run " +
    "`npm run server` or `npm run dev:all` in another terminal."
  );
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error(authUnavailableMessage());
  }

  const data = await parseJsonBody<{ token?: string; user?: AuthUser; error?: string }>(res);
  if (!data) {
    throw new Error(
      res.status === 502 || res.status === 504
        ? authUnavailableMessage()
        : "Empty response from auth API",
    );
  }
  if (!res.ok) {
    throw new Error(data.error ?? "Login failed");
  }
  if (!data.token || !data.user) {
    throw new Error("Invalid login response from auth API");
  }
  return { token: data.token, user: data.user };
}

export async function verifySession(
  token: string,
): Promise<AuthUser | null> {
  if (import.meta.env.VITE_WORKFLOW_SKIP_AUTH === "1") {
    return loadUser();
  }
  let res: Response;
  try {
    res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = await parseJsonBody<{ user?: AuthUser }>(res);
  return data?.user ?? null;
}

export async function checkAuthHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
