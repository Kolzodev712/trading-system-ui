import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");

function showBootError(message: string) {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="padding:2rem;font-family:system-ui,sans-serif;background:#1a0a0a;color:#fca5a5;min-height:100vh">
      <h1 style="color:#fff;margin:0 0 1rem">Trading System UI failed to load</h1>
      <pre style="white-space:pre-wrap">${message}</pre>
      <p style="color:#aaa;margin-top:1rem">Try: <code>npm run start</code> (uses production build + preview)</p>
    </div>`;
}

if (!rootEl) {
  throw new Error("Missing #root element");
}

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  showBootError(message);
  console.error(error);
}
