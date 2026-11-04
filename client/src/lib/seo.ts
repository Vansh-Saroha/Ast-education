import routes from '../seo/routes.json';

// Updates the title and description when the visitor moves between pages in the single-page app.
// The build step writes the same values into each page's HTML for search engines.
export function applyHead(pathname: string): void {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const route = routes.find((r) => r.path === path) ?? {
    title: 'Page not found | AST Education, Roorkee',
    description: 'The page you were looking for does not exist.',
  };
  document.title = route.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', route.description);
}
