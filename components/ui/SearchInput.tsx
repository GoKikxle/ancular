"use client";

import { useId } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder, label = "Search", className = "" }: SearchInputProps) {
  const inputId = useId();
  return (
    <div className={className}>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBBBBB] dark:text-white/30"
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-xl border border-[#E5E5E5] bg-white py-2 pl-11 pr-4 text-[14px] text-[#111111] placeholder:text-[#BBBBBB] shadow-[0_1px_0_rgba(0,0,0,0.02)] focus:border-[#D0D0D0] focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/[0.18]"
        />
      </div>
    </div>
  );
}
