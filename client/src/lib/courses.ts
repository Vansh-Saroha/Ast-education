import snapshot from '../seo/verified-facts.json';

// Approved course names and categories. Used only while the list is loading or when the live list is unavailable.
export const CATEGORY_LABELS: Record<string, string> = {
  school: 'School Education',
  higher: 'Higher Education Coaching',
  computer: 'Computer Education',
  technical: 'Programming & Technical',
  personality: 'Personality Development',
};

export const APPROVED_LIST_DATE = (snapshot as { snapshotDate: string }).snapshotDate;

export const COURSE_SEED: Array<{ id: string; name: string; category: string; description: string }> = [
  ['LKG to Class 12', 'school'], ['Academic Coaching', 'school'], ['Subject-wise Support', 'school'],
  ['B.A.', 'higher'], ['B.Com', 'higher'], ['B.Tech', 'higher'], ['Academic Support', 'higher'],
  ['Basic Computer', 'computer'], ['DCA', 'computer'], ['ADCA', 'computer'], ['CCC', 'computer'],
  ['Tally', 'computer'], ['MS Office', 'computer'], ['Advanced Excel', 'computer'],
  ['Coding Classes', 'technical'], ['Programming Education', 'technical'], ['Technical Skill Development', 'technical'],
  ['English Speaking', 'personality'], ['Communication Skills', 'personality'],
  ['Motivation', 'personality'], ['Personality Development', 'personality'],
].map(([name, category]) => ({
  id: name,
  name,
  category,
  description: 'Detailed course information will be updated by the institute.',
}));
