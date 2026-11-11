import { useState, useEffect, useRef } from "react";
import { a as adminApi } from "./api-BUgD-bVR.js";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
function useAdminRole() {
  const [role, setRole] = useState(void 0);
  useEffect(() => {
    adminApi.me().then((r) => setRole(r.admin.role)).catch(() => setRole(void 0));
  }, []);
  return role;
}
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
function percentOf(loaded, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(loaded / total * 100)));
}
function reduce(state, event) {
  switch (event.type) {
    case "reset":
      return { phase: "idle" };
    case "start":
      return { phase: "uploading", percent: 0 };
    case "progress":
      return state.phase === "uploading" ? { phase: "uploading", percent: percentOf(event.loaded, event.total) } : state;
    case "sent":
      return state.phase === "uploading" ? { phase: "processing" } : state;
    case "done":
      return state.phase === "uploading" || state.phase === "processing" ? { phase: "success", assetId: event.assetId, name: event.name } : state;
    case "fail":
      return { phase: "error", message: event.message };
  }
}
function validateFile(file) {
  if (file.size === 0) return "The file is empty. Choose another image.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file is larger than 6 MB. Choose a smaller image.";
  return null;
}
function messageForStatus(status) {
  switch (status) {
    case 401:
      return "Your session has ended. Sign in again to upload.";
    case 403:
      return "You do not have permission to upload images.";
    case 413:
      return "The file is too large. The maximum is 6 MB.";
    case 415:
      return "Upload a JPEG, PNG or WebP image.";
    case 422:
      return "This image could not be used. Try a different file.";
    case 429:
      return "Too many uploads. Wait a few minutes and try again.";
    default:
      return "The upload failed. Please try again.";
  }
}
function ImageUploader({ purpose, label, value, nullable, disabled, hint, onChange }) {
  const [state, setState] = useState({ phase: "idle" });
  const input = useRef(null);
  const busy = state.phase === "uploading" || state.phase === "processing";
  const apply = (event) => setState((s) => reduce(s, event));
  function send(file) {
    const problem = validateFile(file);
    if (problem) return apply({ type: "fail", message: problem });
    apply({ type: "start" });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/media?purpose=${purpose}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("X-Admin-Request", "1");
    xhr.setRequestHeader("X-Filename", encodeURIComponent(file.name));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) apply({ type: "progress", loaded: e.loaded, total: e.total });
    };
    xhr.upload.onload = () => apply({ type: "sent" });
    xhr.onerror = () => apply({ type: "fail", message: "The connection was lost. Check your network and try again." });
    xhr.onload = () => {
      var _a;
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status === 201 && (body == null ? void 0 : body.asset)) {
        apply({ type: "done", assetId: body.asset.id, name: body.asset.displayName });
        onChange(body.asset.id);
      } else {
        apply({ type: "fail", message: ((_a = body == null ? void 0 : body.error) == null ? void 0 : _a.message) ?? messageForStatus(xhr.status) });
      }
    };
    xhr.send(file);
  }
  const onPick = (file) => {
    if (file) send(file);
    if (input.current) input.current.value = "";
  };
  return /* @__PURE__ */ jsxs("fieldset", { className: "uploader", disabled: disabled || busy, children: [
    /* @__PURE__ */ jsx("legend", { children: label }),
    value ? /* @__PURE__ */ jsx("img", { className: "upload-preview", src: `/api/admin/media/${value}/preview`, alt: `Current ${label.toLowerCase()} preview` }) : /* @__PURE__ */ jsx("p", { className: "hint", children: "No image selected yet." }),
    hint && /* @__PURE__ */ jsx("p", { className: "hint", children: hint }),
    /* @__PURE__ */ jsxs("label", { className: "upload-pick", children: [
      /* @__PURE__ */ jsx("span", { children: value ? "Replace image" : "Choose image" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: input,
          type: "file",
          accept: ACCEPTED_IMAGE_TYPES.join(","),
          onChange: (e) => {
            var _a;
            return onPick((_a = e.target.files) == null ? void 0 : _a[0]);
          }
        }
      )
    ] }),
    state.phase === "uploading" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("progress", { max: 100, value: state.percent, "aria-label": `Upload progress for ${label}` }),
      /* @__PURE__ */ jsxs("p", { role: "status", children: [
        "Uploading ",
        state.percent,
        "%"
      ] })
    ] }),
    state.phase === "processing" && /* @__PURE__ */ jsx("p", { role: "status", children: "Processing the image on the server. This can take a moment." }),
    state.phase === "success" && /* @__PURE__ */ jsxs("p", { className: "ok", role: "status", children: [
      state.name,
      " is ready. Save the item to use it."
    ] }),
    state.phase === "error" && /* @__PURE__ */ jsx("p", { className: "err", role: "alert", children: state.message }),
    nullable && value && /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => {
      setState({ phase: "idle" });
      onChange(null);
    }, children: "Remove image" })
  ] });
}
export {
  ImageUploader as I,
  useAdminRole as u
};
