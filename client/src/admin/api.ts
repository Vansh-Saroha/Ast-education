export type EnquiryStatus = 'new' | 'contacted' | 'follow-up' | 'admitted' | 'rejected';

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'follow-up': 'Follow-up',
  admitted: 'Admitted',
  rejected: 'Rejected',
};
export const STATUSES = Object.keys(STATUS_LABELS) as EnquiryStatus[];

export interface Enquiry {
  id: string;
  studentName: string;
  mobile: string;
  email: string;
  qualification: string;
  interestedCourse: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  statusUpdatedAt?: string;
  internalNotes?: string;
}

export type VideoCategory = 'centre-tour' | 'student-feedback' | 'parent-feedback' | 'course-demonstration' | 'events-activities' | 'promotional' | 'achievements' | 'other';
export type VideoStatus = 'draft' | 'published' | 'archived';
export interface AdminVideo { id: string; youtubeUrl: string; youtubeId: string; title: string; description: string; category: VideoCategory; status: VideoStatus; isFeatured: boolean; displayOrder: number; consentStatus: 'pending' | 'confirmed' | 'withdrawn'; consentEvidence: string; isMinor: boolean; guardianConsentConfirmed: boolean; embedUrl: string; thumbnailUrl: string; }
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export interface AdminTestimonial { id: string; studentName: string; courseName: string; rating: number; review: string; photoAssetId: string | null; status: TestimonialStatus; consent: boolean; createdAt: string; updatedAt: string; }

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'staff';
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;
  constructor(status: number, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

let authRevision = 0;
let currentAdminRequest: { revision: number; promise: Promise<{ admin: Admin }> } | undefined;

function invalidateAdminRequest(): void {
  authRevision += 1;
  currentAdminRequest = undefined;
}

function getCurrentAdmin(): Promise<{ admin: Admin }> {
  const revision = authRevision;
  if (!currentAdminRequest || currentAdminRequest.revision !== revision) {
    const promise = request<{ admin: Admin }>('/auth/me');
    currentAdminRequest = { revision, promise };
    void promise.finally(() => {
      if (currentAdminRequest?.promise === promise) currentAdminRequest = undefined;
    }).catch(() => undefined);
  }

  const pending = currentAdminRequest.promise;
  return pending.then(
    (result) => revision === authRevision ? result : getCurrentAdmin(),
    (error: unknown) => {
      if (revision !== authRevision) return getCurrentAdmin();
      throw error;
    },
  );
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body) headers['Content-Type'] = 'application/json';
  // Browsers send this only same-origin; cross-site pages cannot add it without a preflight we refuse.
  if (init.method && init.method !== 'GET') headers['X-Admin-Request'] = '1';

  const res = await fetch(`/api/admin${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error?.message ?? 'Something went wrong. Please try again.', body?.error?.fields);
  }
  return body as T;
}

export const adminApi = {
  me: getCurrentAdmin,
  login: async (email: string, password: string) => {
    const result = await request<{ admin: Admin }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    invalidateAdminRequest();
    return result;
  },
  logout: async () => {
    await request<void>('/auth/logout', { method: 'POST' });
    invalidateAdminRequest();
  },
  stats: () => request<{ total: number; counts: Record<EnquiryStatus, number> }>('/enquiries/stats'),
  list: (params: URLSearchParams) =>
    request<{ items: Enquiry[]; page: number; limit: number; total: number; pages: number }>(`/enquiries?${params}`),
  get: (id: string) => request<{ enquiry: Enquiry }>(`/enquiries/${id}`),
  update: (id: string, data: { status?: EnquiryStatus; internalNotes?: string }) =>
    request<{ enquiry: Enquiry }>(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  videos: () => request<{ items: AdminVideo[] }>('/videos'),
  createVideo: (data: Omit<AdminVideo, 'id' | 'youtubeId' | 'embedUrl' | 'thumbnailUrl'>) => request<{ item: AdminVideo }>('/videos', { method: 'POST', body: JSON.stringify(data) }),
  updateVideo: (id: string, data: Partial<Omit<AdminVideo, 'id' | 'youtubeId' | 'embedUrl' | 'thumbnailUrl'>>) => request<{ item: AdminVideo }>(`/videos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteVideo: (id: string) => request<void>(`/videos/${id}`, { method: 'DELETE' }),
  testimonials: (status = '') => request<{ items: AdminTestimonial[] }>(`/testimonials${status ? `?status=${status}` : ''}`),
  testimonialStats: () => request<{ total: number; counts: Record<TestimonialStatus, number> }>('/testimonials/stats'),
  updateTestimonial: (id: string, data: Partial<Pick<AdminTestimonial, 'studentName' | 'courseName' | 'rating' | 'review' | 'status' | 'consent' | 'photoAssetId'>>) =>
    request<{ item: AdminTestimonial }>(`/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTestimonial: (id: string) => request<void>(`/testimonials/${id}`, { method: 'DELETE' }),
};

const formatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
export const formatDate = (iso: string): string => formatter.format(new Date(iso));
