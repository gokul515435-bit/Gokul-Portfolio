import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProject, projects, toCategorySlug } from '../data/projects';
import { site } from '../data/site';
import { WorkGrid } from '../components/WorkGrid';
import { useDocumentTitle } from '../lib/hooks';
import { NotFound } from './NotFound';

export function ProjectPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const project = getProject(slug);
  useDocumentTitle(project ? `${project.title} — ${site.name}, ${site.role}` : `Not found — ${site.name}`);
  if (!project) return <NotFound />;

  const i = projects.indexOf(project);
  const next = projects[(i + 1) % projects.length];
  const { cover } = project;
  const rest = project.media.filter((m) => m.id !== cover.id);

  const meta: [string, React.ReactNode][] = [
    ['Year', project.year],
    ['Client', project.client],
    ['Role', project.role],
    ['Tools', project.tools?.join(', ')],
    ['Format', project.deliverables?.join(' · ')],
    [
      'Category',
      project.category.map((c, n) => (
        <span key={c}>
          {n > 0 && ', '}
          <Link to={`/?category=${toCategorySlug(c)}`}>{c}</Link>
        </span>
      )),
    ],
  ];

  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  return (
    <div className="page page--project">
      <aside className="side side--project">
        <button type="button" className="back" onClick={back} aria-label="Back to all work">
          <span aria-hidden="true">←</span>
        </button>
        <h1 className="project__title">{project.title}</h1>
        <p className="project__subtitle">{project.subtitle}</p>
        <dl className="project__meta">
          {meta
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      </aside>

      <main className="content" id="main">
        <figure className="hero" style={{ aspectRatio: `${Math.max(cover.width / cover.height, 16 / 9)}` }}>
          {cover.type === 'video' ? (
            <video
              key={cover.src}
              src={cover.src}
              poster={cover.poster}
              controls
              playsInline
              preload="metadata"
              width={cover.width}
              height={cover.height}
              aria-label={cover.alt}
            />
          ) : (
            <img src={cover.src} alt={cover.alt} />
          )}
          {project.placeholder && <span className="tile__tag">Demo</span>}
        </figure>

        {project.description && (
          <section className="block">
            <h2 className="label">Brief</h2>
            <p className="lead">{project.description}</p>
          </section>
        )}

        {rest.length > 0 && (
          <section className="block" aria-label="Process and stills">
            <h2 className="label">Process</h2>
            <WorkGrid
              compact
              fullFrom={1.1}
              entries={rest.map((m) => ({ id: m.id, media: m, placeholder: project.placeholder }))}
              label={`${project.title} process media`}
            />
          </section>
        )}

        <Link to={`/work/${next.slug}`} className="next">
          <span className="label">Next project</span>
          <span className="next__title">{next.title}</span>
          <span className="next__sub">{next.subtitle}</span>
        </Link>
      </main>
    </div>
  );
}
