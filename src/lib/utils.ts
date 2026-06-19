import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: bigint | number): string {
  const n = typeof ts === "bigint" ? Number(ts) : Number(ts);
  if (!n || !Number.isFinite(n)) return "—";
  return new Date(n * 1000).toLocaleTimeString();
}
