"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  title: string;
  body: string;
  points: string[];
  img: string;
  alt: string;
  tint: string;
};

const TABS: Tab[] = [
  {
    id: "organisers",
    label: "Event organisers",
    title: "Hand every client's guests their own album",
    body: "Weddings, galas and private events run to a standard. Ancular makes photo delivery part of that standard instead of an afterthought in a group chat.",
    points: [
      "One invite link per event, on the programme or the screen",
      "Approve guests before they can search",
      "A private, polished delivery your client can point to",
    ],
    img: "/landing/v3/7648472.webp",
    alt: "An organiser laying out name badges before an event",
    tint: "var(--c-pink)",
  },
  {
    id: "photographers",
    label: "Photographers and studios",
    title: "Deliver the whole shoot without the back-and-forth",
    body: "Upload once and let every guest find their own shots. No more “can you send me mine?” messages for weeks after the event.",
    points: [
      "Upload over several days to the same event",
      "Guests save or share straight to WhatsApp",
      "Pro covers unlimited live events each month",
    ],
    img: "/landing/v3/39190690.webp",
    alt: "A photographer at his desk with a camera and laptop",
    tint: "var(--c-yellow)",
  },
  {
    id: "conferences",
    label: "Conferences and brands",
    title: "Turn attendees into your best promotion",
    body: "Attendees get their photos the same day and post them while the event is still being talked about.",
    points: [
      "Several photographers, several rooms, one album",
      "Invite code on badges, slides and screens",
      "Large events set up with our team",
    ],
    img: "/landing/hq/conferences.webp",
    alt: "Conference attendees applauding a speaker",
    tint: "var(--c-lavender)",
  },
  {
    id: "community",
    label: "Faith and community",
    title: "Every gathering gets its own album",
    body: "Media teams upload after each gathering, and members find themselves without asking around all week.",
    points: [
      "A new link for each service or event",
      "Members join once and reuse their account",
      "Face data deleted after 30 days by default",
    ],
    img: "/landing/uc/church-1400.webp",
    alt: "Two young people singing together with their eyes closed",
    tint: "var(--c-blue)",
  },
];

/** Who Ancular is for, one tab per kind of organiser. */
export function AudienceTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  return (
    <div>
      <div className="at-tabs" role="tablist" aria-label="Who it's for">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            className="at-tab"
            style={{ ["--tint" as string]: t.tint }}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={tab.id} className="at-panel" role="tabpanel">
        <div className="at-media" style={{ ["--tint" as string]: tab.tint }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tab.img} alt={tab.alt} loading="lazy" decoding="async" />
        </div>
        <div className="at-copy">
          <h3 className="v3-h3">{tab.title}</h3>
          <p className="v3-body mt-4">{tab.body}</p>
          <ul className="v3-points mt-8">
            {tab.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
