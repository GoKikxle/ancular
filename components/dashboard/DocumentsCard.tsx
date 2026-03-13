type DocumentsCardProps = {
  items: string[];
};

export function DocumentsCard({ items }: DocumentsCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">
        Documents
      </p>

      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}