import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { C as COURSE_OPTIONS } from "../entry-server.js";
import { a as adminApi, S as STATUSES, b as STATUS_LABELS, f as formatDate } from "./api-BUgD-bVR.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "html-react-parser";
import "gsap";
import "gsap/ScrollTrigger";
import "react-hook-form";
import "@hookform/resolvers/zod";
import "zod";
function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [list, setList] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const current = (key) => params.get(key) ?? "";
  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }, [params, setParams]);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (search.trim() !== (params.get("q") ?? "")) setParam("q", search.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);
  const query = params.toString();
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [l, s] = await Promise.all([adminApi.list(new URLSearchParams(query)), adminApi.stats()]);
      setList(l);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [query]);
  useEffect(() => {
    void load();
  }, [load]);
  const clearFilters = () => {
    setSearch("");
    setParams(new URLSearchParams());
  };
  return /* @__PURE__ */ jsxs("div", { className: "admin-page", children: [
    /* @__PURE__ */ jsx("header", { className: "admin-head", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Admission enquiries" }),
      /* @__PURE__ */ jsx("p", { className: "hint", children: "Newest first. Select a student to view details and update status." })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "stat-grid", "aria-label": "Enquiry totals by status", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", className: `stat ${!current("status") ? "is-active" : ""}`, onClick: () => setParam("status", ""), children: [
        /* @__PURE__ */ jsx("span", { children: "All" }),
        /* @__PURE__ */ jsx("strong", { children: (stats == null ? void 0 : stats.total) ?? "–" })
      ] }),
      STATUSES.map((s) => /* @__PURE__ */ jsxs("button", { type: "button", className: `stat ${current("status") === s ? "is-active" : ""}`, onClick: () => setParam("status", s), children: [
        /* @__PURE__ */ jsx("span", { children: STATUS_LABELS[s] }),
        /* @__PURE__ */ jsx("strong", { children: (stats == null ? void 0 : stats.counts[s]) ?? "–" })
      ] }, s))
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "admin-card filters", "aria-label": "Filter enquiries", children: [
      /* @__PURE__ */ jsxs("div", { className: "field-wide", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "q", children: "Search name, mobile, email or course" }),
        /* @__PURE__ */ jsx("input", { id: "q", type: "search", value: search, maxLength: 80, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "course", children: "Course" }),
        /* @__PURE__ */ jsxs("select", { id: "course", value: current("course"), onChange: (e) => setParam("course", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All courses" }),
          COURSE_OPTIONS.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "status", children: "Status" }),
        /* @__PURE__ */ jsxs("select", { id: "status", value: current("status"), onChange: (e) => setParam("status", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
          STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABELS[s] }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "from", children: "From" }),
        /* @__PURE__ */ jsx("input", { id: "from", type: "date", value: current("from"), onChange: (e) => setParam("from", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "to", children: "To" }),
        /* @__PURE__ */ jsx("input", { id: "to", type: "date", value: current("to"), onChange: (e) => setParam("to", e.target.value) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "filters-actions", children: /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: clearFilters, children: "Clear filters" }) })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "admin-card", role: "alert", children: [
      /* @__PURE__ */ jsx("p", { className: "err", children: error }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => void load(), children: "Try again" })
    ] }),
    !error && loading && !list && /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Loading enquiries…" }),
    list && /* @__PURE__ */ jsxs("section", { className: "admin-card table-card", "aria-live": "polite", "aria-busy": loading, children: [
      /* @__PURE__ */ jsxs("p", { className: "hint", children: [
        list.total,
        " ",
        list.total === 1 ? "enquiry" : "enquiries",
        " found"
      ] }),
      list.items.length === 0 ? /* @__PURE__ */ jsx("div", { className: "empty", children: "No enquiries match these filters. Try a different search or clear the filters." }) : /* @__PURE__ */ jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxs("table", { className: "enq-table", children: [
        /* @__PURE__ */ jsx("caption", { className: "sr-only", children: "Admission enquiries" }),
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Student" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Mobile" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Course" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Message" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Submitted" }),
          /* @__PURE__ */ jsx("th", { scope: "col", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: list.items.map((e) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { "data-label": "Student", children: /* @__PURE__ */ jsx(Link, { to: `/admin/enquiries/${e.id}`, children: e.studentName }) }),
          /* @__PURE__ */ jsx("td", { "data-label": "Mobile", children: e.mobile }),
          /* @__PURE__ */ jsx("td", { "data-label": "Course", children: e.interestedCourse }),
          /* @__PURE__ */ jsx("td", { "data-label": "Message", className: "msg", children: e.message || /* @__PURE__ */ jsx("span", { className: "ph", children: "No message" }) }),
          /* @__PURE__ */ jsx("td", { "data-label": "Submitted", children: formatDate(e.createdAt) }),
          /* @__PURE__ */ jsx("td", { "data-label": "Status", children: /* @__PURE__ */ jsx("span", { className: `badge badge-${e.status}`, children: STATUS_LABELS[e.status] }) })
        ] }, e.id)) })
      ] }) }),
      list.pages > 1 && /* @__PURE__ */ jsxs("nav", { className: "pager", "aria-label": "Pagination", children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: list.page <= 1, onClick: () => setParam("page", String(list.page - 1)), children: "Previous" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Page ",
          list.page,
          " of ",
          list.pages
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: list.page >= list.pages, onClick: () => setParam("page", String(list.page + 1)), children: "Next" })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as default
};
