import { site } from '../data/site';
import { projects, toCategorySlug } from '../data/projects';

/** Fixed bottom-left filter tags. */
export function CategoryFilter({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const options = [
    { slug: 'all', label: 'All', count: projects.length },
    ...site.categories.map((c) => ({
      slug: toCategorySlug(c),
      label: c,
      count: projects.filter((p) => p.category.includes(c)).length,
    })),
  ];
  return (
    <div className="tags" role="group" aria-label="Filter by category">
      {options.map((o) => (
        <button
          key={o.slug}
          type="button"
          className="tag"
          aria-pressed={value === o.slug}
          aria-label={`${o.label} (${o.count} projects)`}
          onClick={() => onChange(o.slug)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
