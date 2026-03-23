/**
 * Shared surface + type tokens for polished list screens (Home, Trips, Vault, Stats).
 * Keep in sync when adjusting the product “card system.”
 */

export const surfaceCard =
  "rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.025] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]";

/** For <Link> rows that should lift slightly on hover */
export const surfaceCardLinkHover =
  "transition-[border-color,background-color] duration-200 hover:border-white/[0.14] hover:from-white/[0.08] active:scale-[0.99]";

export const screenEyebrow = "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40";

export const screenTitle = "mt-2 text-[18px] font-bold tracking-[-0.02em] text-white";

export const screenSubtitle = "mt-1.5 text-[13px] leading-relaxed text-white/45";

export const screenHeaderWrap = "mb-10 pt-1";
