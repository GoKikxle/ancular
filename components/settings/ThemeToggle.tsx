"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import type { Theme } from "@/components/providers/ThemeProvider";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark",  label: "Dark" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] dark:text-white/40">
        Appearance
      </p>
      <div className="flex rounded-[12px] border border-[#E5E5E5] bg-[#F0F0F0] p-[3px] dark:border-white/[0.1] dark:bg-white/[0.05]">
        {OPTIONS.map(({ value, label }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                active
                  ? "bg-white text-[#111111] shadow-sm dark:bg-neutral-800 dark:text-white"
                  : "text-[#999999] dark:text-white/35"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
