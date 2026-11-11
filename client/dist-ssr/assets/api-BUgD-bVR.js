const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  "follow-up": "Follow-up",
  admitted: "Admitted",
  rejected: "Rejected"
};
const STATUSES = Object.keys(STATUS_LABELS);
class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
async function request(path, init = {}) {
  var _a, _b;
  const headers = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.method && init.method !== "GET") headers["X-Admin-Request"] = "1";
  const res = await fetch(`/api/admin${path}`, { ...init, headers, credentials: "same-origin" });
  if (res.status === 204) return void 0;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, ((_a = body == null ? void 0 : body.error) == null ? void 0 : _a.message) ?? "Something went wrong. Please try again.", (_b = body == null ? void 0 : body.error) == null ? void 0 : _b.fields);
  }
  return body;
}
const adminApi = {
  me: () => request("/auth/me"),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  stats: () => request("/enquiries/stats"),
  list: (params) => request(`/enquiries?${params}`),
  get: (id) => request(`/enquiries/${id}`),
  update: (id, data) => request(`/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  videos: () => request("/videos"),
  createVideo: (data) => request("/videos", { method: "POST", body: JSON.stringify(data) }),
  updateVideo: (id, data) => request(`/videos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteVideo: (id) => request(`/videos/${id}`, { method: "DELETE" }),
  testimonials: (status = "") => request(`/testimonials${status ? `?status=${status}` : ""}`),
  testimonialStats: () => request("/testimonials/stats"),
  updateTestimonial: (id, data) => request(`/testimonials/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTestimonial: (id) => request(`/testimonials/${id}`, { method: "DELETE" })
};
const formatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const formatDate = (iso) => formatter.format(new Date(iso));
export {
  ApiError as A,
  STATUSES as S,
  adminApi as a,
  STATUS_LABELS as b,
  formatDate as f,
  request as r
};
