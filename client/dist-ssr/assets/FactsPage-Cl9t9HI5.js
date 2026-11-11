import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { f as formatDate, r as request, A as ApiError } from "./api-BUgD-bVR.js";
import { u as useAdminRole, I as ImageUploader } from "./ImageUploader-CyBXnbNG.js";
const SOURCE_LABEL = {
  "owner-confirmed": "Owner-confirmed (not independently checked)",
  "document-checked": "Independently verified"
};
function keyFromName(name) {
  const words = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return (words[0][0].toLowerCase() + words[0].slice(1).toLowerCase() + words.slice(1).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join("")).replace(/^[^a-z]/, "").slice(0, 40);
}
function FactsPage() {
  const role = useAdminRole();
  const [facts, setFacts] = useState(null);
  const [values, setValues] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    name: "",
    key: "",
    value: "",
    note: "",
    verificationType: "owner-confirmed",
    publicVisibility: true,
    proofAssetId: null
  });
  async function load() {
    try {
      const r = await request("/facts");
      setFacts(r.items);
      setValues(Object.fromEntries(r.items.map((f) => [f.key, f.value])));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load business facts.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function update(key, body) {
    setSavingKey(key);
    setMessage("");
    setError("");
    try {
      const r = await request(`/facts/${key}`, { method: "PATCH", body: JSON.stringify(body) });
      setFacts((current) => (current == null ? void 0 : current.map((fact) => fact.key === key ? r.item : fact)) ?? current);
      setValues((current) => ({ ...current, [key]: r.item.value }));
      setMessage(body.verification === "verified" ? `${key} is now verified and public.` : `${r.item.label} saved.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save. Please try again.");
    } finally {
      setSavingKey("");
    }
  }
  function openCreate() {
    setCreateError("");
    setForm({ name: "", key: "", value: "", note: "", verificationType: "owner-confirmed", publicVisibility: true, proofAssetId: null });
    setModalOpen(true);
  }
  async function createFact(e) {
    e.preventDefault();
    setCreateError("");
    if (!form.name.trim() || !form.value.trim() || !form.key.trim()) {
      setCreateError("Fact name, key, and value are required.");
      return;
    }
    setCreating(true);
    try {
      const r = await request("/facts", {
        method: "POST",
        body: JSON.stringify({
          key: form.key,
          label: form.name.trim(),
          value: form.value.trim(),
          note: form.note.trim(),
          publicVisibility: form.publicVisibility,
          verificationType: form.verificationType,
          proofAssetId: form.proofAssetId
        })
      });
      setFacts((current) => [...current ?? [], r.item].sort((a, b) => a.key.localeCompare(b.key)));
      setValues((current) => ({ ...current, [r.item.key]: r.item.value }));
      setModalOpen(false);
      setMessage(`${r.item.label} was added and is pending verification.`);
    } catch (e2) {
      setCreateError(e2 instanceof ApiError ? e2.message : "Could not add the fact.");
    } finally {
      setCreating(false);
    }
  }
  async function deleteFact(fact) {
    if (!window.confirm(`Delete "${fact.label}"? This cannot be undone.`)) return;
    setSavingKey(fact.key);
    setError("");
    try {
      await request(`/facts/${fact.key}`, { method: "DELETE" });
      setFacts((current) => (current == null ? void 0 : current.filter((item) => item.key !== fact.key)) ?? current);
      setValues((current) => {
        const next = { ...current };
        delete next[fact.key];
        return next;
      });
      setMessage(`${fact.label} was deleted.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete the fact.");
    } finally {
      setSavingKey("");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsxs("header", { className: "admin-head facts-head", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { children: "Business facts" }),
        /* @__PURE__ */ jsx("p", { className: "hint", children: "A fact appears on the public website only when it is verified and publicly visible." })
      ] }),
      role === "owner" && /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "button", onClick: openCreate, children: "+ Add New Fact" })
    ] }),
    message && /* @__PURE__ */ jsx("p", { className: "admin-card hint", role: "status", children: message }),
    error && /* @__PURE__ */ jsx("div", { className: "admin-card", role: "alert", children: /* @__PURE__ */ jsx("p", { className: "err", children: error }) }),
    !facts && !error && /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Loading…" }),
    facts && /* @__PURE__ */ jsxs("section", { className: "admin-card table-card", children: [
      facts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty", children: [
        /* @__PURE__ */ jsx("strong", { children: "No business facts yet." }),
        /* @__PURE__ */ jsx("p", { children: "Add a fact to start building your verified public information." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxs("table", { className: "enq-table", children: [
        /* @__PURE__ */ jsx("caption", { className: "sr-only", children: "Business facts and verification status" }),
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Fact" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Value" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Public status" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Notes" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Actions" }) })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: facts.map((f) => {
          const visible = f.publicVisibility !== false;
          return /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { "data-label": "Fact", children: [
              /* @__PURE__ */ jsx("strong", { children: f.label }),
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsxs("span", { className: "hint", children: [
                f.key,
                f.custom ? " · Custom" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("td", { "data-label": "Value", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: `v-${f.key}`, className: "sr-only", children: [
                "Value for ",
                f.label
              ] }),
              /* @__PURE__ */ jsx("input", { id: `v-${f.key}`, value: values[f.key] ?? "", maxLength: 300, onChange: (e) => setValues((v) => ({ ...v, [f.key]: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxs("td", { "data-label": "Public status", children: [
              !visible ? /* @__PURE__ */ jsx("span", { className: "badge badge-rejected", children: "Hidden" }) : f.verification === "verified" ? /* @__PURE__ */ jsx("span", { className: "badge badge-admitted", children: "Verified and shown" }) : /* @__PURE__ */ jsx("span", { className: "badge badge-follow-up", children: "Pending, hidden" }),
              f.verification === "verified" && f.verificationSource && SOURCE_LABEL[f.verificationSource] && /* @__PURE__ */ jsxs("p", { className: "hint", children: [
                "Source: ",
                SOURCE_LABEL[f.verificationSource]
              ] }),
              f.verifiedAt && /* @__PURE__ */ jsxs("p", { className: "hint", children: [
                "Verified ",
                formatDate(f.verifiedAt)
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { "data-label": "Notes", className: "msg", children: f.note || "No private notes." }),
            /* @__PURE__ */ jsx("td", { "data-label": "Actions", children: /* @__PURE__ */ jsxs("div", { className: "row facts-actions", children: [
              /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: savingKey === f.key || (values[f.key] ?? "") === f.value, onClick: () => update(f.key, { value: values[f.key] ?? "" }), children: savingKey === f.key ? "Saving…" : "Save value" }),
              role === "owner" && f.verification === "pending" && /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "button", disabled: savingKey === f.key || !f.value, onClick: () => update(f.key, {
                verification: "verified",
                verificationSource: f.verificationType === "independently-verified" ? "document-checked" : "owner-confirmed"
              }), children: "Mark verified" }),
              role === "owner" && f.verification === "verified" && /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: savingKey === f.key || !visible, onClick: () => update(f.key, { publicVisibility: false }), children: "Hide" }),
              role === "owner" && !visible && /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: savingKey === f.key || f.verification !== "verified", onClick: () => update(f.key, { publicVisibility: true }), children: "Show" }),
              role === "owner" && f.custom && /* @__PURE__ */ jsx("button", { className: "btn btn-danger", type: "button", disabled: savingKey === f.key, onClick: () => deleteFact(f), children: "Delete" })
            ] }) })
          ] }, f.key);
        }) })
      ] }) }),
      role === "staff" && /* @__PURE__ */ jsx("p", { className: "hint", children: "Only the owner can verify, change visibility, add, or delete custom facts." })
    ] }),
    modalOpen && /* @__PURE__ */ jsx("div", { className: "fact-modal-backdrop", role: "presentation", onMouseDown: (e) => {
      if (e.target === e.currentTarget) setModalOpen(false);
    }, children: /* @__PURE__ */ jsxs("section", { className: "fact-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "add-fact-title", children: [
      /* @__PURE__ */ jsxs("header", { className: "fact-modal-head", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "hint", children: "Business Facts" }),
          /* @__PURE__ */ jsx("h2", { id: "add-fact-title", children: "Add New Fact" })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "modal-close", type: "button", "aria-label": "Close", onClick: () => setModalOpen(false), children: "×" })
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "fact-form", onSubmit: createFact, children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Fact Name",
          /* @__PURE__ */ jsx("input", { value: form.name, maxLength: 80, required: true, onChange: (e) => {
            const name = e.target.value;
            setForm((current) => ({ ...current, name, key: keyFromName(name) }));
          }, placeholder: "e.g. GST Number" })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Fact Key",
          /* @__PURE__ */ jsx("input", { value: form.key, maxLength: 40, pattern: "[a-z][a-zA-Z0-9]{1,39}", required: true, onChange: (e) => setForm((current) => ({ ...current, key: e.target.value })) }),
          /* @__PURE__ */ jsx("span", { className: "hint", children: "Automatically generated; letters and numbers only." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "field-wide", children: [
          "Fact Value",
          /* @__PURE__ */ jsx("input", { value: form.value, maxLength: 300, required: true, onChange: (e) => setForm((current) => ({ ...current, value: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "field-wide", children: [
          "Description / Notes",
          /* @__PURE__ */ jsx("textarea", { value: form.note, maxLength: 500, rows: 3, onChange: (e) => setForm((current) => ({ ...current, note: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Verification Type",
          /* @__PURE__ */ jsxs("select", { value: form.verificationType, onChange: (e) => setForm((current) => ({ ...current, verificationType: e.target.value })), children: [
            /* @__PURE__ */ jsx("option", { value: "owner-confirmed", children: "Owner Confirmed" }),
            /* @__PURE__ */ jsx("option", { value: "independently-verified", children: "Independently Verified" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "visibility-toggle", children: [
          /* @__PURE__ */ jsx("span", { children: "Public Visibility" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.publicVisibility, onChange: (e) => setForm((current) => ({ ...current, publicVisibility: e.target.checked })) }),
          /* @__PURE__ */ jsx("span", { children: form.publicVisibility ? "Visible when verified" : "Hidden from public" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "field-wide", children: /* @__PURE__ */ jsx(ImageUploader, { purpose: "fact-proof", label: "Supporting Proof (optional)", value: form.proofAssetId, nullable: true, onChange: (proofAssetId) => setForm((current) => ({ ...current, proofAssetId })), hint: "Private proof only. It will not be exposed on the public website." }) }),
        createError && /* @__PURE__ */ jsx("p", { className: "err field-wide", role: "alert", children: createError }),
        /* @__PURE__ */ jsxs("div", { className: "fact-modal-actions field-wide", children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => setModalOpen(false), disabled: creating, children: "Cancel" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", disabled: creating, children: creating ? "Adding…" : "Add Fact" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  FactsPage as default
};
