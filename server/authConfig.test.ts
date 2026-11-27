import { afterEach, describe, expect, it } from "vitest";
import {
  DEV_JWT_FALLBACK,
  isClearlyLocalRuntime,
  resolveAuthMode,
  resolveJwtSecret,
} from "./authConfig.js";

const ENV_KEYS = [
  "AUTH_MODE",
  "LAB_MODE",
  "AUTH_ALLOW_DEV_DEFAULTS",
  "NODE_ENV",
  "JWT_SECRET",
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("resolveAuthMode", () => {
  let saved: Record<string, string | undefined>;

  afterEach(() => {
    restoreEnv(saved);
  });

  it("honors explicit AUTH_MODE", () => {
    saved = snapshotEnv();
    process.env.AUTH_MODE = "secure";
    expect(resolveAuthMode()).toBe("secure");
    process.env.AUTH_MODE = "lab";
    expect(resolveAuthMode()).toBe("lab");
  });

  it("rejects invalid AUTH_MODE", () => {
    saved = snapshotEnv();
    process.env.AUTH_MODE = "prod";
    expect(() => resolveAuthMode()).toThrow(/Invalid AUTH_MODE/);
  });

  it("defaults to lab when unset and runtime is clearly local", () => {
    saved = snapshotEnv();
    delete process.env.AUTH_MODE;
    delete process.env.LAB_MODE;
    delete process.env.AUTH_ALLOW_DEV_DEFAULTS;
    process.env.NODE_ENV = "development";
    expect(resolveAuthMode()).toBe("lab");
    expect(isClearlyLocalRuntime()).toBe(true);
  });

  it("defaults to secure when unset and NODE_ENV=production", () => {
    saved = snapshotEnv();
    delete process.env.AUTH_MODE;
    delete process.env.LAB_MODE;
    process.env.NODE_ENV = "production";
    expect(resolveAuthMode()).toBe("secure");
  });

  it("accepts legacy LAB_MODE when AUTH_MODE unset", () => {
    saved = snapshotEnv();
    delete process.env.AUTH_MODE;
    process.env.NODE_ENV = "production";
    process.env.LAB_MODE = "1";
    expect(resolveAuthMode()).toBe("lab");
  });
});

describe("resolveJwtSecret", () => {
  let saved: Record<string, string | undefined>;

  afterEach(() => {
    restoreEnv(saved);
  });

  it("allows demo default in lab mode", () => {
    saved = snapshotEnv();
    delete process.env.JWT_SECRET;
    expect(resolveJwtSecret("lab")).toBe(DEV_JWT_FALLBACK);
  });

  it("fails closed in secure mode for missing or default secret", () => {
    saved = snapshotEnv();
    delete process.env.JWT_SECRET;
    expect(() => resolveJwtSecret("secure")).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = DEV_JWT_FALLBACK;
    expect(() => resolveJwtSecret("secure")).toThrow(/JWT_SECRET/);
  });

  it("uses custom secret in secure mode", () => {
    saved = snapshotEnv();
    process.env.JWT_SECRET = "production-secret-value";
    expect(resolveJwtSecret("secure")).toBe("production-secret-value");
  });
});