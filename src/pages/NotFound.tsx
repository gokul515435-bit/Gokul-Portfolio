import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page">
      <aside className="side" />
      <main className="content prose" id="main">
        <h1 className="big">Not found</h1>
        <p>This page doesn’t exist or has moved.</p>
        <Link to="/" className="tag tag--inline">
          Back to work
        </Link>
      </main>
    </div>
  );
}
