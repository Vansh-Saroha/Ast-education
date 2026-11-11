import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, Navigate, NavLink, Outlet } from "react-router-dom";
import { a as adminApi } from "./api-BUgD-bVR.js";
/* empty css                    */
function AdminShell() {
  const [admin, setAdmin] = useState(void 0);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    adminApi.me().then((r) => setAdmin(r.admin)).catch(() => setAdmin(null));
  }, []);
  async function signOut() {
    setSigningOut(true);
    try {
      await adminApi.logout();
    } finally {
      navigate("/owner/login", { replace: true });
    }
  }
  if (admin === void 0) {
    return /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Checking your session…" });
  }
  if (admin === null) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/owner/login", replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "admin", children: [
    /* @__PURE__ */ jsxs("aside", { className: "admin-side", "aria-label": "Admin navigation", children: [
      /* @__PURE__ */ jsxs("div", { className: "admin-brand", children: [
        /* @__PURE__ */ jsx("img", { src: "/assets/logo.webp", alt: "AST Education", width: 44, height: 44 }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "AST Education" }),
          /* @__PURE__ */ jsx("span", { children: "Admin" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("nav", { children: [
        /* @__PURE__ */ jsx(NavLink, { to: "/admin", end: true, children: "Enquiries" }),
        /* @__PURE__ */ jsx(NavLink, { to: "/admin/content/courses", children: "Courses" }),
        /* @__PURE__ */ jsx(NavLink, { to: "/admin/content/leadership", children: "Leadership" }),
        /* @__PURE__ */ jsx(NavLink, { to: "/admin/content/gallery", children: "Gallery" }),
        admin.role === "owner" && /* @__PURE__ */ jsx(NavLink, { to: "/admin/testimonials", children: "Manage Testimonials" }),
        /* @__PURE__ */ jsx(NavLink, { to: "/admin/facts", children: "Business facts" }),
        /* @__PURE__ */ jsx(NavLink, { to: "/admin/videos", children: "Videos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "admin-user", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: admin.name }),
          /* @__PURE__ */ jsx("br", {}),
          admin.role === "owner" ? "Owner" : "Staff"
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: signOut, disabled: signingOut, children: signingOut ? "Signing out…" : "Sign out" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "admin-main", id: "admin-main", children: /* @__PURE__ */ jsx(Outlet, {}) })
  ] });
}
export {
  AdminShell as default
};
