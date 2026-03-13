"use client";

type TripFormProps = {
  action: (formData: FormData) => Promise<void>;
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20";

export function TripForm({ action }: TripFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Title</label>
        <input
          name="title"
          required
          placeholder="e.g. Tokyo Spring Trip"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">
          Slug <span className="text-white/30">(used in URL)</span>
        </label>
        <input
          name="slug"
          required
          placeholder="e.g. tokyo-spring"
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Dates</label>
        <input
          name="dates"
          placeholder="e.g. Jun 10 → Jun 17"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Travelers</label>
        <input
          name="travelers"
          placeholder="e.g. 2 travelers"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Status</label>
        <select name="status" defaultValue="Upcoming" className={inputClass}>
          <option value="Upcoming" className="bg-neutral-900">Upcoming</option>
          <option value="Active" className="bg-neutral-900">Active</option>
          <option value="Past" className="bg-neutral-900">Past</option>
        </select>
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-950 hover:bg-white/90"
      >
        Create Trip
      </button>
    </form>
  );
}
