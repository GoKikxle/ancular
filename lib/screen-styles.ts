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

/** Light shell — Home / Vault documents (editorial, soft borders); dark: matches app theme */
export const surfaceCardLight =
  "rounded-[16px] border border-[#EBEBEB] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-none";

export const surfaceCardLightHover =
  "transition-[border-color,background-color] duration-200 hover:border-[#D6D6D6] hover:bg-[#FAFAFA] active:scale-[0.99] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.07]";

export const screenEyebrowLight =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AAAAAA] dark:text-white/40";

export const screenTitleLight =
  "mt-1 text-[18px] font-bold tracking-[-0.02em] text-[#111111] dark:text-white";

export const screenSubtitleLight =
  "mt-1 text-[13px] leading-relaxed text-[#9A9A9A] dark:text-white/45";

export const screenHeaderWrapLight = "mb-6";
