import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

interface DexKeyboardActions {
  onRefresh: () => void;
  onToggleQuote: () => void;
  onToggleStrategy: () => void;
  onCancelPool: () => void;
  onBack: () => void;
  onPrevPool: () => void;
  onNextPool: () => void;
  hasStrategy: boolean;
  controlsEnabled: boolean;
}

export function useDexKeyboardShortcuts(actions: DexKeyboardActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const mutating = key === "t" || key === "s" || key === "c";
      if (mutating && !actions.controlsEnabled) return;

      switch (key) {
        case "r":
          e.preventDefault();
          actions.onRefresh();
          break;
        case "t":
          e.preventDefault();
          actions.onToggleQuote();
          break;
        case "s":
          if (actions.hasStrategy) {
            e.preventDefault();
            actions.onToggleStrategy();
          }
          break;
        case "c":
          e.preventDefault();
          actions.onCancelPool();
          break;
        case "escape":
          e.preventDefault();
          actions.onBack();
          break;
        case "arrowleft":
          e.preventDefault();
          actions.onPrevPool();
          break;
        case "arrowright":
          e.preventDefault();
          actions.onNextPool();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}
