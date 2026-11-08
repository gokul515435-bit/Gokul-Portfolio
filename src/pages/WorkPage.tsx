import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projects, toCategorySlug } from '../data/projects';
import { site } from '../data/site';
import { CategoryFilter } from '../components/CategoryFilter';
import { WorkGrid, type GridEntry } from '../components/WorkGrid';
import { useDocumentTitle } from '../lib/hooks';
import { ShowreelHero } from '../components/ShowreelHero';
import { showreel } from '../data/projects';

export function WorkPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? 'all';

  const filtered = useMemo(
    () => projects.filter((p) => category === 'all' || p.category.some((c) => toCategorySlug(c) === category)),
    [category],
  );
  const label = category === 'all' ? 'Work' : site.categories.find((c) => toCategorySlug(c) === category) ?? 'Work';
  useDocumentTitle(`${label} — ${site.name}, ${site.role}`);

  const entries: GridEntry[] = filtered.map((p) => ({
    id: p.slug,
    media: p.cover,
    href: `/work/${p.slug}`,
    title: p.title,
    subtitle: p.subtitle,
    placeholder: p.placeholder,
  }));

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    setParams(next, { replace: true });
  };

  return (
    <>
    <ShowreelHero />
    <div className={`page page--work${showreel ? ' has-reel' : ''}`}>
      <aside className="side" aria-label="Filters">
        <CategoryFilter value={category} onChange={setCategory} />
      </aside>
      <main className="content" id="main">
        <h1 className="sr-only">
          {label} — {filtered.length} projects
        </h1>
        <p className="sr-only" aria-live="polite">
          Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        </p>
        {filtered.length ? (
          <WorkGrid key={category} entries={entries} label={`${label} gallery`} />
        ) : (
          <p className="lead">Nothing here yet.</p>
        )}
      </main>
    </div>
    </>
  );
}
