"use client";

import { useEffect, useRef, useState } from "react";

type Sector = {
  id: string;
  label: string;
  file: string;
  alt: string;
  title: string;
  body: string;
  where: string;
};

const SECTORS: Sector[] = [
  {
    id: "weddings",
    label: "Weddings",
    file: "wedding",
    alt: "Couple dancing at night, surrounded by guests holding up phone lights",
    title: "Every guest, not just the couple.",
    body: "The photographer uploads once. Aunties, bridesmaids and the friend who flew in all find their own photos, with the photographer's name on every gallery.",
    where: "On the table cards",
  },
  {
    id: "raves",
    label: "Raves and parties",
    file: "rave",
    alt: "Friends at the front of a rave, lit in neon",
    title: "Shot all night. Found by morning.",
    body: "Strobes, smoke and side profiles. Guests scan the code on the way out and wake up to every photo they're in.",
    where: "On the wristband or the exit screen",
  },
  {
    id: "church",
    label: "Church services",
    file: "church",
    alt: "Church congregation worshipping with hands raised",
    title: "Every service gets its own album.",
    body: "The media team uploads after each service or convention. Members find themselves, and nobody asks “please send my picture” all week.",
    where: "On the screen after service",
  },
  {
    id: "conferences",
    label: "Conferences",
    file: "conference",
    alt: "Packed conference audience",
    title: "Every attendee, every session.",
    body: "Attendees find their photos and post them the same day, which is the best promotion next year's event can get.",
    where: "On every badge",
  },
  {
    id: "festivals",
    label: "Festivals",
    file: "festival",
    alt: "Crowd in front of a festival stage with fireworks",
    title: "Found in a crowd of thousands.",
    body: "Several stages, several photographers, one album. Each fan sees only the photos they appear in.",
    where: "On the big screens and the festival app",
  },
  {
    id: "graduations",
    label: "Graduations",
    file: "graduation",
    alt: "Graduates in caps and gowns posing together",
    title: "Every graduate, every family.",
    body: "One album for the whole ceremony. Families find their graduate on stage without scrolling past hundreds of others.",
    where: "In the ceremony programme",
  },
  {
    id: "travel",
    label: "Travel groups",
    file: "travel",
    alt: "Friends posing for a photo on a trip",
    title: "One album for the whole trip.",
    body: "Everyone's shots in one place, and everyone gets the ones they're in, without a group chat full of photos.",
    where: "In the group chat, once",
  },
  {
    id: "tech",
    label: "Tech gatherings",
    file: "tech",
    alt: "People at tables watching a presentation at a meetup",
    title: "Meetups, hackathons and summits.",
    body: "Speakers get their stage shots, attendees get their networking photos, and the event gets shared from the day.",
    where: "On the slides and the badges",
  },
];

const STEP_MS = 6000;

/** Sector tabs over one large photo. Moves on by itself until someone picks a tab. */
export function UseCases() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!auto || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % SECTORS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, auto, paused]);

  // Keep the current tab in view on phones, where the row scrolls sideways.
  // Only the tab row moves, never the page.
  useEffect(() => {
    const tab = tabs.current[active];
    const row = tab?.parentElement;
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const s = SECTORS[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div role="tablist" aria-label="Kinds of event" className="uc-tabs">
        {SECTORS.map((x, i) => (
          <button
            key={x.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`uc-tab-${x.id}`}
            aria-selected={i === active}
            aria-controls="uc-panel"
            className="uc-tab"
            onClick={() => {
              setAuto(false);
              setActive(i);
            }}
          >
            {x.label}
            {i === active && auto && (
              <span key={active} className="uc-progress" data-paused={paused} style={{ animationDuration: `${STEP_MS}ms` }} />
            )}
          </button>
        ))}
      </div>

      <div id="uc-panel" role="tabpanel" aria-labelledby={`uc-tab-${s.id}`} className="uc-panel">
        <div className="uc-media">
          {SECTORS.map((x, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={x.id}
              src={`/landing/${x.file}-1200.webp`}
              srcSet={`/landing/${x.file}-600.webp 600w, /landing/${x.file}-1200.webp 1200w`}
              sizes="(min-width: 1024px) 60vw, 100vw"
              alt={i === active ? x.alt : ""}
              aria-hidden={i !== active}
              loading="lazy"
              data-active={i === active}
            />
          ))}
          <span className="uc-where">
            <span className="uc-dot" />
            {s.where}
          </span>
        </div>
        <div key={s.id} className="uc-copy">
          <p className="lp-label">
            {String(active + 1).padStart(2, "0")} / {String(SECTORS.length).padStart(2, "0")}
          </p>
          <div>
            <h3 className="uc-title">{s.title}</h3>
            <p className="uc-body">{s.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
