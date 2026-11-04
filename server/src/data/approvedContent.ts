// Approved starting content. The seed script writes these values into MongoDB.
// The client snapshot (client/src/seo/verified-facts.json) must match the verified facts below. A test checks this.

export const APPROVED_COURSES: ReadonlyArray<readonly [name: string, category: string]> = [
  ['LKG to Class 12', 'school'], ['Academic Coaching', 'school'], ['Subject-wise Academic Support', 'school'],
  ['B.A. Coaching', 'higher'], ['B.Com Coaching', 'higher'], ['B.Tech Coaching', 'higher'],
  ['Basic Computer', 'computer'], ['DCA', 'computer'], ['ADCA', 'computer'], ['CCC', 'computer'],
  ['Tally', 'computer'], ['MS Office', 'computer'], ['Advanced Excel', 'computer'],
  ['Coding Classes', 'technical'], ['Programming Education', 'technical'], ['Technical Skill Development', 'technical'],
  ['English Speaking', 'personality'], ['Communication Skills', 'personality'],
  ['Motivation Classes', 'personality'], ['Personality Development', 'personality'],
];

// portraitSource names a file in server/private-assets. The seed imports it into the media store once.
// Until the owner confirms photo permission, the portrait is never shown publicly.
export const APPROVED_LEADERSHIP = [
  { profileType: 'director', designation: 'Director / Owner', portraitSource: 'director.webp' },
  { profileType: 'manager', designation: 'Education Manager', portraitSource: 'manager.webp' },
] as const;

export type VerificationSource = 'owner-confirmed' | 'document-checked' | 'none';

export interface FactSeed {
  key: string;
  label: string;
  value: string;
  note: string;
  verification: 'pending' | 'verified';
  verificationSource: VerificationSource;
}

const OWNER_NOTE = 'Confirmed by the owner. Not checked against an independent document.';

export const APPROVED_FACTS: FactSeed[] = [
  { key: 'phone', label: 'Main contact number', value: '+91 89794 87215', verification: 'verified', verificationSource: 'owner-confirmed', note: 'Confirmed by the owner.' },
  { key: 'whatsapp', label: 'WhatsApp number', value: '+91 96907 66514', verification: 'verified', verificationSource: 'owner-confirmed', note: 'Confirmed by the owner.' },
  {
    key: 'address',
    label: 'Address',
    value: '244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667',
    verification: 'verified',
    verificationSource: 'owner-confirmed',
    note: 'Road name confirmed by the owner. Not checked against an independent document.',
  },
  { key: 'established', label: 'Business established', value: '5 December 2023', verification: 'verified', verificationSource: 'owner-confirmed', note: OWNER_NOTE },
  { key: 'udyamNumber', label: 'Udyam registration number', value: 'UDYAM-UK-06-0037585', verification: 'verified', verificationSource: 'owner-confirmed', note: OWNER_NOTE },
  { key: 'parentOrganisation', label: 'Parent organisation', value: 'SUMAN EDUCATIONAL TRUST', verification: 'verified', verificationSource: 'owner-confirmed', note: OWNER_NOTE },
  { key: 'hours', label: 'Working hours', value: 'Monday to Saturday, 7:00 AM to 7:00 PM', verification: 'pending', verificationSource: 'none', note: 'Pending: confirm with the owner before publishing.' },
  { key: 'googleRating', label: 'Google rating', value: '4.7 out of 5 (approximately 95 reviews)', verification: 'pending', verificationSource: 'none', note: 'Pending: verify on the Google Business Profile. Never shown publicly until verified.' },
];
