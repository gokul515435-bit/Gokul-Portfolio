import { Outlet, ScrollRestoration, useMatch } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { PreviewProvider } from './lib/preview';

export function App() {
  const onProject = !!useMatch('/work/:slug');
  return (
    <PreviewProvider>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <SiteHeader compact={onProject} />
      <Outlet />
      <ScrollRestoration getKey={(l) => l.pathname} />
    </PreviewProvider>
  );
}
