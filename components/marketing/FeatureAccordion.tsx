"use client";

import { useState } from "react";

type Item = {
  title: string;
  body: string;
  img: string;
  alt: string;
  pos?: string;
};

/**
 * A picture on the left, a list of features on the right. Opening a feature
 * swaps the picture, after the feature lists on asana.com.
 */
export function FeatureAccordion({
  items,
  tint,
}: {
  items: Item[];
  tint: string;
}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="fa">
      <div className="fa-media" style={{ ["--tint" as string]: tint }}>
        {items.map((it, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={it.img}
            src={it.img}
            alt={it.alt}
            data-on={i === open}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: it.pos }}
          />
        ))}
      </div>
      <ul className="fa-list">
        {items.map((it, i) => {
          const on = i === open;
          return (
            <li key={it.title} className="fa-item" data-on={on}>
              <button
                type="button"
                className="fa-head"
                aria-expanded={on}
                onClick={() => setOpen(i)}
              >
                <span>{it.title}</span>
                <span className="fa-chev" aria-hidden="true" />
              </button>
              <div className="fa-body" hidden={!on}>
                <p>{it.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
