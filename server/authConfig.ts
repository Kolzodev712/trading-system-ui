export const DEV_JWT_FALLBACK = "dev-only-change-in-production";

export type AuthMode = "lab" | "secure";

function legacyLabFlagsEnabled(): boolean {
  return (
    process.env.LAB_MODE === "1" ||
    process.env.LAB_MODE === "true" ||
    process.env.AUTH_ALLOW_DEV_DEFAULTS === "1" ||
    process.env.AUTH_ALLOW_DEV_DEFAULTS === "true"
  );
}

/** When AUTH_MODE is unset: lab only outside NODE_ENV=production (local dev / test). */
export function isClearlyLocalRuntime(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function resolveAuthMode(): AuthMode {
  const raw = process.env.AUTH_MODE?.trim().toLowerCase();
  if (raw === "lab" || raw === "secure") {
    return raw;
  }
  if (raw) {
    throw new Error(
      `[auth] Invalid AUTH_MODE="${process.env.AUTH_MODE}"; use "lab" or "secure".`,
    );
  }
  if (legacyLabFlagsEnabled()) {
    return "lab";
  }
  return isClearlyLocalRuntime() ? "lab" : "secure";
}

export function resolveJwtSecret(authMode: AuthMode): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  const missingOrDefault = !fromEnv || fromEnv === DEV_JWT_FALLBACK;

  if (authMode === "secure") {
    if (missingOrDefault) {
      throw new Error(
        "[auth] JWT_SECRET must be set to a non-default value when AUTH_MODE=secure (or when AUTH_MODE is unset in a production runtime).",
      );
    }
    return fromEnv;
  }

  if (fromEnv && fromEnv !== DEV_JWT_FALLBACK) {
    return fromEnv;
  }

  console.warn(
    "[auth] AUTH_MODE=lab: using demonstration JWT secret — not for shared or production use.",
  );
  return fromEnv || DEV_JWT_FALLBACK;
}