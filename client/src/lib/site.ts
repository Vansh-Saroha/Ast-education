// Brand identifiers only. Contact details are supplied by the verified facts API/snapshot.
export const SITE = {
  name: 'AST Education',
  legalName: 'ALL STUDIES & TECHNICAL EDUCATION',
};

// Public social profiles, using the URLs already published on the contact page.
// Icons are brand SVGs saved locally under /public/assets/social/.
export const SOCIAL: ReadonlyArray<{ label: string; href: string; icon: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com/asteducation/', icon: '/assets/social/instagram.svg' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1HffKZQ1Bc/', icon: '/assets/social/facebook.svg' },
  { label: 'YouTube', href: 'https://youtube.com/@asteducation1411', icon: '/assets/social/youtube.svg' },
];
