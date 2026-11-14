// Runs after `vite build` and `vite build --ssr`. For every public route it writes a complete HTML page:
// the rendered body, the page's own title, description, Open Graph tags and canonical link, plus structured
// data on the home page. It also writes robots.txt, sitemap.xml (when SITE_URL is set) and runs safety checks
// that stop the build if unverified claims or withdrawn portraits reach the output.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');
const routes = JSON.parse(readFileSync(join(root, 'src/seo/routes.json'), 'utf8'));
const facts = JSON.parse(readFileSync(join(root, 'src/seo/verified-facts.json'), 'utf8'));
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '');

if (!existsSync(ssrEntry)) {
  console.error('dist-ssr/entry-server.js is missing. Run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first.');
  process.exit(1);
}
const shell = readFileSync(join(dist, 'index.html'), 'utf8');
const manifestPath = join(dist, '.vite', 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error('Vite manifest is missing. Run `vite build` before prerendering.');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pageEntries = {
  '/': 'src/pages/ApprovedPage.tsx',
  '/about': 'src/pages/ApprovedPage.tsx',
  '/courses': 'src/pages/CoursesPage.tsx',
  '/leadership': 'src/pages/LeadershipPage.tsx',
  '/certifications': 'src/pages/CertificationsPage.tsx',
  '/gallery': 'src/pages/GalleryPage.tsx',
  '/videos': 'src/pages/VideosPage.tsx',
  '/testimonials': 'src/pages/TestimonialsPage.tsx',
  '/contact': 'src/pages/ContactPage.tsx',
  '/enquiry': 'src/pages/EnquiryPage.tsx',
  '/privacy': 'src/pages/LegalPages.tsx',
  '/terms': 'src/pages/LegalPages.tsx',
};
const ROOT_MARKER = '<div id="root"></div>';
if (!shell.includes(ROOT_MARKER)) {
  console.error('Unexpected index.html: the empty root element was not found.');
  process.exit(1);
}
const { render } = await import(pathToFileURL(ssrEntry).href);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const absolute = (path) => (siteUrl ? `${siteUrl}${path}` : '');
const targetFor = (path) => (path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html'));

function stylesForRoute(path) {
  const entryKey = pageEntries[path];
  if (!entryKey) {
    console.error(`No page CSS manifest mapping for ${path}.`);
    process.exit(1);
  }
  const visited = new Set();
  const styles = new Set();
  const visit = (key) => {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    // Static page imports have their styles included in the shell stylesheet.
    if (!entry) return;
    for (const stylesheet of entry.css ?? []) styles.add(stylesheet);
    for (const imported of entry.imports ?? []) visit(imported);
  };
  visit(entryKey);
  return [...styles];
}

const shellStyles = new Set([...shell.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)].map((match) => match[1]));
function pageStyles(path) {
  return stylesForRoute(path)
    .map((stylesheet) => `/${stylesheet}`)
    .filter((href) => !shellStyles.has(href))
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n    ');
}

function organisationJsonLd() {
  // Only verified facts appear here. Hours and ratings are excluded until they are verified.
  const value = (k) => facts[k]?.value;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'AST Education',
    alternateName: 'ALL STUDIES & TECHNICAL EDUCATION',
    telephone: value('phone'),
    foundingDate: '2023-12-05',
    address: {
      '@type': 'PostalAddress',
      streetAddress: value('address'),
      addressLocality: 'Roorkee',
      addressRegion: 'Uttarakhand',
      postalCode: '247667',
      addressCountry: 'IN',
    },
    parentOrganization: { '@type': 'Organization', name: value('parentOrganisation') },
  };
  if (siteUrl) data.url = `${siteUrl}/`;
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function headTags(route) {
  const url = absolute(route.path);
  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    url ? `<link rel="canonical" href="${esc(url)}" />` : '',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="AST Education" />',
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    url ? `<meta property="og:url" content="${esc(url)}" />` : '',
    '<meta name="twitter:card" content="summary" />',
    route.path === '/' ? `<script type="application/ld+json">${organisationJsonLd()}</script>` : '',
  ].filter(Boolean).join('\n    ');
}

// 1. Render every public page with its full body
const rendered = {};
for (const route of routes) {
  const body = render(route.path);
  rendered[route.path] = body;
  const html = shell
    .replace(/<title>[\s\S]*?<\/title>/, () => '')
    .replace(/<meta name="description"[^>]*>/, () => '')
    .replace('</head>', () => `    ${pageStyles(route.path)}\n    ${headTags(route)}\n  </head>`)
    .replace(ROOT_MARKER, () => `<div id="root" data-prerendered-path="${esc(route.path)}">${body}</div>`);
  const target = targetFor(route.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
}

// 2. robots.txt and sitemap.xml
writeFileSync(
  join(dist, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : []), ''].join('\n'),
  'utf8',
);
if (siteUrl) {
  const urls = routes.map((r) => `  <url><loc>${esc(absolute(r.path))}</loc></url>`).join('\n');
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8',
  );
} else {
  console.warn('SITE_URL is not set: canonical links and sitemap.xml were not generated.');
}

// 3. Safety checks on the finished output
const problems = [];
const forbidden = ['4.7/5', '4.7 out of 5', '95 reviews', 'approximately 95', 'Monday to Saturday', '7:00 AM', '10,000+', '100% results', '20 years of experience', 'dir.webp', 'mgr.webp', ['KL', 'DAV'].join('')];
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(html|js|css|xml|txt|json)$/.test(name)) files.push(full);
  }
};
walk(dist);
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const word of forbidden) if (text.includes(word)) problems.push(`"${word}" found in ${file.replace(dist, 'dist')}`);
}
for (const route of routes) {
  const target = targetFor(route.path);
  if (!existsSync(target)) {
    problems.push(`missing page ${route.path}`);
    continue;
  }
  const html = readFileSync(target, 'utf8');
  if (!html.includes('<h1')) problems.push(`no heading rendered for ${route.path}`);
  if (!html.includes('<script type="module"')) problems.push(`no hydration script on ${route.path}`);
  if (!html.includes(facts.address.value) && route.path !== '/privacy') {
    // Address appears in the footer of every public page.
    problems.push(`address missing from ${route.path}`);
  }
}
if (!rendered['/courses'].includes('Tally')) problems.push('course list did not render in the courses page body');

if (problems.length) {
  console.error('Build check failed:\n' + problems.join('\n'));
  process.exit(1);
}
console.log(`Prerendered ${routes.length} public pages with full bodies. Safety checks passed.`);
