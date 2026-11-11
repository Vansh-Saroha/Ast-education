import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { a as adminApi } from "./api-BUgD-bVR.js";
const CATEGORIES = [
  ["centre-tour", "Centre Tour"],
  ["student-feedback", "Student Feedback"],
  ["parent-feedback", "Parent Feedback"],
  ["course-demonstration", "Course Demonstration"],
  ["events-activities", "Events & Activities"],
  ["promotional", "Promotional Videos"],
  ["achievements", "Achievements"],
  ["other", "Other"]
];
const blank = { youtubeUrl: "", title: "", description: "", category: "centre-tour", status: "draft", isFeatured: false, displayOrder: 0, consentStatus: "pending", consentEvidence: "", isMinor: false, guardianConsentConfirmed: false };
function VideosPage() {
  const [admin, setAdmin] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const owner = (admin == null ? void 0 : admin.role) === "owner";
  async function refresh() {
    const [a, v] = await Promise.all([adminApi.me(), adminApi.videos()]);
    setAdmin(a.admin);
    setItems(v.items);
  }
  useEffect(() => {
    refresh().catch((e) => setMessage(e.message));
  }, []);
  async function addVideo(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await adminApi.createVideo(form);
      setForm(blank);
      await refresh();
      setMessage("Draft video saved.");
    } catch (e2) {
      setMessage(e2 instanceof Error ? e2.message : "Could not save video.");
    } finally {
      setBusy(false);
    }
  }
  async function change(id, data) {
    setBusy(true);
    setMessage("");
    try {
      await adminApi.updateVideo(id, data);
      await refresh();
      setMessage("Video updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update video.");
    } finally {
      setBusy(false);
    }
  }
  async function edit(v) {
    const title = window.prompt("Video title", v.title);
    if (title === null) return;
    const description = window.prompt("Video description", v.description);
    if (description === null) return;
    const youtubeUrl = window.prompt("YouTube URL", v.youtubeUrl);
    if (youtubeUrl === null) return;
    const orderText = window.prompt("Display order (0–9999)", String(v.displayOrder));
    if (orderText === null) return;
    const displayOrder = Number(orderText);
    if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) {
      setMessage("Display order must be a whole number from 0 to 9999.");
      return;
    }
    await change(v.id, { title: title.trim(), description: description.trim(), youtubeUrl: youtubeUrl.trim(), displayOrder });
  }
  async function remove(id) {
    if (!window.confirm("Permanently delete this video record?")) return;
    setBusy(true);
    try {
      await adminApi.deleteVideo(id);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsx("div", { className: "admin-head", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Video Management" }),
      /* @__PURE__ */ jsx("p", { className: "hint", children: "YouTube-hosted videos · ₹0 additional video hosting cost" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "admin-card", children: [
      /* @__PURE__ */ jsx("h2", { children: "Add a YouTube video" }),
      /* @__PURE__ */ jsx("p", { className: "hint", children: "Upload the video to AST Education’s YouTube channel first, then paste its URL here. Unlisted videos are not private; anyone with the link can share them." }),
      /* @__PURE__ */ jsxs("form", { className: "video-form", onSubmit: addVideo, children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "YouTube URL",
          /* @__PURE__ */ jsx("input", { required: true, type: "url", value: form.youtubeUrl, onChange: (e) => setForm({ ...form, youtubeUrl: e.target.value }), placeholder: "https://youtu.be/xxxxxxxxxxx" })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Video title",
          /* @__PURE__ */ jsx("input", { required: true, minLength: 2, maxLength: 120, value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Category",
          /* @__PURE__ */ jsx("select", { value: form.category, onChange: (e) => setForm({ ...form, category: e.target.value }), children: CATEGORIES.map(([v, label]) => /* @__PURE__ */ jsx("option", { value: v, children: label }, v)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Description",
          /* @__PURE__ */ jsx("textarea", { maxLength: 1e3, rows: 3, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Display order",
          /* @__PURE__ */ jsx("input", { type: "number", min: "0", max: "9999", value: form.displayOrder, onChange: (e) => setForm({ ...form, displayOrder: Number(e.target.value) }) })
        ] }),
        owner && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("label", { className: "video-check", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.isMinor, onChange: (e) => setForm({ ...form, isMinor: e.target.checked }) }),
            " Video includes a minor"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "video-check", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.guardianConsentConfirmed, onChange: (e) => setForm({ ...form, guardianConsentConfirmed: e.target.checked }) }),
            " Parent/guardian consent documented"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", disabled: busy, children: busy ? "Saving…" : "Save as draft" })
      ] })
    ] }),
    message && /* @__PURE__ */ jsx("p", { role: "status", className: "note", children: message }),
    /* @__PURE__ */ jsxs("div", { className: "admin-card", children: [
      /* @__PURE__ */ jsxs("h2", { children: [
        "Video library (",
        items.length,
        ")"
      ] }),
      items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "empty", children: "No videos added yet." }) : /* @__PURE__ */ jsx("div", { className: "video-admin-list", children: items.map((v) => {
        var _a;
        return /* @__PURE__ */ jsxs("article", { className: "video-admin-item", children: [
          /* @__PURE__ */ jsx("img", { src: v.thumbnailUrl, alt: "", loading: "lazy" }),
          /* @__PURE__ */ jsxs("div", { className: "video-admin-info", children: [
            /* @__PURE__ */ jsx("h3", { children: v.title }),
            /* @__PURE__ */ jsxs("p", { className: "hint", children: [
              (_a = CATEGORIES.find(([k]) => k === v.category)) == null ? void 0 : _a[1],
              " · ",
              v.status,
              " · Consent: ",
              v.consentStatus,
              v.isFeatured ? " · Featured" : ""
            ] }),
            /* @__PURE__ */ jsx("a", { href: v.youtubeUrl, target: "_blank", rel: "noreferrer", children: "Open on YouTube" }),
            /* @__PURE__ */ jsxs("div", { className: "video-actions", children: [
              /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => edit(v), children: "Edit details" }),
              owner && !v.isMinor && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => {
                if (window.confirm("Confirm this video includes a minor?")) change(v.id, { isMinor: true, guardianConsentConfirmed: false, consentStatus: "pending", consentEvidence: "", status: "draft", isFeatured: false });
              }, children: "Mark as minor" }),
              owner && v.isMinor && !v.guardianConsentConfirmed && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => {
                if (window.confirm("Confirm documented parent/guardian consent has been obtained?")) change(v.id, { guardianConsentConfirmed: true });
              }, children: "Confirm guardian consent" }),
              owner && v.consentStatus !== "confirmed" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy || v.isMinor && !v.guardianConsentConfirmed, onClick: () => {
                const evidence = window.prompt("Consent record/reference (do not enter sensitive personal details):");
                if (evidence == null ? void 0 : evidence.trim()) change(v.id, { consentStatus: "confirmed", consentEvidence: evidence.trim() });
              }, children: "Confirm consent" }),
              owner && v.status !== "published" && /* @__PURE__ */ jsx("button", { className: "btn btn-o", disabled: busy || v.consentStatus !== "confirmed" || v.isMinor && !v.guardianConsentConfirmed, onClick: () => change(v.id, { status: "published" }), children: "Publish" }),
              owner && v.status === "published" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => change(v.id, { status: "draft" }), children: "Unpublish" }),
              owner && v.status !== "archived" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => change(v.id, { status: "archived", isFeatured: false }), children: "Archive" }),
              owner && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => change(v.id, { isFeatured: !v.isFeatured }), children: v.isFeatured ? "Remove featured" : "Feature" }),
              owner && v.consentStatus !== "withdrawn" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => {
                if (window.confirm("Confirm that consent has been withdrawn? This immediately removes the video from public results.")) change(v.id, { consentStatus: "withdrawn" });
              }, children: "Withdraw consent" }),
              owner && /* @__PURE__ */ jsx("button", { className: "btn btn-g", disabled: busy, onClick: () => remove(v.id), children: "Delete" })
            ] })
          ] })
        ] }, v.id);
      }) })
    ] })
  ] });
}
export {
  VideosPage as default
};
