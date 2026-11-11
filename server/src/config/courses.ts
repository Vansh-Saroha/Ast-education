// Keep in sync with client/src/lib/enquiry.ts. Course names come from the approved course list.
export const COURSE_NAMES = [
  'LKG to Class 12', 'Academic Coaching', 'Subject-wise Support',
  'B.A.', 'B.Com', 'B.Tech', 'Academic Support',
  'Basic Computer', 'DCA', 'ADCA', 'CCC', 'Tally', 'MS Office', 'Advanced Excel',
  'Coding Classes', 'Programming Education', 'Technical Skill Development',
  'English Speaking', 'Communication Skills', 'Motivation', 'Personality Development',
] as const;

export const COURSE_OPTIONS = [...COURSE_NAMES, 'Not sure yet'] as const;

export const QUALIFICATIONS = ['Class 10', 'Class 12', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'] as const;
