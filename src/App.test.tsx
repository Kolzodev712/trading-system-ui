/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App boot", () => {
  it("renders connect UI when disconnected", () => {
    render(<App />);
    expect(screen.getByText("Trading System UI")).toBeTruthy();
    expect(screen.getByText("Connect to Trading Runner")).toBeTruthy();
    expect(screen.getByRole("button", { name: /connect/i })).toBeTruthy();
  });
});
