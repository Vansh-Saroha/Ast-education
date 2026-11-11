import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { f as formatDate, a as adminApi } from "./api-BUgD-bVR.js";
const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
function TestimonialsManagePage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ studentName: "", courseName: "", rating: 5, review: "" });
  async function load(status = filter) {
    setLoading(true);
    setError("");
    try {
      const [list, totals] = await Promise.all([adminApi.testimonials(status), adminApi.testimonialStats()]);
      setItems(list.items);
      setStats(totals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load testimonials.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load("");
  }, []);
  async function setStatus(item, status) {
    setNotice("");
    try {
      await adminApi.updateTestimonial(item.id, { status });
      setNotice(status === "approved" ? "Testimonial approved and published." : status === "rejected" ? "Testimonial rejected." : "Testimonial moved to pending.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update testimonial.");
    }
  }
  async function remove(item) {
    if (!window.confirm(`Delete the testimonial from ${item.studentName}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteTestimonial(item.id);
      setNotice("Testimonial deleted.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete testimonial.");
    }
  }
  function startEdit(item) {
    setEditing(item);
    setDraft({ studentName: item.studentName, courseName: item.courseName, rating: item.rating, review: item.review });
  }
  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    try {
      await adminApi.updateTestimonial(editing.id, draft);
      setNotice("Testimonial updated.");
      setEditing(null);
      await load();
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Could not update testimonial.");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsx("header", { className: "admin-head", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Manage Testimonials" }),
      /* @__PURE__ */ jsx("p", { className: "hint", children: "Approve or reject student reviews before publication." })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "stat-grid", "aria-label": "Testimonial statistics", children: [
      /* @__PURE__ */ jsxs("button", { className: `stat ${filter === "" ? "is-active" : ""}`, type: "button", onClick: () => {
        setFilter("");
        void load("");
      }, children: [
        /* @__PURE__ */ jsx("span", { children: "Total Reviews" }),
        /* @__PURE__ */ jsx("strong", { children: (stats == null ? void 0 : stats.total) ?? "–" })
      ] }),
      ["pending", "approved", "rejected"].map((status) => /* @__PURE__ */ jsxs("button", { className: `stat ${filter === status ? "is-active" : ""}`, type: "button", onClick: () => {
        setFilter(status);
        void load(status);
      }, children: [
        /* @__PURE__ */ jsxs("span", { children: [
          labels[status],
          " Reviews"
        ] }),
        /* @__PURE__ */ jsx("strong", { children: (stats == null ? void 0 : stats.counts[status]) ?? 0 })
      ] }, status))
    ] }),
    notice && /* @__PURE__ */ jsx("p", { className: "admin-card hint", role: "status", children: notice }),
    error && /* @__PURE__ */ jsx("div", { className: "admin-card", role: "alert", children: /* @__PURE__ */ jsx("p", { className: "err", children: error }) }),
    loading && /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Loading testimonials…" }),
    !loading && items.length === 0 && /* @__PURE__ */ jsx("div", { className: "empty", children: "No testimonials match this view." }),
    !loading && items.length > 0 && /* @__PURE__ */ jsx("section", { className: "testimonial-admin-list", children: items.map((item) => /* @__PURE__ */ jsxs("article", { className: "admin-card testimonial-admin-card", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: `badge badge-${item.status === "pending" ? "follow-up" : item.status === "approved" ? "admitted" : "rejected"}`, children: labels[item.status] }),
        /* @__PURE__ */ jsx("h2", { children: item.studentName }),
        /* @__PURE__ */ jsxs("p", { className: "hint", children: [
          item.courseName || "Course not specified",
          " · ",
          "★".repeat(item.rating),
          "☆".repeat(5 - item.rating)
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          "“",
          item.review,
          "”"
        ] }),
        /* @__PURE__ */ jsxs("small", { className: "hint", children: [
          "Submitted ",
          formatDate(item.createdAt)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "video-actions", children: [
        item.status !== "approved" && /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "button", onClick: () => void setStatus(item, "approved"), children: "Approve" }),
        item.status !== "rejected" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => void setStatus(item, "rejected"), children: "Reject" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => startEdit(item), children: "Edit" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => void remove(item), children: "Delete" })
      ] })
    ] }, item.id)) }),
    editing && /* @__PURE__ */ jsxs("section", { className: "admin-card", "aria-labelledby": "edit-testimonial", children: [
      /* @__PURE__ */ jsx("h2", { id: "edit-testimonial", children: "Edit testimonial" }),
      /* @__PURE__ */ jsxs("form", { className: "video-form", onSubmit: saveEdit, children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Student name",
          /* @__PURE__ */ jsx("input", { value: draft.studentName, maxLength: 80, onChange: (e) => setDraft({ ...draft, studentName: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Course",
          /* @__PURE__ */ jsx("input", { value: draft.courseName, maxLength: 80, onChange: (e) => setDraft({ ...draft, courseName: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Rating",
          /* @__PURE__ */ jsx("select", { value: draft.rating, onChange: (e) => setDraft({ ...draft, rating: Number(e.target.value) }), children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
            n,
            " star",
            n === 1 ? "" : "s"
          ] }, n)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Experience",
          /* @__PURE__ */ jsx("textarea", { value: draft.review, maxLength: 1e3, rows: 5, onChange: (e) => setDraft({ ...draft, review: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", children: "Save changes" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => setEditing(null), children: "Cancel" })
        ] })
      ] })
    ] })
  ] });
}
export {
  TestimonialsManagePage as default
};
