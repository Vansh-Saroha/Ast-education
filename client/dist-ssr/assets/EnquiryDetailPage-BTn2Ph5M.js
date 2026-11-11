import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { a as adminApi, A as ApiError, f as formatDate, b as STATUS_LABELS, S as STATUSES } from "./api-BUgD-bVR.js";
function EnquiryDetailPage() {
  const { id = "" } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi.get(id).then(({ enquiry: e }) => {
      setEnquiry(e);
      setStatus(e.status);
      setNotes(e.internalNotes ?? "");
    }).catch((err) => {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError("Could not load this enquiry.");
    });
  }, [id]);
  async function save(data) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { enquiry: updated } = await adminApi.update(id, data);
      setEnquiry(updated);
      setStatus(updated.status);
      setNotes(updated.internalNotes ?? "");
      setMessage("Saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  if (notFound) {
    return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
      /* @__PURE__ */ jsx("h1", { children: "Enquiry not found" }),
      /* @__PURE__ */ jsx("p", { children: "This enquiry may have been removed." }),
      /* @__PURE__ */ jsx(Link, { className: "btn btn-g", to: "/admin", children: "Back to enquiries" })
    ] });
  }
  if (!enquiry) {
    return /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: error || "Loading enquiry…" });
  }
  const digits = enquiry.mobile.replace(/\D/g, "");
  const waLink = `https://wa.me/91${digits}`;
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsx(Link, { className: "back", to: "/admin", children: "← Back to enquiries" }),
    /* @__PURE__ */ jsxs("header", { className: "admin-head", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { children: enquiry.studentName }),
        /* @__PURE__ */ jsxs("p", { className: "hint", children: [
          "Submitted ",
          formatDate(enquiry.createdAt)
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: `badge badge-${enquiry.status}`, children: STATUS_LABELS[enquiry.status] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
      /* @__PURE__ */ jsxs("section", { className: "admin-card", "aria-labelledby": "d-info", children: [
        /* @__PURE__ */ jsx("h2", { id: "d-info", children: "Enquiry details" }),
        /* @__PURE__ */ jsxs("dl", { className: "facts", children: [
          /* @__PURE__ */ jsx("dt", { children: "Mobile" }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("a", { href: `tel:+91${digits}`, children: enquiry.mobile }) }),
          /* @__PURE__ */ jsx("dt", { children: "Email" }),
          /* @__PURE__ */ jsx("dd", { children: enquiry.email || /* @__PURE__ */ jsx("span", { className: "ph", children: "Not provided" }) }),
          /* @__PURE__ */ jsx("dt", { children: "Qualification" }),
          /* @__PURE__ */ jsx("dd", { children: enquiry.qualification }),
          /* @__PURE__ */ jsx("dt", { children: "Interested course" }),
          /* @__PURE__ */ jsx("dd", { children: enquiry.interestedCourse }),
          /* @__PURE__ */ jsx("dt", { children: "Last status change" }),
          /* @__PURE__ */ jsx("dd", { children: enquiry.statusUpdatedAt ? formatDate(enquiry.statusUpdatedAt) : "No changes yet" })
        ] }),
        /* @__PURE__ */ jsx("h3", { children: "Student message" }),
        /* @__PURE__ */ jsx("p", { className: "message-box", children: enquiry.message || "No message was provided." }),
        /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsx("a", { className: "btn btn-n", href: `tel:+91${digits}`, children: "Call" }),
          /* @__PURE__ */ jsx("a", { className: "btn btn-g", href: waLink, target: "_blank", rel: "noopener noreferrer", children: "Message on WhatsApp" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "admin-card", "aria-labelledby": "d-status", children: [
        /* @__PURE__ */ jsx("h2", { id: "d-status", children: "Status and notes" }),
        /* @__PURE__ */ jsx("label", { htmlFor: "status", children: "Status" }),
        /* @__PURE__ */ jsx("select", { id: "status", value: status, onChange: (e) => setStatus(e.target.value), children: STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABELS[s] }, s)) }),
        /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-o",
            type: "button",
            disabled: saving || status === enquiry.status,
            onClick: () => void save({ status }),
            children: "Update status"
          }
        ) }),
        /* @__PURE__ */ jsx("label", { htmlFor: "notes", children: "Internal notes (staff only)" }),
        /* @__PURE__ */ jsx("textarea", { id: "notes", rows: 6, maxLength: 2e3, value: notes, onChange: (e) => setNotes(e.target.value) }),
        /* @__PURE__ */ jsx("p", { className: "hint", children: "Up to 2000 characters. Never shown to students." }),
        /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-g",
            type: "button",
            disabled: saving || notes === (enquiry.internalNotes ?? ""),
            onClick: () => void save({ internalNotes: notes }),
            children: "Save notes"
          }
        ) }),
        /* @__PURE__ */ jsx("p", { role: "status", "aria-live": "polite", className: "hint", children: message }),
        error && /* @__PURE__ */ jsx("p", { className: "err", role: "alert", children: error })
      ] })
    ] })
  ] });
}
export {
  EnquiryDetailPage as default
};
