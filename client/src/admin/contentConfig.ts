// Describes each editable content type. The admin editor is built from these definitions.
export type FieldKind = 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'image';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  options?: Array<[string, string]>;
  hint?: string;
  min?: number;
  purpose?: 'gallery' | 'portrait';
}

export interface TypeDef {
  title: string;
  singular: string;
  columns: Array<{ key: string; label: string }>;
  fields: FieldDef[];
}

const COURSE_CATEGORIES: Array<[string, string]> = [
  ['school', 'School Education'], ['higher', 'Higher Education Coaching'], ['computer', 'Computer Education'],
  ['technical', 'Programming & Technical'], ['personality', 'Personality Development'],
];

export const CONTENT_TYPES: Record<string, TypeDef> = {
  courses: {
    title: 'Courses',
    singular: 'course',
    columns: [{ key: 'name', label: 'Course' }, { key: 'category', label: 'Category' }],
    fields: [
      { key: 'name', label: 'Course name', kind: 'text', required: true, max: 80 },
      { key: 'category', label: 'Category', kind: 'select', required: true, options: COURSE_CATEGORIES },
      { key: 'description', label: 'Description', kind: 'textarea', max: 1000, hint: 'Use only approved descriptions. Leave the placeholder text if none is approved yet.' },
    ],
  },
  leadership: {
    title: 'Leadership',
    singular: 'leadership profile',
    columns: [{ key: 'designation', label: 'Role' }, { key: 'name', label: 'Name' }],
    fields: [
      { key: 'profileType', label: 'Profile', kind: 'select', required: true, options: [['director', 'Director / Owner'], ['manager', 'Education Manager']] },
      { key: 'designation', label: 'Designation', kind: 'text', required: true, max: 80 },
      { key: 'name', label: 'Full name', kind: 'text', max: 80, hint: 'Shown publicly only after verification.' },
      { key: 'qualifications', label: 'Educational qualifications', kind: 'textarea', max: 2000 },
      { key: 'experience', label: 'Professional experience', kind: 'textarea', max: 2000 },
      { key: 'biography', label: 'Biography', kind: 'textarea', max: 4000 },
      { key: 'responsibilities', label: 'Responsibilities', kind: 'textarea', max: 2000 },
      { key: 'skills', label: 'Skills and expertise', kind: 'textarea', max: 2000 },
      { key: 'teachingManagement', label: 'Teaching and management', kind: 'textarea', max: 2000 },
      { key: 'achievements', label: 'Achievements', kind: 'textarea', max: 2000 },
      { key: 'visionMission', label: 'Vision and mission', kind: 'textarea', max: 2000 },
      { key: 'studentMessage', label: 'Message for students', kind: 'textarea', max: 2000 },
      { key: 'quote', label: 'Inspirational quote', kind: 'textarea', max: 1000 },
      { key: 'portraitAssetId', label: 'Portrait', kind: 'image', purpose: 'portrait', hint: 'Shown publicly only after the owner confirms photo permission. Replacing or removing the portrait resets that confirmation.' },
      { key: 'photoPermission', label: 'Photo permission', kind: 'select', options: [['unconfirmed', 'Not confirmed'], ['confirmed', 'Confirmed by the owner']], hint: 'Only the owner can change this. Staff see the current state.' },
    ],
  },
  gallery: {
    title: 'Gallery',
    singular: 'photograph',
    columns: [{ key: 'category', label: 'Category' }, { key: 'altText', label: 'Description' }],
    fields: [
      { key: 'category', label: 'Category', kind: 'select', required: true, options: [
        ['institute-building', 'Institute Building'], ['classrooms', 'Classrooms'], ['computer-lab', 'Computer Lab'],
        ['faculty', 'Faculty'], ['students', 'Students'], ['educational-activities', 'Educational Activities'], ['events', 'Events'],
      ] },
      { key: 'imageAssetId', label: 'Photograph', kind: 'image', purpose: 'gallery', required: true, hint: 'JPEG, PNG or WebP, up to 6 MB. Camera data is removed on upload. Replacing the photograph needs its permission confirmed again.' },
      { key: 'altText', label: 'Alt text (describes the photo)', kind: 'text', required: true, max: 200 },
      { key: 'caption', label: 'Caption', kind: 'text', max: 160 },
      { key: 'permissionConfirmed', label: 'Permission to publish has been confirmed', kind: 'checkbox' },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    singular: 'testimonial',
    columns: [{ key: 'studentName', label: 'Student' }, { key: 'courseName', label: 'Course' }],
    fields: [
      { key: 'studentName', label: 'Student name', kind: 'text', required: true, max: 80 },
      { key: 'courseName', label: 'Course', kind: 'text', max: 80 },
      { key: 'feedback', label: 'Feedback (genuine, as given)', kind: 'textarea', required: true, max: 1000 },
      { key: 'rating', label: 'Rating (optional, 1 to 5)', kind: 'number', min: 1, max: 5 },
      { key: 'consentStatus', label: 'Consent', kind: 'select', options: [['pending', 'Pending'], ['confirmed', 'Confirmed by student']] },
    ],
  },
};

// Fields shared by every content type.
export const COMMON_FIELDS: FieldDef[] = [
  { key: 'status', label: 'Status', kind: 'select', options: [['draft', 'Draft'], ['published', 'Published'], ['archived', 'Archived']] },
  { key: 'displayOrder', label: 'Display order', kind: 'number', min: 0, max: 9999 },
];
