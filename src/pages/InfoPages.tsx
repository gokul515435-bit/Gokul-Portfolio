import { site } from '../data/site';
import { useDocumentTitle } from '../lib/hooks';

export function AboutPage() {
  useDocumentTitle(`About — ${site.name}, ${site.role}`);
  return (
    <div className="page">
      <aside className="side" />
      <main className="content prose" id="main">
        <section className="block block--first">
          <h1 className="label">About</h1>
          <p className="lead">{site.intro}</p>
        </section>
        {site.about.map((p, i) => (
          <section className="block" key={p}>
            <h2 className="label">{i === 0 ? 'Practice' : 'Services'}</h2>
            <p className="lead">{p}</p>
          </section>
        ))}
        <section className="block">
          <h2 className="label">Elsewhere</h2>
          <ul className="links">
            {site.links.map((l) => (
              <li key={l.label}>
                <a className="tag tag--inline" href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export function ContactPage() {
  useDocumentTitle(`Contact — ${site.name}, ${site.role}`);
  return (
    <div className="page">
      <aside className="side" />
      <main className="content prose" id="main">
        <section className="block block--first">
          <h1 className="label">Contact</h1>
          <a className="big big--link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </section>
        <section className="block">
          <h2 className="label">Based in</h2>
          <p className="lead">{site.location} — available for freelance and full-time work.</p>
        </section>
        <section className="block">
          <h2 className="label">Follow</h2>
          <ul className="links">
            {site.links.map((l) => (
              <li key={l.label}>
                <a className="tag tag--inline" href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
