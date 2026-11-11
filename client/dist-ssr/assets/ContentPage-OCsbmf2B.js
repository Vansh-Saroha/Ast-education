import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { f as formatDate, r as request, A as ApiError } from "./api-BUgD-bVR.js";
import { u as useAdminRole, I as ImageUploader } from "./ImageUploader-CyBXnbNG.js";
const COURSE_CATEGORIES = [
  ["school", "School Education"],
  ["higher", "Higher Education Coaching"],
  ["computer", "Computer Education"],
  ["technical", "Programming & Technical"],
  ["personality", "Personality Development"]
];
const CONTENT_TYPES = {
  courses: {
    title: "Courses",
    singular: "course",
    columns: [{ key: "name", label: "Course" }, { key: "category", label: "Category" }],
    fields: [
      { key: "name", label: "Course name", kind: "text", required: true, max: 80 },
      { key: "category", label: "Category", kind: "select", required: true, options: COURSE_CATEGORIES },
      { key: "description", label: "Description", kind: "textarea", max: 1e3, hint: "Use only approved descriptions. Leave the placeholder text if none is approved yet." }
    ]
  },
  leadership: {
    title: "Leadership",
    singular: "leadership profile",
    columns: [{ key: "designation", label: "Role" }, { key: "name", label: "Name" }],
    fields: [
      { key: "profileType", label: "Profile", kind: "select", required: true, options: [["director", "Director / Owner"], ["manager", "Education Manager"]] },
      { key: "designation", label: "Designation", kind: "text", required: true, max: 80 },
      { key: "name", label: "Full name", kind: "text", max: 80, hint: "Shown publicly only after verification." },
      { key: "qualifications", label: "Educational qualifications", kind: "textarea", max: 2e3 },
      { key: "experience", label: "Professional experience", kind: "textarea", max: 2e3 },
      { key: "biography", label: "Biography", kind: "textarea", max: 4e3 },
      { key: "responsibilities", label: "Responsibilities", kind: "textarea", max: 2e3 },
      { key: "skills", label: "Skills and expertise", kind: "textarea", max: 2e3 },
      { key: "teachingManagement", label: "Teaching and management", kind: "textarea", max: 2e3 },
      { key: "achievements", label: "Achievements", kind: "textarea", max: 2e3 },
      { key: "visionMission", label: "Vision and mission", kind: "textarea", max: 2e3 },
      { key: "studentMessage", label: "Message for students", kind: "textarea", max: 2e3 },
      { key: "quote", label: "Inspirational quote", kind: "textarea", max: 1e3 },
      { key: "portraitAssetId", label: "Portrait", kind: "image", purpose: "portrait", hint: "Shown publicly only after the owner confirms photo permission. Replacing or removing the portrait resets that confirmation." },
      { key: "photoPermission", label: "Photo permission", kind: "select", options: [["unconfirmed", "Not confirmed"], ["confirmed", "Confirmed by the owner"]], hint: "Only the owner can change this. Staff see the current state." }
    ]
  },
  gallery: {
    title: "Gallery",
    singular: "photograph",
    columns: [{ key: "category", label: "Category" }, { key: "altText", label: "Description" }],
    fields: [
      { key: "category", label: "Category", kind: "select", required: true, options: [
        ["institute-building", "Institute Building"],
        ["classrooms", "Classrooms"],
        ["computer-lab", "Computer Lab"],
        ["faculty", "Faculty"],
        ["students", "Students"],
        ["educational-activities", "Educational Activities"],
        ["events", "Events"]
      ] },
      { key: "imageAssetId", label: "Photograph", kind: "image", purpose: "gallery", required: true, hint: "JPEG, PNG or WebP, up to 6 MB. Camera data is removed on upload. Replacing the photograph needs its permission confirmed again." },
      { key: "altText", label: "Alt text (describes the photo)", kind: "text", required: true, max: 200 },
      { key: "caption", label: "Caption", kind: "text", max: 160 },
      { key: "permissionConfirmed", label: "Permission to publish has been confirmed", kind: "checkbox" }
    ]
  },
  testimonials: {
    title: "Testimonials",
    singular: "testimonial",
    columns: [{ key: "studentName", label: "Student" }, { key: "courseName", label: "Course" }],
    fields: [
      { key: "studentName", label: "Student name", kind: "text", required: true, max: 80 },
      { key: "courseName", label: "Course", kind: "text", max: 80 },
      { key: "feedback", label: "Feedback (genuine, as given)", kind: "textarea", required: true, max: 1e3 },
      { key: "rating", label: "Rating (optional, 1 to 5)", kind: "number", min: 1, max: 5 },
      { key: "consentStatus", label: "Consent", kind: "select", options: [["pending", "Pending"], ["confirmed", "Confirmed by student"]] }
    ]
  }
};
const COMMON_FIELDS = [
  { key: "status", label: "Status", kind: "select", options: [["draft", "Draft"], ["published", "Published"], ["archived", "Archived"]] },
  { key: "displayOrder", label: "Display order", kind: "number", min: 0, max: 9999 }
];
const STATUS_LABEL = { draft: "Draft", published: "Published", archived: "Archived" };
function ContentPage() {
  const { type = "" } = useParams();
  const def = CONTENT_TYPES[type];
  const role = useAdminRole();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  async function load() {
    try {
      const r = await request(`/${type}`);
      setItems(r.items);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load items.");
    }
  }
  useEffect(() => {
    setItems(null);
    setEditing(null);
    if (def) void load();
  }, [type]);
  if (!def) return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsx("h1", { children: "Unknown content type" }),
    /* @__PURE__ */ jsx(Link, { to: "/admin", children: "Back to enquiries" })
  ] });
  const allFields = [...def.fields, ...COMMON_FIELDS];
  function startEdit(item) {
    setNotice("");
    setFieldErrors({});
    setEditing(item);
    const base = { status: "draft", displayOrder: 0 };
    const source = item === "new" ? {} : item;
    for (const f of allFields) {
      const v = source[f.key];
      base[f.key] = f.kind === "checkbox" ? Boolean(v) : v == null ? "" : v;
    }
    setDraft(base);
  }
  async function save(e) {
    e.preventDefault();
    if (saving || !editing) return;
    setSaving(true);
    setFieldErrors({});
    setNotice("");
    const body = {};
    for (const f of allFields) {
      const v = draft[f.key];
      if (f.kind === "image") {
        body[f.key] = v ? String(v) : null;
        continue;
      }
      if (f.kind === "number") {
        if (v !== "" && v !== void 0) body[f.key] = Number(v);
      } else if (f.kind === "checkbox") {
        body[f.key] = Boolean(v);
      } else if (typeof v === "string" && (v.trim() !== "" || f.key in (editing === "new" ? {} : editing))) {
        body[f.key] = v.trim();
      }
    }
    if (draft.verification === "verified" || draft.verification === "pending") body.verification = draft.verification;
    try {
      if (editing === "new") {
        await request(`/${type}`, { method: "POST", body: JSON.stringify(body) });
        setNotice(`Added. It stays in draft until you publish it, and stays hidden until verified.`);
      } else {
        await request(`/${type}/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
        setNotice("Saved.");
      }
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k, v[0]])));
      }
      setNotice(err instanceof ApiError ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  async function removeItem(it) {
    const confirmed = type === "courses" ? window.confirm(`Delete the course "${String(it.name ?? "")}"? This cannot be undone.`) : window.confirm("Delete this photograph and its image? This cannot be undone.");
    if (!confirmed) return;
    setDeletingId(it.id);
    try {
      await request(`/${type}/${it.id}`, { method: "DELETE" });
      setNotice(type === "courses" ? `Deleted course "${String(it.name ?? "")}".` : "Deleted. The image was removed as well.");
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }
  const canVerify = role === "owner";
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsxs("header", { className: "admin-head", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { children: def.title }),
        /* @__PURE__ */ jsx("p", { className: "hint", children: "Only published and verified items appear on the public website." })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-o", type: "button", onClick: () => startEdit("new"), children: [
        "Add ",
        def.singular
      ] })
    ] }),
    notice && /* @__PURE__ */ jsx("p", { className: "admin-card hint", role: "status", children: notice }),
    error && /* @__PURE__ */ jsx("div", { className: "admin-card", role: "alert", children: /* @__PURE__ */ jsx("p", { className: "err", children: error }) }),
    !items && !error && /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Loading…" }),
    items && items.length === 0 && /* @__PURE__ */ jsxs("div", { className: "empty", children: [
      "No ",
      def.title.toLowerCase(),
      " yet."
    ] }),
    items && items.length > 0 && /* @__PURE__ */ jsx("section", { className: "admin-card table-card", children: /* @__PURE__ */ jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxs("table", { className: "enq-table", children: [
      /* @__PURE__ */ jsx("caption", { className: "sr-only", children: def.title }),
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        def.columns.map((c) => /* @__PURE__ */ jsx("th", { scope: "col", children: c.label }, c.key)),
        /* @__PURE__ */ jsx("th", { scope: "col", children: "Status" }),
        /* @__PURE__ */ jsx("th", { scope: "col", children: "Verification" }),
        /* @__PURE__ */ jsx("th", { scope: "col", children: "Updated" }),
        /* @__PURE__ */ jsx("th", { scope: "col", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Actions" }) })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: items.map((it) => /* @__PURE__ */ jsxs("tr", { children: [
        def.columns.map((c) => /* @__PURE__ */ jsx("td", { "data-label": c.label, children: String(it[c.key] ?? "") || /* @__PURE__ */ jsx("span", { className: "ph", children: "Not set" }) }, c.key)),
        /* @__PURE__ */ jsx("td", { "data-label": "Status", children: /* @__PURE__ */ jsx("span", { className: `badge ${it.status === "published" ? "badge-admitted" : "badge-contacted"}`, children: STATUS_LABEL[String(it.status)] ?? String(it.status) }) }),
        /* @__PURE__ */ jsx("td", { "data-label": "Verification", children: it.verification === "verified" ? /* @__PURE__ */ jsx("span", { className: "badge badge-admitted", children: "Verified" }) : /* @__PURE__ */ jsx("span", { className: "badge badge-follow-up", children: "Pending verification" }) }),
        /* @__PURE__ */ jsx("td", { "data-label": "Updated", children: it.updatedAt ? formatDate(String(it.updatedAt)) : "–" }),
        /* @__PURE__ */ jsx("td", { "data-label": "Actions", children: /* @__PURE__ */ jsxs("div", { className: "row", style: { marginTop: 0 }, children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => startEdit(it), children: "Edit" }),
          type === "courses" && role === "owner" && /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-g",
              type: "button",
              disabled: deletingId === it.id,
              onClick: () => void removeItem(it),
              children: deletingId === it.id ? "Deleting…" : "Delete"
            }
          ),
          type === "gallery" && role === "owner" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => void removeItem(it), children: "Delete with image" })
        ] }) })
      ] }, it.id)) })
    ] }) }) }),
    editing && /* @__PURE__ */ jsxs("section", { className: "admin-card", "aria-labelledby": "editor-title", children: [
      /* @__PURE__ */ jsx("h2", { id: "editor-title", children: editing === "new" ? `New ${def.singular}` : `Edit ${def.singular}` }),
      /* @__PURE__ */ jsxs("form", { onSubmit: save, noValidate: true, className: "editor", children: [
        allFields.map((f) => /* @__PURE__ */ jsx(
          FieldInput,
          {
            def: f,
            value: draft[f.key],
            error: fieldErrors[f.key],
            disabled: (f.key === "photoPermission" || f.key === "permissionConfirmed" || f.key === "consentStatus") && role !== "owner",
            onChange: (v) => setDraft((d) => ({ ...d, [f.key]: v }))
          },
          f.key
        )),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "verification", children: "Verification" }),
          /* @__PURE__ */ jsxs("select", { id: "verification", disabled: !canVerify, value: String(draft.verification ?? ""), onChange: (e) => setDraft((d) => ({ ...d, verification: e.target.value })), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "No change" }),
            /* @__PURE__ */ jsx("option", { value: "verified", children: "Mark as verified" }),
            /* @__PURE__ */ jsx("option", { value: "pending", children: "Mark as pending" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "hint", children: canVerify ? "Only verify information you have checked against the source." : "Only the owner can verify information. Edits return items to pending until the owner verifies them." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", disabled: saving, children: saving ? "Saving…" : "Save" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => setEditing(null), children: "Cancel" })
        ] })
      ] })
    ] })
  ] });
}
function FieldInput({ def, value, error, onChange, disabled }) {
  var _a;
  const id = `f-${def.key}`;
  const describedBy = [def.hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || void 0;
  const common = { id, "aria-invalid": !!error, "aria-describedby": describedBy, disabled };
  if (def.kind === "image") {
    return /* @__PURE__ */ jsx(
      ImageUploader,
      {
        purpose: def.purpose ?? "gallery",
        label: def.label,
        value: value ? String(value) : null,
        nullable: !def.required,
        disabled,
        hint: def.hint,
        onChange: (assetId) => onChange(assetId ?? "")
      }
    );
  }
  if (def.kind === "checkbox") {
    return /* @__PURE__ */ jsxs("div", { className: "check", children: [
      /* @__PURE__ */ jsx("input", { type: "checkbox", ...common, checked: Boolean(value), onChange: (e) => onChange(e.target.checked) }),
      /* @__PURE__ */ jsx("label", { htmlFor: id, style: { margin: 0, fontWeight: 400 }, children: def.label }),
      error && /* @__PURE__ */ jsx("p", { className: "err", id: `${id}-error`, role: "alert", children: error })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: id, children: [
      def.label,
      def.required && /* @__PURE__ */ jsx("span", { className: "hint", children: " (required)" })
    ] }),
    def.kind === "textarea" && /* @__PURE__ */ jsx("textarea", { rows: 4, maxLength: def.max, ...common, value: String(value ?? ""), onChange: (e) => onChange(e.target.value) }),
    def.kind === "text" && /* @__PURE__ */ jsx("input", { maxLength: def.max, ...common, value: String(value ?? ""), onChange: (e) => onChange(e.target.value) }),
    def.kind === "number" && /* @__PURE__ */ jsx("input", { type: "number", min: def.min, max: def.max, ...common, value: String(value ?? ""), onChange: (e) => onChange(e.target.value) }),
    def.kind === "select" && /* @__PURE__ */ jsxs("select", { ...common, value: String(value ?? ""), onChange: (e) => onChange(e.target.value), children: [
      !def.required && /* @__PURE__ */ jsx("option", { value: "", children: "Not set" }),
      (_a = def.options) == null ? void 0 : _a.map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
    ] }),
    def.hint && /* @__PURE__ */ jsx("p", { className: "hint", id: `${id}-hint`, children: def.hint }),
    error && /* @__PURE__ */ jsx("p", { className: "err", id: `${id}-error`, role: "alert", children: error })
  ] });
}
export {
  ContentPage as default
};
