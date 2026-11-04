import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { FactsProvider } from './lib/facts';

// Renders one public page to HTML at build time. Nothing here makes network requests. Each page starts from the
// same approved state the browser starts from, so the browser can hydrate the markup without differences.
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <FactsProvider>
        <App />
      </FactsProvider>
    </StaticRouter>,
  );
}
