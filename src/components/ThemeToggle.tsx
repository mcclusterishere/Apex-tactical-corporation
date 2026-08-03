"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

/**
 * The theme control: Auto, Day, Night.
 *
 * Auto is the point of the whole thing and is the default, so it sits first and
 * carries a one-line explanation on hover. The other two pin the choice. The
 * control reflects, and writes to, the same state the pre-paint script reads, so
 * there is exactly one source of truth and no disagreement between them.
 */

declare global {
  interface Window {
    __apexTheme?: {
      apply: (mode: ThemeMode) => string;
      resolve: (mode: ThemeMode) => "light" | "dark";
      current: () => ThemeMode;
      KEY: string;
    };
  }
}

const OPTIONS: { mode: ThemeMode; label: string; glyph: string; hint: string }[] = [
  { mode: "auto", label: "Auto", glyph: "◐", hint: "Follows your local time — light by day, dark after dusk" },
  { mode: "light", label: "Day", glyph: "☉", hint: "Always light" },
  { mode: "dark", label: "Night", glyph: "☾", hint: "Always dark" },
];

export function ThemeToggle() {
  // Render a stable default on the server; correct it on mount from the DOM the
  // pre-paint script already set, so there is no hydration mismatch and no flash.
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const attr = document.documentElement.getAttribute("data-theme-mode");
    if (attr === "light" || attr === "dark" || attr === "auto") setMode(attr);
  }, []);

  function choose(next: ThemeMode) {
    setMode(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage disabled: still applies for this page, simply not remembered.
    }
    window.__apexTheme?.apply(next);
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--rule-strong)] p-0.5"
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => {
        const active = mounted && option.mode === mode;
        return (
          <button
            key={option.mode}
            type="button"
            onClick={() => choose(option.mode)}
            title={option.hint}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium leading-none transition-colors ${
              active
                ? "bg-[var(--accent)] text-[var(--page-raised)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <span aria-hidden className="text-[12px] leading-none">
              {option.glyph}
            </span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
