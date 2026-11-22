import type { Faq } from "./faqs";

/** Questions as plain rows between hairlines; the first one starts open. */
export function FaqList({
  items,
  className = "",
}: {
  items: Faq[];
  className?: string;
}) {
  return (
    <div className={`faq-list ${className}`}>
      {items.map((f, i) => (
        <details key={f.q} className="faq" open={i === 0}>
          <summary>
            <span>{f.q}</span>
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <div className="faq-a">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
