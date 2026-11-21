"use client";

import { useRef } from "react";
import { IconDot, type PixelIconName } from "./PixelIcon";

type Card = {
  file: string;
  kicker: string;
  title: string;
  body: string;
  where: string;
  icon: PixelIconName;
  dot: string;
  tint: string;
  alt: string;
};

const CARDS: Card[] = [
  {
    file: "weddings",
    kicker: "Weddings",
    title: "Every guest, not just the couple",
    body: "Aunties, bridesmaids and the friend who flew in all find their own photos.",
    where: "On the table cards",
    icon: "ring",
    dot: "var(--c-pink)",
    tint: "var(--c-pink)",
    alt: "Bride and groom dancing while guests film them on their phones",
  },
  {
    file: "festivals",
    kicker: "Festivals",
    title: "Found in a crowd of thousands",
    body: "Several stages, several photographers, one album. Each fan sees only their photos.",
    where: "On the big screens",
    icon: "note",
    dot: "var(--c-yellow)",
    tint: "var(--c-yellow)",
    alt: "Daytime festival crowd with a woman raising her arm",
  },
  {
    file: "conferences",
    kicker: "Conferences",
    title: "Every attendee, every session",
    body: "Attendees post their photos the same day, the best promotion next year can get.",
    where: "On every badge",
    icon: "mic",
    dot: "var(--c-lavender)",
    tint: "var(--c-lavender)",
    alt: "Conference attendees applauding a speaker",
  },
  {
    file: "raves",
    kicker: "Raves and parties",
    title: "Shot all night, found by morning",
    body: "Strobes, smoke and side profiles. Guests wake up to every photo they're in.",
    where: "On the exit screen",
    icon: "sparkle",
    dot: "var(--c-red)",
    tint: "#ffb3b5",
    alt: "Friends dancing together under red club lights",
  },
  {
    file: "graduations",
    kicker: "Graduations",
    title: "Every graduate, every family",
    body: "Families find their graduate on stage without scrolling past hundreds of others.",
    where: "In the programme",
    icon: "cap",
    dot: "var(--c-mint)",
    tint: "var(--c-mint)",
    alt: "Graduates in gowns celebrating together on the lawn",
  },
  {
    file: "church",
    kicker: "Faith and community",
    title: "Every gathering gets its own album",
    body: "The media team uploads after each gathering, and nobody asks “please send my picture” all week.",
    where: "On the screen after",
    icon: "people",
    dot: "var(--c-blue)",
    tint: "#b9d0ff",
    alt: "Two young people singing together with their eyes closed",
  },
  {
    file: "tech",
    kicker: "Tech gatherings",
    title: "Meetups, hackathons and summits",
    body: "Speakers get their stage shots, attendees get their networking photos.",
    where: "On the slides",
    icon: "laptop",
    dot: "var(--c-grey)",
    tint: "#e6e7ec",
    alt: "People working on laptops around a hackathon table",
  },
  {
    file: "travel",
    kicker: "Travel groups",
    title: "One album for the whole trip",
    body: "Everyone gets the shots they're in, without a group chat full of photos.",
    where: "In the group chat, once",
    icon: "plane",
    dot: "var(--c-purple)",
    tint: "var(--c-lavender)",
    alt: "Friends laughing in a car at sunset on a road trip",
  },
];

/** A row of tall photo cards you can swipe or step through. */
export function UseCaseCards() {
  const track = useRef<HTMLUListElement>(null);
  const step = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div>
      <ul ref={track} className="uc2-track">
        {CARDS.map((c) => (
          <li key={c.file} className="uc2-card" style={{ ["--tint" as string]: c.tint }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/landing/uc/${c.file}-1400.webp`} alt={c.alt} loading="lazy" decoding="async" />
            <div className="uc2-shade" />
            <IconDot name={c.icon} color={c.dot} size={48} className="uc2-dot" />
            <div className="uc2-copy">
              <p className="lp-serif uc2-kicker">{c.kicker}</p>
              <h3 className="uc2-title">{c.title}</h3>
              <p className="uc2-body">{c.body}</p>
              <p className="lp-mono uc2-where">{c.where}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="lp-wrap mt-6 flex items-center justify-end gap-2">
        <button type="button" className="uc2-arrow" onClick={() => step(-1)} aria-label="Previous">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
        </button>
        <button type="button" className="uc2-arrow" onClick={() => step(1)} aria-label="Next">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
