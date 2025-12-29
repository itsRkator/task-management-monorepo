import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import NotFoundPage from './routes/$';

import './App.css';

// Create router at module level (recommended pattern for TanStack Router)
const router = createRouter({
  routeTree,
  notFoundMode: 'root',
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
