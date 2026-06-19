/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App boot", () => {
  it("renders sign-in UI when unauthenticated", () => {
    render(<App />);
    expect(screen.getByText("Operator sign in")).toBeTruthy();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
  });
});
