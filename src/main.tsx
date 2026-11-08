import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { WorkPage } from './pages/WorkPage';
import { ProjectPage } from './pages/ProjectPage';
import { AboutPage, ContactPage } from './pages/InfoPages';
import { NotFound } from './pages/NotFound';
import './styles/app.css';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <WorkPage /> },
      { path: '/work/:slug', element: <ProjectPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
