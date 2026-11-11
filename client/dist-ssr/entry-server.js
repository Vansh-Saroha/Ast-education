import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { createContext, useContext, useState, useEffect, lazy, Suspense, useRef, Fragment as Fragment$1, useMemo } from "react";
import { Routes, Route, Navigate, useLocation, Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import parse, { Element as Element$1, domToReact } from "html-react-parser";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const snapshotDate = "2026-11-03";
const phone = { "label": "Main contact number", "value": "+91 89794 87215", "source": "owner-confirmed" };
const whatsapp = { "label": "WhatsApp number", "value": "+91 96907 66514", "source": "owner-confirmed" };
const address = { "label": "Address", "value": "244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667", "source": "owner-confirmed" };
const established = { "label": "Business established", "value": "5 December 2023", "source": "owner-confirmed" };
const udyamNumber = { "label": "Udyam registration number", "value": "UDYAM-UK-06-0037585", "source": "owner-confirmed" };
const parentOrganisation = { "label": "Parent organisation", "value": "SUMAN EDUCATIONAL TRUST", "source": "owner-confirmed" };
const snapshot = {
  snapshotDate,
  phone,
  whatsapp,
  address,
  established,
  udyamNumber,
  parentOrganisation
};
async function publicGet(path) {
  const res = await fetch(`/api/public${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return await res.json();
}
function loadingWith(placeholder) {
  return { availability: "loading", items: placeholder };
}
function settle(result, fallback) {
  return result.ok ? { availability: "live", items: result.items } : { availability: "fallback", items: fallback };
}
function resolveFacts(result, snapshotFacts2, snapshotDate2) {
  if (!result.ok) return { availability: "fallback", facts: snapshotFacts2, snapshotDate: snapshotDate2 };
  return {
    availability: "live",
    facts: Object.fromEntries(result.items.map((i) => [i.key, i.value])),
    snapshotDate: snapshotDate2,
    items: result.items
  };
}
const SNAP = snapshot;
const snapshotFacts = Object.fromEntries(
  Object.entries(SNAP).filter(([k]) => k !== "snapshotDate").map(([k, v]) => [k, v.value])
);
const INITIAL = { availability: "loading", facts: snapshotFacts, snapshotDate: SNAP.snapshotDate };
const FactsContext = createContext(INITIAL);
function FactsProvider({ children }) {
  const [state, setState] = useState(INITIAL);
  useEffect(() => {
    publicGet("/facts").then((r) => ({ ok: true, items: r.items })).catch(() => ({ ok: false })).then((result) => setState(resolveFacts(result, snapshotFacts, SNAP.snapshotDate)));
  }, []);
  return /* @__PURE__ */ jsx(FactsContext.Provider, { value: state, children });
}
const useFacts = () => useContext(FactsContext);
const routes = [
  {
    path: "/",
    title: "AST Education, Roorkee | Coaching, Computer and Technical Education",
    description: "AST Education, Roorkee: school coaching, computer courses, technical skills and personality development. Building knowledge, empowering futures."
  },
  {
    path: "/courses",
    title: "Courses & Programs | AST Education, Roorkee",
    description: "School coaching, higher education coaching, computer courses such as DCA, ADCA, CCC, Tally and MS Office, coding and personality development. Contact us for fees and details."
  },
  {
    path: "/leadership",
    title: "Our Leadership | AST Education, Roorkee",
    description: "The Director and the Education Manager of AST Education, Roorkee."
  },
  {
    path: "/certifications",
    title: "Certifications & Registrations | AST Education, Roorkee",
    description: "Udyam registration of AST Education, and the ISO 9001:2015 certificate held by SUMAN EDUCATIONAL TRUST."
  },
  {
    path: "/about",
    title: "About Us | AST Education, Roorkee",
    description: "About AST Education, a micro enterprise in Roorkee established on 5 December 2023. We provide coaching and academic support, not degree issuance."
  },
  {
    path: "/gallery",
    title: "Gallery | AST Education, Roorkee",
    description: "Photographs of AST Education, Roorkee, published after permission is confirmed."
  },
  {
    path: "/testimonials",
    title: "Student Testimonials | AST Education, Roorkee",
    description: "Student experiences at AST Education, Roorkee, published after verified consent."
  },
  {
    path: "/contact",
    title: "Contact Us | AST Education, Roorkee",
    description: "Call, WhatsApp or visit AST Education on DAV Inter College Road, Roorkee, and get directions."
  },
  {
    path: "/enquiry",
    title: "Admission Enquiry | AST Education, Roorkee",
    description: "Send an admission enquiry to AST Education, Roorkee."
  },
  {
    path: "/privacy",
    title: "Privacy Policy | AST Education, Roorkee",
    description: "How AST Education handles admission enquiries and personal information."
  },
  {
    path: "/terms",
    title: "Terms of Use | AST Education, Roorkee",
    description: "Terms of use for the AST Education, Roorkee website."
  },
  {
    path: "/videos",
    title: "Videos | AST Education, Roorkee",
    description: "Centre tours, course demonstrations, events and student experiences from AST Education, Roorkee."
  }
];
function applyHead(pathname) {
  var _a;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const route = routes.find((r) => r.path === path) ?? {
    title: "Page not found | AST Education, Roorkee",
    description: "The page you were looking for does not exist."
  };
  document.title = route.title;
  (_a = document.querySelector('meta[name="description"]')) == null ? void 0 : _a.setAttribute("content", route.description);
}
const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/asteducation/", icon: "/assets/social/instagram.svg" },
  { label: "Facebook", href: "https://www.facebook.com/share/1HffKZQ1Bc/", icon: "/assets/social/facebook.svg" },
  { label: "YouTube", href: "https://youtube.com/@asteducation1411", icon: "/assets/social/youtube.svg" }
];
const ApprovedPage$2 = lazy(() => Promise.resolve().then(() => ApprovedPage$1));
const CertificationsPage$2 = lazy(() => Promise.resolve().then(() => CertificationsPage$1));
const ContactPage$2 = lazy(() => Promise.resolve().then(() => ContactPage$1));
const CoursesPage$2 = lazy(() => Promise.resolve().then(() => CoursesPage$1));
const EnquiryPage$2 = lazy(() => Promise.resolve().then(() => EnquiryPage$1));
const GalleryPage$2 = lazy(() => Promise.resolve().then(() => GalleryPage$1));
const LeadershipPage$2 = lazy(() => Promise.resolve().then(() => LeadershipPage$1));
const NotFoundPage$1 = lazy(() => Promise.resolve().then(() => LegalPages).then(({ NotFoundPage: NotFoundPage2 }) => ({ default: NotFoundPage2 })));
const PrivacyPage$1 = lazy(() => Promise.resolve().then(() => LegalPages).then(({ PrivacyPage: PrivacyPage2 }) => ({ default: PrivacyPage2 })));
const TermsPage$1 = lazy(() => Promise.resolve().then(() => LegalPages).then(({ TermsPage: TermsPage2 }) => ({ default: TermsPage2 })));
const TestimonialsPage$2 = lazy(() => Promise.resolve().then(() => TestimonialsPage$1));
const VideosPage$2 = lazy(() => Promise.resolve().then(() => VideosPage$1));
const CLIENT_PAGES = {
  ApprovedPage: ApprovedPage$2,
  CertificationsPage: CertificationsPage$2,
  ContactPage: ContactPage$2,
  CoursesPage: CoursesPage$2,
  EnquiryPage: EnquiryPage$2,
  GalleryPage: GalleryPage$2,
  LeadershipPage: LeadershipPage$2,
  NotFoundPage: NotFoundPage$1,
  PrivacyPage: PrivacyPage$1,
  TermsPage: TermsPage$1,
  TestimonialsPage: TestimonialsPage$2,
  VideosPage: VideosPage$2
};
const AdminShell = lazy(() => import("./assets/AdminShell-DzVzKvF_.js"));
const ContentPage = lazy(() => import("./assets/ContentPage-OCsbmf2B.js"));
const DashboardPage = lazy(() => import("./assets/DashboardPage-BjIzW2Kf.js"));
const EnquiryDetailPage = lazy(() => import("./assets/EnquiryDetailPage-BTn2Ph5M.js"));
const FactsPage = lazy(() => import("./assets/FactsPage-Cl9t9HI5.js"));
const LoginPage = lazy(() => import("./assets/LoginPage-jTfljuXX.js"));
const AdminVideosPage = lazy(() => import("./assets/VideosPage-CMbJablK.js"));
const TestimonialsManagePage = lazy(() => import("./assets/TestimonialsManagePage-D1EJqicH.js"));
const NAV = [
  ["/", "Home"],
  ["/courses", "Courses"],
  ["/leadership", "Leadership"],
  ["/certifications", "Certifications"],
  ["/about", "About"],
  ["/gallery", "Gallery"],
  ["/videos", "Videos"],
  ["/testimonials", "Testimonials"],
  ["/contact", "Contact"]
];
const FOOTER_LINKS = [
  ["/", "Home"],
  ["/about", "About"],
  ["/courses", "Courses"],
  ["/enquiry", "Admission"],
  ["/leadership", "Leadership"],
  ["/contact", "Contact"]
];
const FOOTER_COURSES = [
  ["School Education", "school-education"],
  ["Higher Education Coaching", "higher-education-coaching"],
  ["Computer Education", "computer-education"],
  ["Programming & Technical", "programming-technical"],
  ["Personality Development", "personality-development"]
];
function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}
function PublicLayout() {
  const location = useLocation();
  const { facts, availability, snapshotDate: snapshotDate2 } = useFacts();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    applyHead(location.pathname);
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let active = null;
    const clear = (el) => {
      el == null ? void 0 : el.style.removeProperty("--clay-tilt-x");
      el == null ? void 0 : el.style.removeProperty("--clay-tilt-y");
    };
    const onMove = (event) => {
      const card = event.target instanceof Element ? event.target.closest(".card") : null;
      if (card !== active) {
        clear(active);
        active = card;
      }
      if (!card) return;
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--clay-tilt-x", `${(-py * 6).toFixed(2)}deg`);
      card.style.setProperty("--clay-tilt-y", `${(px * 8).toFixed(2)}deg`);
    };
    const onLeave = () => {
      clear(active);
      active = null;
    };
    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      clear(active);
    };
  }, []);
  const digits = (facts.whatsapp ?? "").replace(/\D/g, "");
  return /* @__PURE__ */ jsxs("div", { className: "site-shell", children: [
    /* @__PURE__ */ jsxs("div", { className: "clay-decor", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("span", { className: "clay-aurora" }),
      /* @__PURE__ */ jsx("span", { className: "clay-orb clay-orb--sky" }),
      /* @__PURE__ */ jsx("span", { className: "clay-orb clay-orb--violet" }),
      /* @__PURE__ */ jsx("span", { className: "clay-orb clay-orb--teal" }),
      /* @__PURE__ */ jsx("img", { className: "clay-decor__cap", src: "/assets/decor/graduation-cap.svg", alt: "", width: 170, height: 170 }),
      /* @__PURE__ */ jsx("img", { className: "clay-decor__book", src: "/assets/decor/books.svg", alt: "", width: 190, height: 138 })
    ] }),
    /* @__PURE__ */ jsx("a", { className: "skip", href: "#main", children: "Skip to content" }),
    /* @__PURE__ */ jsx("header", { className: `site-header${open ? " open" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "wrap bar", children: [
      /* @__PURE__ */ jsx(Link, { className: "brand", to: "/", "aria-label": "AST Education home", children: /* @__PURE__ */ jsx("img", { src: "/assets/logo.webp", alt: "AST Education logo", width: 58, height: 58 }) }),
      /* @__PURE__ */ jsxs("button", { className: "menu-btn", type: "button", "aria-expanded": open, "aria-controls": "nav", "aria-label": open ? "Close navigation menu" : "Open navigation menu", onClick: () => setOpen((o) => !o), children: [
        /* @__PURE__ */ jsx("span", { className: "menu-label", children: open ? "Close" : "Menu" }),
        /* @__PURE__ */ jsxs("span", { className: "menu-icon", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {})
        ] })
      ] }),
      /* @__PURE__ */ jsx("nav", { id: "nav", "aria-label": "Main", children: /* @__PURE__ */ jsxs("ul", { children: [
        NAV.map(([to, label]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to, end: to === "/", children: label }) }, to)),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { className: "btn btn-o", to: "/enquiry", children: "Admission Enquiry" }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("main", { id: "main", className: "route-view", children: /* @__PURE__ */ jsx(Outlet, {}) }, location.pathname),
    /* @__PURE__ */ jsx("footer", { className: "site-footer", children: /* @__PURE__ */ jsxs("div", { className: "site-footer__panel", children: [
      /* @__PURE__ */ jsxs("div", { className: "fg", children: [
        /* @__PURE__ */ jsxs("div", { className: "fcol", children: [
          /* @__PURE__ */ jsx("img", { className: "fcol__logo", src: "/assets/logo.webp", alt: "", width: 64, height: 64 }),
          /* @__PURE__ */ jsx("p", { className: "fcol__name", children: "AST Education" }),
          /* @__PURE__ */ jsx("p", { className: "fcol__legal", children: "ALL STUDIES & TECHNICAL EDUCATION" }),
          /* @__PURE__ */ jsx("p", { children: "School coaching, computer courses, technical skill development and personality development, all from one institute." }),
          /* @__PURE__ */ jsx("p", { className: "fcol__tagline", lang: "hi", children: "विश्वास आपका, ज्ञान हमारा" }),
          facts.parentOrganisation && /* @__PURE__ */ jsxs("p", { className: "fcol__small", children: [
            "Parent organisation: ",
            facts.parentOrganisation
          ] }),
          availability === "fallback" && /* @__PURE__ */ jsxs("p", { className: "hint fcol__small", children: [
            "Live details unavailable. Showing approved details from ",
            snapshotDate2,
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "fcol", "aria-label": "Footer quick links", children: [
          /* @__PURE__ */ jsx("h2", { className: "fcol__title", children: "Quick links" }),
          /* @__PURE__ */ jsx("ul", { children: FOOTER_LINKS.map(([to, label]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to, children: label }) }, to)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "fcol", children: [
          /* @__PURE__ */ jsx("h2", { className: "fcol__title", children: "Our courses" }),
          /* @__PURE__ */ jsx("ul", { children: FOOTER_COURSES.map(([course, sectionId]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: `/courses#${sectionId}`, children: course }) }, sectionId)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "fcol", children: [
          /* @__PURE__ */ jsx("h2", { className: "fcol__title", children: "Contact" }),
          facts.address && /* @__PURE__ */ jsx("p", { className: "fcol__address", children: facts.address }),
          /* @__PURE__ */ jsxs("ul", { children: [
            facts.phone && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `tel:${facts.phone.replace(/\s/g, "")}`, children: facts.phone }) }),
            digits && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: `https://wa.me/${digits}`, target: "_blank", rel: "noopener noreferrer", children: [
              "WhatsApp: ",
              facts.whatsapp
            ] }) }),
            facts.hours && /* @__PURE__ */ jsx("li", { className: "fcol__small", children: facts.hours })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fsocial", role: "group", "aria-label": "Follow AST Education", children: [
        /* @__PURE__ */ jsx("p", { className: "fsocial__title", children: "Follow AST Education" }),
        SOCIAL.map((item) => /* @__PURE__ */ jsx("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", "aria-label": `${item.label} (opens in a new tab)`, title: item.label, children: /* @__PURE__ */ jsx("img", { src: item.icon, alt: "", width: 24, height: 24 }) }, item.label)),
        digits && /* @__PURE__ */ jsx("a", { href: `https://wa.me/${digits}`, target: "_blank", rel: "noopener noreferrer", "aria-label": "WhatsApp (opens in a new tab)", title: "WhatsApp", children: /* @__PURE__ */ jsx("img", { src: "/assets/social/whatsapp.svg", alt: "", width: 24, height: 24 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fbottom", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " AST Education. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "fbottom__links", children: [
          /* @__PURE__ */ jsx(Link, { to: "/privacy", children: "Privacy Policy" }),
          /* @__PURE__ */ jsx(Link, { to: "/terms", children: "Terms of Use" }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "to-top", onClick: scrollToTop, children: "Back to top" })
        ] })
      ] })
    ] }) })
  ] });
}
function App({ pageComponents = {} }) {
  const pages = { ...CLIENT_PAGES, ...pageComponents };
  const {
    ApprovedPage: ApprovedPage2,
    CertificationsPage: CertificationsPage2,
    ContactPage: ContactPage2,
    CoursesPage: CoursesPage2,
    EnquiryPage: EnquiryPage2,
    GalleryPage: GalleryPage2,
    LeadershipPage: LeadershipPage2,
    NotFoundPage: NotFoundPage2,
    PrivacyPage: PrivacyPage2,
    TermsPage: TermsPage2,
    TestimonialsPage: TestimonialsPage2,
    VideosPage: VideosPage2
  } = pages;
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("p", { className: "admin-status", role: "status", children: "Loading…" }), children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/owner/login", element: /* @__PURE__ */ jsx(LoginPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin/login", element: /* @__PURE__ */ jsx(Navigate, { to: "/owner/login", replace: true }) }),
    /* @__PURE__ */ jsxs(Route, { path: "/admin", element: /* @__PURE__ */ jsx(AdminShell, {}), children: [
      /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(DashboardPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "enquiries/:id", element: /* @__PURE__ */ jsx(EnquiryDetailPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "content/:type", element: /* @__PURE__ */ jsx(ContentPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "facts", element: /* @__PURE__ */ jsx(FactsPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "videos", element: /* @__PURE__ */ jsx(AdminVideosPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "testimonials", element: /* @__PURE__ */ jsx(TestimonialsManagePage, {}) })
    ] }),
    /* @__PURE__ */ jsxs(Route, { element: /* @__PURE__ */ jsx(PublicLayout, {}), children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(ApprovedPage2, { name: "home" }) }),
      /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsx(ApprovedPage2, { name: "about" }) }),
      /* @__PURE__ */ jsx(Route, { path: "/courses", element: /* @__PURE__ */ jsx(CoursesPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/leadership", element: /* @__PURE__ */ jsx(LeadershipPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/certifications", element: /* @__PURE__ */ jsx(CertificationsPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/gallery", element: /* @__PURE__ */ jsx(GalleryPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/videos", element: /* @__PURE__ */ jsx(VideosPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/testimonials", element: /* @__PURE__ */ jsx(TestimonialsPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/contact", element: /* @__PURE__ */ jsx(ContactPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/enquiry", element: /* @__PURE__ */ jsx(EnquiryPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/privacy", element: /* @__PURE__ */ jsx(PrivacyPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/terms", element: /* @__PURE__ */ jsx(TermsPage2, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFoundPage2, {}) })
    ] })
  ] }) });
}
const APPROVED_HTML = {
  "home": '<section aria-labelledby="h-home">\n<div class="wrap hero">\n<div>\n<p class="tag">Roorkee, Uttarakhand</p>\n<h1 id="h-home">Building Knowledge, Empowering Futures.</h1>\n<p class="lead">Discover quality education, technical skills and professional development with AST Education, Roorkee.</p>\n<p>School coaching, computer courses, technical skill development and personality development, all from one institute.</p>\n<div class="row"><a class="btn btn-o" href="/courses">Explore Our Courses</a><a class="btn btn-g" href="/enquiry">Enquire Now</a></div>\n<div class="row"><a class="btn btn-n" href="tel:+918979487215">Call +91 89794 87215</a><a class="btn btn-g" href="https://wa.me/919690766514?text=Hello%20AST%20Education%2C%20I%20would%20like%20to%20enquire%20about%20admission." target="_blank" rel="noopener noreferrer">WhatsApp us</a></div>\n</div>\n<img src="/assets/logo.webp" alt="AST Education logo: open book, rising sun and protective hands" width="340" height="340">\n</div>\n<div class="band"><div class="sec">\n<div class="trust">\n<div><strong>Established 2023</strong>Business established on 5 December 2023.</div>\n<div><strong>Udyam registered</strong>Micro enterprise registration dated 27 December 2023.</div>\n<div><strong>Five course areas</strong>School, higher education coaching, computer, technical and personality development.</div>\n<div><strong>Roorkee, Uttarakhand</strong>Located at PIN code 247667.</div>\n</div>\n</div></div>\n<div class="wrap sec">\n<h2>What we offer</h2>\n<div class="grid">\n<a class="card" href="/courses"><h3>School Education</h3><p>LKG to Class 12, academic coaching and subject-wise support.</p></a>\n<a class="card" href="/courses"><h3>Higher Education Coaching</h3><p>B.A., B.Com and B.Tech coaching and academic support. We do not award university degrees.</p></a>\n<a class="card" href="/courses"><h3>Computer Education</h3><p>Basic Computer, DCA, ADCA, CCC, Tally, MS Office and Advanced Excel.</p></a>\n<a class="card" href="/courses"><h3>Programming & Technical</h3><p>Coding classes, programming education and technical skill development.</p></a>\n<a class="card" href="/courses"><h3>Personality Development</h3><p>English speaking, communication skills, motivation and personality development.</p></a>\n</div>\n</div>\n<div class="band"><div class="wrap sec">\n<h2>Why choose AST Education</h2>\n<div class="grid">\n<div class="card"><h3>One institute, many goals</h3><p>Academic support, computer skills and personality development are offered together.</p></div>\n<div class="card"><h3>Clear information first</h3><p>Course fees and detailed information are shared when you enquire.</p></div>\n<div class="card"><h3>Registrations shown openly</h3><p>Our Udyam registration and the parent organisation’s ISO certificate are shown on the Certifications page.</p></div>\n</div>\n</div></div>\n<div class="wrap sec">\n<div class="grid">\n<a class="card" href="/leadership"><h3>Our Leadership</h3><p>Meet the Director and the Education Manager.</p></a>\n<a class="card" href="/certifications"><h3>Certifications & Registrations</h3><p>Udyam registration, and ISO 9001:2015 held by SUMAN EDUCATIONAL TRUST.</p></a>\n<a class="card" href="/testimonials"><h3>Student Testimonials</h3><p class="ph">Student experiences will be published after receiving verified consent.</p></a>\n</div>\n</div>\n</section>',
  "about": '<section class="wrap sec" aria-labelledby="h-about">\n<h1 id="h-about" tabindex="-1">About AST Education</h1>\n<p>AST Education is the working name of ALL STUDIES & TECHNICAL EDUCATION, a micro enterprise based in Roorkee, Uttarakhand.</p>\n<p>The business was established on 5 December 2023 and registered on Udyam on 27 December 2023. It is linked with SUMAN EDUCATIONAL TRUST as its parent organisation.</p>\n<h2>Educational services</h2>\n<p>School coaching, higher education coaching, computer education, technical skill development and personality development.</p>\n<h2>Coaching, academic support and degrees</h2>\n<p>AST Education provides coaching and academic support. It does not award university degrees. Degrees are awarded by the universities that conduct the relevant programmes.</p>\n<h2>Mission, vision and learning approach</h2>\n<p>Our approach is to combine clear academic support, practical skill development and personal guidance so students can learn confidently and progress responsibly.</p>\n<h2>Institute photographs</h2>\n<p>Photographs will be published after the institute confirms permission.</p>\n</section>'
};
const COURSES = [
  { name: "School Education", shortName: "School Education", description: "Academic coaching and subject-wise support.", offerings: ["LKG to Class 12", "Academic Coaching", "Subject-wise Support"], icon: "ABC", position: "course-1", sectionId: "school-education" },
  { name: "Higher Education Coaching", shortName: "Higher Education Coaching", description: "Coaching and academic support for higher education.", offerings: ["B.A.", "B.Com", "B.Tech", "Academic Support"], icon: "UG", position: "course-2", sectionId: "higher-education-coaching" },
  { name: "Computer Education", shortName: "Computer Education", description: "Practical computer skills for study and work.", offerings: ["Basic Computer", "DCA", "ADCA", "CCC", "Tally", "MS Office", "Advanced Excel"], icon: "⌘", position: "course-3", sectionId: "computer-education" },
  { name: "Programming & Technical", shortName: "Programming & Technical", description: "Coding and practical technical skill development.", offerings: ["Coding Classes", "Programming Education", "Technical Skill Development"], icon: "</>", position: "course-4", sectionId: "programming-technical" },
  { name: "Personality Development", shortName: "Personality Development", description: "Communication skills and personal confidence.", offerings: ["English Speaking", "Communication Skills", "Motivation", "Personality Development"], icon: "◎", position: "course-5", sectionId: "personality-development" }
];
function CourseBubble({ course, index }) {
  const bubbleRef = useRef(null);
  const [selected, setSelected] = useState(false);
  const moveMagnet = (event) => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bubble = bubbleRef.current;
    if (!bubble) return;
    const rect = bubble.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    bubble.style.setProperty("--magnet-x", `${x * 0.12}px`);
    bubble.style.setProperty("--magnet-y", `${y * 0.12}px`);
  };
  const resetMagnet = () => {
    var _a, _b;
    (_a = bubbleRef.current) == null ? void 0 : _a.style.setProperty("--magnet-x", "0px");
    (_b = bubbleRef.current) == null ? void 0 : _b.style.setProperty("--magnet-y", "0px");
  };
  return /* @__PURE__ */ jsxs(
    Link,
    {
      ref: bubbleRef,
      to: `/courses#${course.sectionId}`,
      className: `course-orbit-bubble ${course.position}`,
      "aria-label": `${course.name}: ${course.description}`,
      style: { "--course-delay": `${index * 55}ms` },
      onPointerMove: moveMagnet,
      onPointerLeave: resetMagnet,
      onClick: (event) => {
        if (window.matchMedia("(pointer: coarse)").matches && !selected) {
          event.preventDefault();
          setSelected(true);
          return;
        }
        if (window.matchMedia("(pointer: coarse)").matches && selected) {
          setSelected(false);
        }
      },
      children: [
        /* @__PURE__ */ jsxs("span", { className: "course-orbit-bubble__surface", children: [
          /* @__PURE__ */ jsx("span", { className: "course-orbit-bubble__icon", "aria-hidden": "true", children: course.icon }),
          /* @__PURE__ */ jsx("span", { className: "course-orbit-bubble__name", children: course.shortName })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: `course-description-card ${selected ? "is-selected" : ""}`, children: [
          /* @__PURE__ */ jsx("strong", { children: course.name }),
          /* @__PURE__ */ jsx("small", { children: course.description }),
          /* @__PURE__ */ jsx("span", { className: "course-description-card__offerings", children: course.offerings.join(" · ") })
        ] })
      ]
    }
  );
}
function ASTBubbleUniverse({ mobile = false }) {
  const universeRef = useRef(null);
  const mainRef = useRef(null);
  const [active, setActive] = useState(false);
  const moveParallax = (event) => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const universe = universeRef.current;
    const main = mainRef.current;
    if (!universe || !main) return;
    const rect = universe.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    universe.style.setProperty("--parallax-x", `${x * 10}px`);
    universe.style.setProperty("--parallax-y", `${y * 10}px`);
    main.style.setProperty("--light-x", `${48 + x * 18}%`);
    main.style.setProperty("--light-y", `${38 + y * 18}%`);
    setActive(true);
  };
  const leaveUniverse = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const universe = universeRef.current;
    const main = mainRef.current;
    universe == null ? void 0 : universe.style.setProperty("--parallax-x", "0px");
    universe == null ? void 0 : universe.style.setProperty("--parallax-y", "0px");
    main == null ? void 0 : main.style.setProperty("--light-x", "48%");
    main == null ? void 0 : main.style.setProperty("--light-y", "38%");
    setActive(false);
  };
  const toggleMobile = () => {
    setActive((value) => !value);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: universeRef,
      className: `ast-bubble-universe ${mobile ? "ast-bubble-universe--mobile" : ""} ${active ? "is-active" : ""}`,
      onPointerMove: moveParallax,
      onPointerLeave: leaveUniverse,
      role: "group",
      "aria-label": "AST Education course universe",
      children: [
        /* @__PURE__ */ jsx("div", { className: "bubble-particles", "aria-hidden": "true", children: Array.from({ length: 18 }, (_, index) => /* @__PURE__ */ jsx("span", {}, index)) }),
        /* @__PURE__ */ jsx("div", { className: "bubble-orbit-ring ring-outer", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("div", { className: "bubble-orbit-ring ring-inner", "aria-hidden": "true" }),
        COURSES.map((course, index) => /* @__PURE__ */ jsx(CourseBubble, { course, index }, course.name)),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: mainRef,
            className: "main-ast-bubble",
            role: "button",
            tabIndex: 0,
            "aria-expanded": active,
            "aria-label": "Explore AST Education courses",
            onClick: toggleMobile,
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActive((value) => !value);
              }
            },
            children: [
              /* @__PURE__ */ jsx("span", { className: "main-ast-bubble__shine", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxs("span", { className: "main-ast-bubble__mark", "aria-hidden": "true", children: [
                /* @__PURE__ */ jsx("span", { className: "mark-sun", children: "A" }),
                /* @__PURE__ */ jsx("span", { className: "mark-pages", children: "S" }),
                /* @__PURE__ */ jsx("span", { className: "mark-star", children: "T" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "main-ast-bubble__name", children: "AST" }),
              /* @__PURE__ */ jsx("span", { className: "main-ast-bubble__caption", children: "EDUCATION" })
            ]
          }
        )
      ]
    }
  );
}
const SNAPSHOT_PHONE = snapshot.phone.value;
const SNAPSHOT_PHONE_TEL = SNAPSHOT_PHONE.replace(/[^+\d]/g, "");
const options = {
  replace(node) {
    var _a;
    if (node instanceof Element$1 && node.name === "img" && node.attribs.src === "/assets/logo.webp") {
      return /* @__PURE__ */ jsx(ASTBubbleUniverse, {});
    }
    if (node instanceof Element$1 && node.name === "a" && ((_a = node.attribs.href) == null ? void 0 : _a.startsWith("/"))) {
      const { href, class: className, ...rest } = node.attribs;
      return /* @__PURE__ */ jsx(Link, { to: href, className, ...rest.id ? { id: rest.id } : {}, children: domToReact(node.children, options) });
    }
    return void 0;
  }
};
function ApprovedHtml({ html }) {
  const { facts } = useFacts();
  const phone2 = facts.phone ?? "";
  const phoneTel = phone2.replace(/[^+\d]/g, "");
  const whatsappValue = facts.whatsapp ?? "";
  const whatsapp2 = whatsappValue.replace(/\D/g, "");
  let currentHtml = html;
  if (!phoneTel) {
    currentHtml = currentHtml.replace(/<a\b[^>]*href="tel:[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "");
  } else {
    currentHtml = currentHtml.replace(/href="tel:[^"]*"/g, `href="tel:${phoneTel}"`);
  }
  if (!whatsapp2) {
    currentHtml = currentHtml.replace(/<a\b[^>]*href="https:\/\/wa\.me\/[^" ]*"[^>]*>[\s\S]*?<\/a>/gi, "");
  } else {
    currentHtml = currentHtml.replace(/https:\/\/wa\.me\/\d+/g, `https://wa.me/${whatsapp2}`);
  }
  currentHtml = currentHtml.replaceAll(SNAPSHOT_PHONE, phone2).replaceAll(SNAPSHOT_PHONE_TEL, phoneTel);
  return /* @__PURE__ */ jsx(Fragment, { children: parse(currentHtml, options) });
}
function FeaturedVideo() {
  const [video, setVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    publicGet("/videos").then((r) => setVideo(r.items.find((v) => v.isFeatured) ?? null)).catch(() => setVideo(null));
  }, []);
  if (!video) return null;
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec featured-video", "aria-labelledby": "featured-video-title", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "eyebrow", children: "Discover AST Education" }),
      /* @__PURE__ */ jsx("h2", { id: "featured-video-title", children: "Take a closer look" }),
      /* @__PURE__ */ jsx("p", { children: "Watch our featured video and explore more from AST Education." }),
      /* @__PURE__ */ jsx(Link, { className: "btn btn-g", to: "/videos", children: "Explore all videos" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "featured-video-media", children: [
      playing ? /* @__PURE__ */ jsx("iframe", { src: `${video.embedUrl}?autoplay=1`, title: video.title, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true }) : /* @__PURE__ */ jsxs("button", { className: "video-poster", onClick: () => setPlaying(true), "aria-label": `Play ${video.title}`, children: [
        /* @__PURE__ */ jsx("img", { src: video.thumbnailUrl, alt: "", loading: "lazy" }),
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "▶" })
      ] }),
      /* @__PURE__ */ jsx("h3", { children: video.title }),
      video.description && /* @__PURE__ */ jsx("p", { children: video.description })
    ] })
  ] });
}
const MILESTONES = [
  {
    date: "2023-12-05",
    label: "5 December 2023",
    title: "Business established",
    text: "The business started as a micro enterprise based in Roorkee, Uttarakhand."
  },
  {
    date: "2023-12-27",
    label: "27 December 2023",
    title: "Registered on Udyam",
    text: "The micro enterprise registration on Udyam is dated 27 December 2023."
  }
];
function AboutHighlights() {
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec about-highlights", "aria-labelledby": "about-milestones-title", children: [
    /* @__PURE__ */ jsx("h2", { id: "about-milestones-title", children: "Milestones" }),
    /* @__PURE__ */ jsx("ol", { className: "clay-timeline", children: MILESTONES.map((item, index) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx("span", { className: "clay-milestone-dot", "aria-hidden": "true", children: index + 1 }),
      /* @__PURE__ */ jsxs("article", { className: "clay-milestone", children: [
        /* @__PURE__ */ jsx("time", { dateTime: item.date, children: item.label }),
        /* @__PURE__ */ jsx("h3", { children: item.title }),
        /* @__PURE__ */ jsx("p", { children: item.text })
      ] })
    ] }, item.date)) }),
    /* @__PURE__ */ jsxs("div", { className: "cols", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h3", { children: "Our approach" }),
        /* @__PURE__ */ jsx("p", { children: "Our approach is to combine clear academic support, practical skill development and personal guidance so students can learn confidently and progress responsibly." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h3", { children: "Coaching and academic support" }),
        /* @__PURE__ */ jsx("p", { children: "AST Education provides coaching and academic support. It does not award university degrees. Degrees are awarded by the universities that conduct the relevant programmes." })
      ] })
    ] })
  ] });
}
function HomeLeadershipPreview() {
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec leadership-preview", "aria-labelledby": "home-leadership-title", children: [
    /* @__PURE__ */ jsx("h2", { id: "home-leadership-title", children: "Our leadership" }),
    /* @__PURE__ */ jsx("p", { className: "lead", children: "The people who guide AST Education's direction, academics and daily operations." }),
    /* @__PURE__ */ jsxs("div", { className: "grid", children: [
      /* @__PURE__ */ jsxs(Link, { className: "card", to: "/leadership", children: [
        /* @__PURE__ */ jsx("h3", { children: "Director & Chairman" }),
        /* @__PURE__ */ jsx("p", { children: "Provides institutional direction, supports strategic growth, strengthens educational partnerships, and oversees the long-term development of AST Education." })
      ] }),
      /* @__PURE__ */ jsxs(Link, { className: "card", to: "/leadership", children: [
        /* @__PURE__ */ jsx("h3", { children: "General Manager & Teacher" }),
        /* @__PURE__ */ jsx("p", { children: "Supports daily institutional operations, coordinates academic activities, assists staff and students, and helps maintain an organised and supportive learning environment." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx(Link, { className: "btn btn-g", to: "/leadership", children: "Meet the leadership team" }) })
  ] });
}
const REVEAL_TARGETS = ["h1", "h2", "h3", ".tag", "p", ".hero .row", ".trust > div", ".grid > .card", ".featured-video"];
function MobileKnowledgeUniverse() {
  const universeRef = useRef(null);
  useEffect(() => {
    const universe = universeRef.current;
    const layout = universe == null ? void 0 : universe.closest(".mobile-home-layout");
    if (!universe || !layout) return;
    const targets = Array.from(layout.querySelectorAll(REVEAL_TARGETS.join(",")));
    const matchMedia = gsap.matchMedia();
    const context = gsap.context(() => {
      matchMedia.add("(max-width: 760px) and (prefers-reduced-motion: no-preference)", () => {
        const visual = universe.querySelector(".ast-bubble-universe--mobile");
        const center = universe.querySelector(".main-ast-bubble");
        const headline = layout.querySelector(".hero h1");
        const badge = layout.querySelector(".hero .tag");
        const actions = layout.querySelectorAll(".hero .row");
        if (!visual || !center) return;
        const revealContent = [badge, headline, ...Array.from(actions)].filter((element) => Boolean(element));
        gsap.set([visual, center], { autoAlpha: 0 });
        gsap.set(revealContent, { autoAlpha: 0, y: 18 });
        const entrance = gsap.timeline({ defaults: { ease: "power2.out" } });
        entrance.to(visual, { autoAlpha: 1, duration: 0.45 }).to(center, { autoAlpha: 1, duration: 0.55 }, "-=0.12").to(revealContent, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09, clearProps: "opacity,visibility,transform" }, "-=0.08");
        const visibilityObserver = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
          universe.classList.toggle("is-in-view", entry.isIntersecting);
          if (entry.isIntersecting) entrance.play();
          else entrance.pause();
        }, { threshold: 0.08 }) : null;
        if (visibilityObserver) visibilityObserver.observe(universe);
        else entrance.play();
        return () => {
          visibilityObserver == null ? void 0 : visibilityObserver.disconnect();
          entrance.kill();
        };
      });
    }, universe);
    targets.forEach((target) => {
      const siblingIndex = target.parentElement ? Array.from(target.parentElement.children).indexOf(target) : 0;
      target.style.setProperty("--home-reveal-delay", `${Math.min(siblingIndex, 4) * 55}ms`);
      target.classList.add("home-scroll-reveal");
    });
    layout.classList.add("home-motion-ready");
    if (!("IntersectionObserver" in window)) targets.forEach((target) => target.classList.add("is-visible"));
    const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
    targets.forEach((target) => revealObserver == null ? void 0 : revealObserver.observe(target));
    let parallaxFrame = 0;
    const updateParallax = () => {
      if (parallaxFrame || !universe.classList.contains("is-in-view")) return;
      parallaxFrame = requestAnimationFrame(() => {
        var _a;
        parallaxFrame = 0;
        const distance = 88 - universe.getBoundingClientRect().top;
        const shift = Math.max(-5, Math.min(5, distance * 0.02));
        (_a = universe.querySelector(".ast-bubble-universe--mobile")) == null ? void 0 : _a.style.setProperty("--mobile-parallax-y", `${shift.toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    return () => {
      var _a;
      context.revert();
      matchMedia.revert();
      revealObserver == null ? void 0 : revealObserver.disconnect();
      window.removeEventListener("scroll", updateParallax);
      if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
      (_a = universe.querySelector(".ast-bubble-universe--mobile")) == null ? void 0 : _a.style.removeProperty("--mobile-parallax-y");
      layout.classList.remove("home-motion-ready");
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: universeRef,
      className: "mobile-knowledge-universe",
      role: "group",
      "aria-label": "AST Education courses",
      children: /* @__PURE__ */ jsx(ASTBubbleUniverse, { mobile: true })
    }
  );
}
function ApprovedPage({ name }) {
  if (name === "home") {
    return /* @__PURE__ */ jsxs("div", { className: "mobile-home-layout", children: [
      /* @__PURE__ */ jsx(MobileKnowledgeUniverse, {}),
      /* @__PURE__ */ jsx(ApprovedHtml, { html: APPROVED_HTML.home }),
      /* @__PURE__ */ jsx(HomeLeadershipPreview, {}),
      /* @__PURE__ */ jsx(FeaturedVideo, {})
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ApprovedHtml, { html: APPROVED_HTML[name] }),
    name === "about" && /* @__PURE__ */ jsx(AboutHighlights, {})
  ] });
}
const ApprovedPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ApprovedPage
}, Symbol.toStringTag, { value: "Module" }));
function CertificationsPage() {
  const viewer = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec", "aria-labelledby": "h-cert", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-cert", tabIndex: -1, children: "Certifications & Registrations" }),
    /* @__PURE__ */ jsx("p", { className: "note", children: "Udyam registration and ISO 9001:2015 are different things. Udyam is a government business registration for micro enterprises. ISO 9001:2015 is a quality management certificate issued to SUMAN EDUCATIONAL TRUST. Neither is an educational accreditation." }),
    /* @__PURE__ */ jsxs("div", { className: "cols", style: { marginTop: 24 }, children: [
      /* @__PURE__ */ jsxs("article", { className: "card", "aria-labelledby": "c-udyam", children: [
        /* @__PURE__ */ jsx("h2", { id: "c-udyam", children: "Udyam Registration" }),
        /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { children: "Enterprise name (as on certificate)" }),
          /* @__PURE__ */ jsx("dd", { children: "RKE ALLSTUDIES & TECHNICAL EDUCATION (AST EDUCATION)" }),
          /* @__PURE__ */ jsx("dt", { children: "Registration number" }),
          /* @__PURE__ */ jsx("dd", { children: "UDYAM-UK-06-0037585" }),
          /* @__PURE__ */ jsx("dt", { children: "Registration date" }),
          /* @__PURE__ */ jsx("dd", { children: "27/12/2023" }),
          /* @__PURE__ */ jsx("dt", { children: "Enterprise type" }),
          /* @__PURE__ */ jsx("dd", { children: "Micro" }),
          /* @__PURE__ */ jsx("dt", { children: "Major activity (as printed)" }),
          /* @__PURE__ */ jsx("dd", { children: "Trading" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "note", style: { marginTop: 14 }, children: "The certificate scan is kept private because it shows personal contact details. It can be shown once the institute confirms a suitable version." })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "card", "aria-labelledby": "c-iso", children: [
        /* @__PURE__ */ jsx("h2", { id: "c-iso", children: "ISO 9001:2015" }),
        /* @__PURE__ */ jsx("p", { className: "note", children: "This certificate is issued to SUMAN EDUCATIONAL TRUST, the parent organisation. It is not a separate certificate issued to AST Education." }),
        /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { children: "Certificate issued to" }),
          /* @__PURE__ */ jsx("dd", { children: "SUMAN EDUCATIONAL TRUST" }),
          /* @__PURE__ */ jsx("dt", { children: "Certification body" }),
          /* @__PURE__ */ jsx("dd", { children: "ICV Assessments Pvt. Ltd." }),
          /* @__PURE__ */ jsx("dt", { children: "Certificate number" }),
          /* @__PURE__ */ jsx("dd", { children: "IN/55611996/3245" }),
          /* @__PURE__ */ jsx("dt", { children: "Issue date" }),
          /* @__PURE__ */ jsx("dd", { children: "17/02/2024" }),
          /* @__PURE__ */ jsx("dt", { children: "Re-certification date" }),
          /* @__PURE__ */ jsx("dd", { children: "16/02/2027" }),
          /* @__PURE__ */ jsx("dt", { children: "Scope" }),
          /* @__PURE__ */ jsx("dd", { children: "Arts and Commerce Education; Medical Education; Design and Animation; Personality Development; Hospitality; Short-Term Courses; Business and Investment; Journalism; Law; Computer Courses; Academic Education." })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "thumb", type: "button", style: { marginTop: 14 }, onClick: () => {
          var _a;
          return (_a = viewer.current) == null ? void 0 : _a.showModal();
        }, "aria-label": "View the ISO 9001:2015 certificate in a zoomable viewer", children: /* @__PURE__ */ jsx("img", { src: "/assets/iso.webp", alt: "ISO 9001:2015 certificate issued to SUMAN EDUCATIONAL TRUST by ICV Assessments Pvt. Ltd.", loading: "lazy" }) }),
        /* @__PURE__ */ jsx("p", { className: "hint", children: "Select the certificate to view it. Zoom is available in the viewer." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("dialog", { ref: viewer, "aria-label": "ISO 9001:2015 certificate viewer", style: { border: 0, borderRadius: 12, padding: 0, width: "min(760px, 94vw)" }, children: /* @__PURE__ */ jsxs("div", { style: { padding: 24 }, children: [
      /* @__PURE__ */ jsx("button", { className: "x", type: "button", "aria-label": "Close certificate viewer", onClick: () => {
        var _a;
        return (_a = viewer.current) == null ? void 0 : _a.close();
      }, children: "×" }),
      /* @__PURE__ */ jsx("p", { className: "row", style: { margin: "0 0 12px" }, children: /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", "aria-pressed": zoomed, onClick: () => setZoomed((z2) => !z2), children: zoomed ? "Zoom out" : "Zoom in" }) }),
      /* @__PURE__ */ jsx("div", { className: `lb ${zoomed ? "zoomed" : ""}`, children: /* @__PURE__ */ jsx("img", { src: "/assets/iso.webp", alt: "ISO 9001:2015 certificate issued to SUMAN EDUCATIONAL TRUST", loading: "lazy" }) })
    ] }) })
  ] });
}
const CertificationsPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CertificationsPage
}, Symbol.toStringTag, { value: "Module" }));
function ContactLearningUniverse() {
  const sceneRef = useRef(null);
  const bookRef = useRef(null);
  const orbitRef = useRef(null);
  const sunRef = useRef(null);
  useEffect(() => {
    const scene = sceneRef.current;
    const book = bookRef.current;
    const orbit = orbitRef.current;
    const sun = sunRef.current;
    if (!scene || !book || !orbit || !sun) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let removePointerListeners = () => {
    };
    const context = gsap.context(() => {
      gsap.fromTo(
        scene,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.to(book, {
        y: -7,
        rotationZ: -1.5,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.8
      });
      gsap.to(orbit, { rotation: 360, duration: 52, ease: "none", repeat: -1 });
      gsap.to(sun, {
        scale: 1.06,
        opacity: 0.82,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const rotateX = gsap.quickTo(book, "rotationX", { duration: 0.55, ease: "power3.out" });
        const rotateY = gsap.quickTo(book, "rotationY", { duration: 0.55, ease: "power3.out" });
        const onPointerMove = (event) => {
          const bounds = scene.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          rotateX(-y * 7);
          rotateY(x * 10);
        };
        const onPointerLeave = () => {
          rotateX(0);
          rotateY(0);
        };
        scene.addEventListener("pointermove", onPointerMove);
        scene.addEventListener("pointerleave", onPointerLeave);
        removePointerListeners = () => {
          scene.removeEventListener("pointermove", onPointerMove);
          scene.removeEventListener("pointerleave", onPointerLeave);
        };
      }
    }, scene);
    return () => {
      removePointerListeners();
      context.revert();
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: sceneRef,
      className: "contact-learning-universe",
      role: "img",
      "aria-label": "AST Education learning universe with a floating open book, golden sunrise and orbiting study symbols",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "contact-learning-universe__sky", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("span", { ref: sunRef, className: "contact-learning-universe__sun" }),
          /* @__PURE__ */ jsxs("span", { ref: orbitRef, className: "contact-learning-universe__orbit", children: [
            /* @__PURE__ */ jsx("i", { className: "contact-learning-universe__orbit-dot contact-learning-universe__orbit-dot--one" }),
            /* @__PURE__ */ jsx("i", { className: "contact-learning-universe__orbit-dot contact-learning-universe__orbit-dot--two" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__star contact-learning-universe__star--one", children: "✦" }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__star contact-learning-universe__star--two", children: "✧" }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__star contact-learning-universe__star--three", children: "✦" }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__float contact-learning-universe__float--cap", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 32 32", focusable: "false", children: [
            /* @__PURE__ */ jsx("path", { d: "m3 12 13-7 13 7-13 7-13-7Z" }),
            /* @__PURE__ */ jsx("path", { d: "M8 15v7c4.5 3.5 11.5 3.5 16 0v-7M28 13v8" })
          ] }) }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__float contact-learning-universe__float--code", "aria-hidden": "true", children: "</>" }),
          /* @__PURE__ */ jsx("span", { className: "contact-learning-universe__float contact-learning-universe__float--spark", "aria-hidden": "true", children: "✧" })
        ] }),
        /* @__PURE__ */ jsx("div", { ref: bookRef, className: "contact-learning-universe__book", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 360 220", focusable: "false", children: [
          /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsxs("linearGradient", { id: "learning-book-left", x1: "0", x2: "1", y1: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#FFFFFF" }),
              /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#DCE8F4" })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "learning-book-right", x1: "0", x2: "1", y1: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#FFFDF5" }),
              /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#F4B928" })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "learning-book-cover", x1: "0", x2: "0.9", y1: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#F26A21" }),
              /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#C84716" })
            ] }),
            /* @__PURE__ */ jsx("filter", { id: "learning-book-shadow", x: "-30%", y: "-30%", width: "160%", height: "180%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "7" }) })
          ] }),
          /* @__PURE__ */ jsx("ellipse", { cx: "180", cy: "188", rx: "118", ry: "15", fill: "#082B50", opacity: ".16", filter: "url(#learning-book-shadow)" }),
          /* @__PURE__ */ jsxs("g", { className: "contact-learning-universe__book-cover", children: [
            /* @__PURE__ */ jsx("path", { d: "M47 70 Q112 49 178 79 L178 179 Q111 151 52 174 Q43 171 43 162 L43 80 Q43 73 47 70Z", fill: "url(#learning-book-cover)" }),
            /* @__PURE__ */ jsx("path", { d: "M313 70 Q248 49 182 79 L182 179 Q249 151 308 174 Q317 171 317 162 L317 80 Q317 73 313 70Z", fill: "url(#learning-book-cover)" })
          ] }),
          /* @__PURE__ */ jsx("path", { d: "M52 56 Q115 36 176 69 L176 166 Q111 140 56 160 Q49 162 49 153 L49 65 Q49 59 52 56Z", fill: "url(#learning-book-left)", stroke: "#FFFFFF", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M308 56 Q245 36 184 69 L184 166 Q249 140 304 160 Q311 162 311 153 L311 65 Q311 59 308 56Z", fill: "url(#learning-book-right)", stroke: "#FFFFFF", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M180 72 L180 171", stroke: "#082B50", strokeOpacity: ".24", strokeWidth: "5", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M65 76 Q112 61 157 80 M65 91 Q112 77 157 96 M65 106 Q110 92 157 111 M65 121 Q107 109 157 126", fill: "none", stroke: "#6D88A2", strokeOpacity: ".4", strokeWidth: "3", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M203 80 Q248 61 295 76 M203 96 Q248 77 295 91 M203 111 Q250 92 295 106 M203 126 Q253 109 295 121", fill: "none", stroke: "#C4932A", strokeOpacity: ".45", strokeWidth: "3", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("text", { x: "238", y: "146", fill: "#082B50", fontFamily: "Georgia,serif", fontSize: "19", fontWeight: "700", letterSpacing: "3", children: "AST" }),
          /* @__PURE__ */ jsx("path", { d: "M160 180 Q180 187 200 180", fill: "none", stroke: "#F26A21", strokeWidth: "4", strokeLinecap: "round" })
        ] }) }),
        /* @__PURE__ */ jsxs("span", { className: "contact-learning-universe__tagline", "aria-hidden": "true", children: [
          "LEARN ",
          /* @__PURE__ */ jsx("i", { children: "·" }),
          " BUILD ",
          /* @__PURE__ */ jsx("i", { children: "·" }),
          " GROW"
        ] })
      ]
    }
  );
}
const AST_EDUCATION_ADDRESS = "244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667.";
const AST_EDUCATION_MAP_URL = "https://www.google.com/maps/place/All+Studies+%26+Technical+Education(+AST+EDUCATION),+Roorkee/@29.8350945,77.9195146,13z/data=!4m9!1m2!2m1!1s244%2FA,+Purvi+Deen+Dayal,+Opposite+Canara+Bank,+DAV+Inter+College+Road,+Roorkee,+Haridwar,+Uttarakhand+247667.!3m5!1s0x390eb37f8f629fe5:0xcc3c34df09fec34d!8m2!3d29.8722079!4d77.8812569!16s%2Fg%2F11fswmxp6n?entry=ttu&g_ep=EgoyMDI2MTEwNC4wIKXMDSoASAFQAw%3D%3D";
function ContactPage() {
  const { facts, items, availability, snapshotDate: snapshotDate2 } = useFacts();
  const [copyStatus, setCopyStatus] = useState("");
  const address2 = AST_EDUCATION_ADDRESS;
  const phone2 = facts.phone ?? "";
  const whatsapp2 = facts.whatsapp ?? "";
  const hours = facts.hours;
  const digits = whatsapp2.replace(/\D/g, "");
  const customFacts = (items == null ? void 0 : items.filter((fact) => fact.custom)) ?? [];
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address2);
      setCopyStatus("Address copied.");
    } catch {
      setCopyStatus("Copy is not available here. Select the address and copy it manually.");
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec contact-page", "aria-labelledby": "h-contact", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-contact", className: "contact-page__heading", tabIndex: -1, children: "Contact Us" }),
    availability === "loading" && /* @__PURE__ */ jsx("p", { className: "hint", role: "status", children: "Checking the latest contact details…" }),
    availability === "fallback" && /* @__PURE__ */ jsxs("div", { className: "note", role: "status", children: [
      "We could not load the latest details. The details shown are approved details from ",
      snapshotDate2,
      ". Please call us to confirm before you visit."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "contact-layout", children: [
      /* @__PURE__ */ jsxs("div", { className: "card contact-visit-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "contact-visit-card__details", children: [
          /* @__PURE__ */ jsx("h2", { children: "Visit" }),
          /* @__PURE__ */ jsxs("p", { children: [
            "AST Education",
            /* @__PURE__ */ jsx("br", {}),
            address2
          ] }),
          customFacts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "contact-visit-card__verified", children: [
            /* @__PURE__ */ jsx("h3", { children: "Verified institute details" }),
            /* @__PURE__ */ jsx("dl", { className: "facts", children: customFacts.map((fact) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
              /* @__PURE__ */ jsx("dt", { children: fact.label }),
              /* @__PURE__ */ jsxs("dd", { children: [
                fact.value,
                " ",
                /* @__PURE__ */ jsx("span", { className: "badge badge-admitted", children: "Verified" })
              ] })
            ] }, fact.key)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-visit-card__visual", "aria-label": "AST Education in Roorkee, Uttarakhand", children: [
          /* @__PURE__ */ jsx("span", { className: "contact-visit-card__visual-label", children: "VISIT OUR CENTER" }),
          /* @__PURE__ */ jsx("span", { className: "contact-visit-card__visual-pin", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 48 48", focusable: "false", children: [
            /* @__PURE__ */ jsx("path", { d: "M24 43s15-14.2 15-26A15 15 0 0 0 9 17c0 11.8 15 26 15 26Z" }),
            /* @__PURE__ */ jsx("circle", { cx: "24", cy: "17", r: "5.5" })
          ] }) }),
          /* @__PURE__ */ jsxs("span", { className: "contact-visit-card__visual-title", children: [
            "Find us in",
            /* @__PURE__ */ jsx("br", {}),
            "Roorkee"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "contact-visit-card__visual-caption", children: "All Studies & Technical Education" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-visit-card__actions", children: [
          /* @__PURE__ */ jsxs("a", { className: "btn btn-n", href: AST_EDUCATION_MAP_URL, target: "_blank", rel: "noopener noreferrer", children: [
            "Open in Google Maps ",
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "↗" })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: copyAddress, children: "Copy address" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "hint contact-visit-card__copy-status", "aria-live": "polite", children: copyStatus })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card contact-info-card", children: [
        /* @__PURE__ */ jsx("h2", { children: "Contact Information" }),
        phone2 && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", { href: `tel:${phone2.replace(/\s/g, "")}`, children: phone2 }) }),
        /* @__PURE__ */ jsxs("div", { className: "contact-info-card__actions", children: [
          phone2 && /* @__PURE__ */ jsx("a", { className: "btn btn-n", href: `tel:${phone2.replace(/\s/g, "")}`, children: "Call now" }),
          digits && /* @__PURE__ */ jsx("a", { className: "btn btn-g", href: `https://wa.me/${digits}`, target: "_blank", rel: "noopener noreferrer", children: "WhatsApp" })
        ] }),
        /* @__PURE__ */ jsx(ContactLearningUniverse, {}),
        hours && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h3", { style: { marginTop: 20 }, children: "Working hours" }),
          /* @__PURE__ */ jsx("p", { children: hours })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-info-card__social-block", children: [
          /* @__PURE__ */ jsx("h3", { children: "Social" }),
          /* @__PURE__ */ jsx("div", { className: "social contact-info-card__social", children: SOCIAL.map((item) => /* @__PURE__ */ jsx("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", "aria-label": `AST Education on ${item.label} (opens in a new tab)`, title: item.label, children: /* @__PURE__ */ jsx("img", { src: item.icon, alt: "", width: 24, height: 24 }) }, item.label)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "contact-page__enquiry", children: [
      "Prefer to write? ",
      /* @__PURE__ */ jsx(Link, { to: "/enquiry", children: "Send an admission enquiry" }),
      "."
    ] })
  ] });
}
const ContactPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ContactPage
}, Symbol.toStringTag, { value: "Module" }));
function CourseMotionVisual({ category, className = "" }) {
  const sceneRef = useRef(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const artwork = scene.querySelector(".course-motion-visual__artwork");
    const floaters = scene.querySelectorAll(".course-motion-visual__floater");
    if (!artwork) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        artwork,
        { autoAlpha: 0, scale: 0.9, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
      gsap.to(artwork, {
        y: -5,
        rotation: 1,
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.7
      });
      floaters.forEach((floater, index) => {
        gsap.to(floater, {
          y: index % 2 ? -7 : 6,
          rotation: index % 2 ? 3 : -3,
          duration: 3.2 + index * 0.35,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.22
        });
      });
    }, scene);
    return () => context.revert();
  }, [category]);
  return /* @__PURE__ */ jsxs("div", { ref: sceneRef, className: `course-motion-visual course-motion-visual--${category} ${className}`, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("span", { className: "course-motion-visual__particle course-motion-visual__particle--one" }),
    /* @__PURE__ */ jsx("span", { className: "course-motion-visual__particle course-motion-visual__particle--two" }),
    /* @__PURE__ */ jsx("span", { className: "course-motion-visual__particle course-motion-visual__particle--three" }),
    /* @__PURE__ */ jsxs("svg", { className: "course-motion-visual__artwork", viewBox: "0 0 300 240", role: "presentation", children: [
      /* @__PURE__ */ jsx("ellipse", { cx: "150", cy: "204", rx: "94", ry: "12", fill: "rgba(8,43,80,.12)" }),
      category === "school" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "M66 110c24-13 50-12 77 2v53c-27-14-53-15-77-2z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M143 112c27-14 53-15 77-2v53c-24-13-50-12-77 2z", fill: "#f4b928", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M143 115v53m-63-44c15-5 29-3 43 4m31-4c15-7 29-9 44-4", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "m178 63 18-34 7 4-13 37-9 6z", fill: "#f26a21" }),
          /* @__PURE__ */ jsx("path", { d: "m196 29 4-8 8 4-5 8z", fill: "#f4b928" }),
          /* @__PURE__ */ jsx("path", { d: "m179 76 11-6-7 14z", fill: "#082b50" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "m91 78 35-16 36 16-36 16z", fill: "#082b50" }),
          /* @__PURE__ */ jsx("path", { d: "m105 82 21-9 22 9-22 9z", fill: "#f4b928" }),
          /* @__PURE__ */ jsx("path", { d: "M126 78v17c0 8 10 8 10 0V78m23 2 9 6-2 23-7-6z", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsx("text", { x: "54", y: "71", fill: "#f26a21", fontSize: "18", fontWeight: "800", children: "A+" }),
        /* @__PURE__ */ jsx("text", { x: "222", y: "96", fill: "#082b50", fontSize: "17", fontWeight: "800", children: "12" })
      ] }),
      category === "higher" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "M92 75h101v88H92z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M107 96h68m-68 13h55", stroke: "#9aafc1", strokeWidth: "4", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("circle", { cx: "158", cy: "139", r: "11", fill: "#f4b928" }),
          /* @__PURE__ */ jsx("path", { d: "m154 148-3 20 8-6 8 6-4-20", fill: "#f26a21" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "m55 65 39-18 40 18-40 18z", fill: "#082b50" }),
          /* @__PURE__ */ jsx("path", { d: "m71 69 23-11 24 11-24 11z", fill: "#f4b928" }),
          /* @__PURE__ */ jsx("path", { d: "M94 65v17c0 8 10 8 10 0V65m27 2 10 7-2 25-8-7z", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "m196 158 18-31 6 4-13 34-8 5z", fill: "#f26a21" }),
          /* @__PURE__ */ jsx("path", { d: "m213 127 4-7 7 4-5 7z", fill: "#f4b928" })
        ] }),
        /* @__PURE__ */ jsx("path", { d: "M224 113V72m0 0-10 11m10-11 10 11", fill: "none", stroke: "#f26a21", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" })
      ] }),
      category === "computer" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("rect", { x: "69", y: "49", width: "158", height: "111", rx: "12", fill: "#082b50" }),
          /* @__PURE__ */ jsx("rect", { x: "78", y: "58", width: "140", height: "91", rx: "6", fill: "#f8fbff" }),
          /* @__PURE__ */ jsx("path", { d: "M135 160v16m27-16v16m-44 5h61", stroke: "#082b50", strokeWidth: "6", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M90 72h35v20H90zm44 0h35v20h-35zm44 0h29v20h-29zM90 100h35v20H90zm44 0h35v20h-35zm44 0h29v20h-29z", fill: "#e7eef5", stroke: "#b7c8d8", strokeWidth: "2" }),
          /* @__PURE__ */ jsx("path", { d: "M90 128h35v13H90zM134 128h35v13h-35z", fill: "#f4b928" }),
          /* @__PURE__ */ jsx("path", { d: "M178 128h29v13h-29z", fill: "#f26a21" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("rect", { x: "36", y: "112", width: "48", height: "67", rx: "8", fill: "#f26a21", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("rect", { x: "43", y: "120", width: "34", height: "13", rx: "3", fill: "#fffdf7" }),
          /* @__PURE__ */ jsx("path", { d: "M46 143h5m8 0h5m8 0h2m-28 11h5m8 0h5m8 0h2m-28 11h5m8 0h5m8 0h2", stroke: "#fff", strokeWidth: "4", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsx("text", { x: "215", y: "45", fill: "#f26a21", fontSize: "18", fontWeight: "800", children: "PC" })
      ] }),
      category === "technical" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("rect", { x: "61", y: "53", width: "177", height: "112", rx: "12", fill: "#082b50" }),
          /* @__PURE__ */ jsx("rect", { x: "71", y: "63", width: "157", height: "91", rx: "6", fill: "#f8fbff" }),
          /* @__PURE__ */ jsx("path", { d: "m43 179 18-14h177l18 14c2 4-1 7-6 7H49c-5 0-8-3-6-7", fill: "#c6d5e0", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M92 85h22m-22 15h55m-55 15h34m-34 15h70", stroke: "#9aafc1", strokeWidth: "4", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("path", { d: "m183 81-9 9 9 9m18-18 9 9-9 9", fill: "none", stroke: "#f26a21", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }),
          /* @__PURE__ */ jsx("rect", { className: "course-motion-visual__cursor", x: "170", y: "125", width: "4", height: "13", rx: "2", fill: "#f26a21" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("rect", { x: "194", y: "34", width: "47", height: "34", rx: "6", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "m204 44 5 5-5 5m12 0h13", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        /* @__PURE__ */ jsx("text", { x: "47", y: "87", fill: "#f4b928", fontSize: "19", fontWeight: "800", children: "{ }" })
      ] }),
      category === "personality" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("rect", { x: "134", y: "54", width: "36", height: "78", rx: "18", fill: "#082b50" }),
          /* @__PURE__ */ jsx("path", { d: "M125 99v8c0 27 54 27 54 0v-8m-27 35v25m-17 0h34", fill: "none", stroke: "#f26a21", strokeWidth: "5", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M144 69h16m-16 12h16m-16 12h16", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round", opacity: ".8" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "M44 56h60a12 12 0 0 1 12 12v23a12 12 0 0 1-12 12H76l-18 15v-15h-14a12 12 0 0 1-12-12V68a12 12 0 0 1 12-12z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("path", { d: "M52 77h44m-44 10h30", stroke: "#f26a21", strokeWidth: "4", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsxs("g", { className: "course-motion-visual__floater", children: [
          /* @__PURE__ */ jsx("path", { d: "M191 85h50a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-8v13l-15-13h-27a10 10 0 0 1-10-10V95a10 10 0 0 1 10-10z", fill: "#f4b928", stroke: "#082b50", strokeWidth: "3" }),
          /* @__PURE__ */ jsx("circle", { cx: "200", cy: "104", r: "3", fill: "#082b50" }),
          /* @__PURE__ */ jsx("circle", { cx: "215", cy: "104", r: "3", fill: "#082b50" }),
          /* @__PURE__ */ jsx("circle", { cx: "230", cy: "104", r: "3", fill: "#082b50" })
        ] }),
        /* @__PURE__ */ jsx("path", { d: "M97 149c-8-8-8-19 0-27m-13 34c-14-13-14-31 0-44m101 37c7-8 7-19 0-27", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round" })
      ] })
    ] })
  ] });
}
const CATEGORY_LABELS = {
  school: "School Education",
  higher: "Higher Education Coaching",
  computer: "Computer Education",
  technical: "Programming & Technical",
  personality: "Personality Development"
};
const APPROVED_LIST_DATE = snapshot.snapshotDate;
const COURSE_SEED = [
  ["LKG to Class 12", "school"],
  ["Academic Coaching", "school"],
  ["Subject-wise Support", "school"],
  ["B.A.", "higher"],
  ["B.Com", "higher"],
  ["B.Tech", "higher"],
  ["Academic Support", "higher"],
  ["Basic Computer", "computer"],
  ["DCA", "computer"],
  ["ADCA", "computer"],
  ["CCC", "computer"],
  ["Tally", "computer"],
  ["MS Office", "computer"],
  ["Advanced Excel", "computer"],
  ["Coding Classes", "technical"],
  ["Programming Education", "technical"],
  ["Technical Skill Development", "technical"],
  ["English Speaking", "personality"],
  ["Communication Skills", "personality"],
  ["Motivation", "personality"],
  ["Personality Development", "personality"]
].map(([name, category]) => ({
  id: name,
  name,
  category,
  description: "Detailed course information will be updated by the institute."
}));
gsap.registerPlugin(ScrollTrigger);
const CATEGORY_SUBCOURSES = {
  school: [
    { name: "LKG to Class 12", icon: "A+" },
    { name: "Academic Coaching", icon: "ABC" },
    { name: "Subject-wise Academic Support", icon: "12" }
  ],
  higher: [
    { name: "B.A. Coaching", icon: "BA" },
    { name: "B.Com Coaching", icon: "BC" },
    { name: "B.Tech Coaching", icon: "BT" }
  ],
  computer: [
    { name: "Basic Computer", icon: "PC" },
    { name: "DCA", icon: "DCA" },
    { name: "ADCA", icon: "AD" },
    { name: "CCC", icon: "CCC" },
    { name: "Tally", icon: "T" },
    { name: "MS Office", icon: "MS" },
    { name: "Advanced Excel", icon: "XLS" }
  ],
  technical: [
    { name: "Coding Classes", icon: "</>" },
    { name: "Programming Education", icon: "{ }" },
    { name: "Technical Skill Development", icon: "01" }
  ],
  personality: [
    { name: "English Speaking", icon: "EN" },
    { name: "Communication Skills", icon: "HI" },
    { name: "Motivation Classes", icon: "GO" },
    { name: "Personality Development", icon: "YOU" }
  ]
};
const CATEGORY_NAV = [
  { key: "school", label: "School Education", short: "School" },
  { key: "higher", label: "Higher Education Coaching", short: "Higher" },
  { key: "computer", label: "Computer Education", short: "Computer" },
  { key: "technical", label: "Programming & Technical", short: "Technical" },
  { key: "personality", label: "Personality Development", short: "Personality" }
];
const CATEGORY_SECTION_IDS = {
  school: "school-education",
  higher: "higher-education-coaching",
  computer: "computer-education",
  technical: "programming-technical",
  personality: "personality-development"
};
const CATEGORY_MARKS = {
  school: "01",
  higher: "02",
  computer: "03",
  technical: "04",
  personality: "05"
};
const CATEGORY_GLYPH = {
  school: "ABC",
  higher: "UG",
  computer: "</>",
  technical: "01",
  personality: "YOU"
};
const CATEGORY_DESCRIPTIONS = {
  school: "LKG to Class 12 academic coaching and subject-wise support.",
  higher: "B.A., B.Com and B.Tech coaching with academic support.",
  computer: "Foundational to practical computer education for office and accounting skills.",
  technical: "Coding, programming education and technical skill development.",
  personality: "English speaking, communication, motivation and personality development."
};
const CATEGORY_SYMBOLS = {
  school: ["A", "B", "+", "12", "BOOK"],
  higher: ["BA", "BCom", "BTech", "CAP", "BOOK"],
  computer: ["PC", "101", "DCA", "XLS", "TALLY"],
  technical: ["</>", "{}", "JS", "01", "TERM"],
  personality: ["HI", "YOU", "...", "VOICE", "GO"]
};
function CourseIllustration({ category }) {
  const book = /* @__PURE__ */ jsxs("g", { className: "course-art__book course-art__float--slow", children: [
    /* @__PURE__ */ jsx("path", { d: "M56 87c10-5 20-4 30 2v25c-10-6-20-7-30-2z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M86 89c10-6 20-7 30-2v25c-10-5-20-4-30 2z", fill: "#f4b928", stroke: "#082b50", strokeWidth: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M86 90v25M63 94c6-2 12-1 17 2M93 94c6-3 12-4 17-2", fill: "none", stroke: "#f26a21", strokeWidth: "2", strokeLinecap: "round" })
  ] });
  return /* @__PURE__ */ jsx("div", { className: `premium-course-card__illustration premium-course-card__illustration--${category}`, "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 220 140", role: "presentation", children: [
    /* @__PURE__ */ jsx("ellipse", { className: "course-art__ground", cx: "110", cy: "124", rx: "68", ry: "7" }),
    category === "school" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("g", { className: "course-art__float--slow", children: [
        /* @__PURE__ */ jsx("path", { d: "m52 57 33-14 34 14-34 14z", fill: "#082b50" }),
        /* @__PURE__ */ jsx("path", { d: "m64 61 21-9 22 9-22 9z", fill: "#f4b928" }),
        /* @__PURE__ */ jsx("path", { d: "M85 57v15c0 6 8 6 8 0V57", fill: "none", stroke: "#f26a21", strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "m116 58 8 5-2 20-6-5z", fill: "#f26a21" })
      ] }),
      book,
      /* @__PURE__ */ jsxs("g", { className: "course-art__float--delay", children: [
        /* @__PURE__ */ jsx("path", { d: "m145 77 19-33 5 3-14 36-8 4z", fill: "#f26a21" }),
        /* @__PURE__ */ jsx("path", { d: "m164 44 3-6 6 3-4 6z", fill: "#f4b928" }),
        /* @__PURE__ */ jsx("path", { d: "m146 87 8-4-5 10z", fill: "#082b50" })
      ] }),
      /* @__PURE__ */ jsx("g", { className: "course-art__sparkle course-art__sparkle--one", children: /* @__PURE__ */ jsx("path", { d: "M42 81v10m-5-5h10" }) }),
      /* @__PURE__ */ jsx("circle", { className: "course-art__dot course-art__float--delay", cx: "177", cy: "69", r: "4" }),
      /* @__PURE__ */ jsx("path", { className: "course-art__accent", d: "m139 43 4-7 4 7 7 4-7 4-4 7-4-7-7-4z" })
    ] }),
    category === "higher" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("path", { d: "M151 99V49m0 0-8 9m8-9 8 9", className: "course-art__growth" }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__float--slow", children: [
        /* @__PURE__ */ jsx("path", { d: "m60 61 30-13 30 13-30 13z", fill: "#082b50" }),
        /* @__PURE__ */ jsx("path", { d: "m72 65 18-8 18 8-18 8z", fill: "#f4b928" }),
        /* @__PURE__ */ jsx("path", { d: "M90 61v14c0 7 9 7 9 0V61", fill: "none", stroke: "#f26a21", strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M121 60c4 5 4 10 0 15", fill: "none", stroke: "#f26a21", strokeWidth: "2" })
      ] }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__certificate course-art__float--delay", children: [
        /* @__PURE__ */ jsx("path", { d: "M125 74h42v35h-42z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M132 82h27M132 88h18", stroke: "#91a7bb", strokeWidth: "2", strokeLinecap: "round" }),
        /* @__PURE__ */ jsx("circle", { cx: "153", cy: "100", r: "5", fill: "#f4b928" }),
        /* @__PURE__ */ jsx("path", { d: "m151 104-2 8 4-3 4 3-2-8", fill: "#f26a21" })
      ] }),
      /* @__PURE__ */ jsx("path", { d: "M55 105h38v10H55z", fill: "#f26a21" }),
      /* @__PURE__ */ jsx("path", { d: "M59 96h34v9H59z", fill: "#f4b928" }),
      /* @__PURE__ */ jsx("path", { d: "M64 87h29v9H64z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { className: "course-art__dot course-art__float--delay", cx: "48", cy: "56", r: "4" })
    ] }),
    category === "computer" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("g", { className: "course-art__monitor", children: [
        /* @__PURE__ */ jsx("rect", { x: "61", y: "39", width: "103", height: "66", rx: "8", fill: "#082b50" }),
        /* @__PURE__ */ jsx("rect", { x: "67", y: "45", width: "91", height: "53", rx: "4", fill: "#f8fbff" }),
        /* @__PURE__ */ jsx("path", { d: "M105 105v8m15-8v8m-25 2h36", stroke: "#082b50", strokeWidth: "4", strokeLinecap: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M78 53h21v12H78zM105 53h21v12h-21zM132 53h18v12h-18zM78 70h21v12H78zM105 70h21v12h-21zM132 70h18v12h-18z", fill: "#e7eef5", stroke: "#b7c8d8" }),
        /* @__PURE__ */ jsx("path", { className: "course-art__cell", d: "M78 87h21v7H78zM105 87h21v7h-21zM132 87h18v7h-18z", fill: "#f4b928" })
      ] }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__calculator course-art__float--delay", children: [
        /* @__PURE__ */ jsx("rect", { x: "39", y: "73", width: "37", height: "48", rx: "6", fill: "#f26a21", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("rect", { x: "45", y: "79", width: "25", height: "10", rx: "2", fill: "#fffdf7" }),
        /* @__PURE__ */ jsx("path", { d: "M47 96h4m5 0h4m5 0h4m-22 8h4m5 0h4m5 0h4", stroke: "#fff", strokeWidth: "3", strokeLinecap: "round" })
      ] }),
      /* @__PURE__ */ jsx("path", { className: "course-art__code-mark", d: "m174 65-7 6 7 6m5-12 7 6-7 6" }),
      /* @__PURE__ */ jsx("circle", { className: "course-art__dot course-art__float--slow", cx: "51", cy: "48", r: "4" })
    ] }),
    category === "technical" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("g", { className: "course-art__laptop", children: [
        /* @__PURE__ */ jsx("rect", { x: "54", y: "37", width: "112", height: "72", rx: "8", fill: "#082b50" }),
        /* @__PURE__ */ jsx("rect", { x: "61", y: "44", width: "98", height: "57", rx: "4", fill: "#f8fbff" }),
        /* @__PURE__ */ jsx("path", { d: "m45 113 11-7h108l11 7c2 2 0 5-3 5H48c-3 0-5-3-3-5", fill: "#c6d5e0", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M78 56h14m-14 9h33m-33 9h22m-22 9h39", stroke: "#91a7bb", strokeWidth: "3", strokeLinecap: "round" }),
        /* @__PURE__ */ jsx("path", { d: "m135 55-5 7 5 7m9-14 5 7-5 7", fill: "none", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx("rect", { className: "course-art__cursor", x: "125", y: "81", width: "3", height: "9", rx: "1", fill: "#f26a21" })
      ] }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__terminal course-art__float--delay", children: [
        /* @__PURE__ */ jsx("rect", { x: "144", y: "34", width: "36", height: "27", rx: "5", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("path", { d: "m152 42 4 4-4 4m9 0h10", fill: "none", stroke: "#f26a21", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
      ] }),
      /* @__PURE__ */ jsx("path", { className: "course-art__accent course-art__float--slow", d: "m41 52 4-7 4 7 7 4-7 4-4 7-4-7-7-4z" })
    ] }),
    category === "personality" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("g", { className: "course-art__microphone course-art__float--slow", children: [
        /* @__PURE__ */ jsx("rect", { x: "98", y: "42", width: "25", height: "46", rx: "12.5", fill: "#082b50" }),
        /* @__PURE__ */ jsx("path", { d: "M92 68v5c0 20 37 20 37 0v-5m-18 25v15m-12 0h24", fill: "none", stroke: "#f26a21", strokeWidth: "4", strokeLinecap: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M104 51h13m-13 8h13m-13 8h13", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", opacity: ".8" })
      ] }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__speech course-art__float--delay", children: [
        /* @__PURE__ */ jsx("path", { d: "M47 48h37a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H67l-9 8v-8h-3a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8z", fill: "#fffdf7", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M59 62h21m-21 7h14", stroke: "#f26a21", strokeWidth: "3", strokeLinecap: "round" })
      ] }),
      /* @__PURE__ */ jsxs("g", { className: "course-art__speech course-art__float--slow", children: [
        /* @__PURE__ */ jsx("path", { d: "M139 55h29a7 7 0 0 1 7 7v12a7 7 0 0 1-7 7h-4v7l-8-7h-17a7 7 0 0 1-7-7V62a7 7 0 0 1 7-7z", fill: "#f4b928", stroke: "#082b50", strokeWidth: "2" }),
        /* @__PURE__ */ jsx("circle", { cx: "145", cy: "68", r: "2", fill: "#082b50" }),
        /* @__PURE__ */ jsx("circle", { cx: "154", cy: "68", r: "2", fill: "#082b50" }),
        /* @__PURE__ */ jsx("circle", { cx: "163", cy: "68", r: "2", fill: "#082b50" })
      ] }),
      /* @__PURE__ */ jsx("path", { className: "course-art__sound", d: "M83 94c-5-5-5-12 0-17m-7 22c-9-8-9-20 0-28m54 28c5-5 5-12 0-17" }),
      /* @__PURE__ */ jsx("path", { className: "course-art__accent", d: "m181 91 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" })
    ] })
  ] }) });
}
function CoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState(loadingWith(COURSE_SEED));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(null);
  const [mobileDeckExpanded, setMobileDeckExpanded] = useState(false);
  const dialog = useRef(null);
  const dialogTrigger = useRef(null);
  const storyRoot = useRef(null);
  const heroRef = useRef(null);
  const orbitRef = useRef(null);
  const emblemRef = useRef(null);
  const dialogAnimation = useRef(null);
  useEffect(() => {
    publicGet("/courses").then((result) => setState(settle({ ok: true, items: result.items }, COURSE_SEED))).catch(() => setState(settle({ ok: false }, COURSE_SEED)));
  }, []);
  const shown = useMemo(() => state.items.filter((course) => {
    var _a;
    if (category && course.category !== category) return false;
    const categoryLabel = ((_a = CATEGORY_NAV.find((item) => item.key === course.category)) == null ? void 0 : _a.label) ?? CATEGORY_LABELS[course.category] ?? course.category;
    const haystack = `${course.name} ${categoryLabel} ${course.description}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [state.items, category, query]);
  const categoryCards = useMemo(() => CATEGORY_NAV.flatMap((item) => {
    const courses = shown.filter((course) => course.category === item.key);
    return courses.length ? [{
      key: item.key,
      label: item.label,
      description: CATEGORY_DESCRIPTIONS[item.key],
      courses
    }] : [];
  }), [shown]);
  useEffect(() => {
    const root = storyRoot.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [shown]);
  useEffect(() => {
    const root = storyRoot.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = root.querySelectorAll(".premium-course-card");
    const context = gsap.context(() => {
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 34, scale: 0.96, filter: "blur(7px)" },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform,filter",
          scrollTrigger: { trigger: root, start: "top 82%", once: true }
        }
      );
    }, root);
    return () => context.revert();
  }, [categoryCards]);
  useEffect(() => {
    const hero = heroRef.current;
    const orbit = orbitRef.current;
    const emblem = emblemRef.current;
    if (!hero || !orbit || !emblem || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let removePointerListeners = () => {
    };
    const context = gsap.context(() => {
      const letters = emblem.querySelectorAll("[data-logo-letter]");
      const outerRing = orbit.querySelector('[data-energy-ring="outer"]');
      const innerRing = orbit.querySelector('[data-energy-ring="inner"]');
      const particleOrbits = orbit.querySelectorAll("[data-particle-orbit]");
      gsap.set(emblem, { transformPerspective: 900, transformOrigin: "50% 50%" });
      gsap.set(emblem, { autoAlpha: 0, scale: 0.76, rotationX: 16, rotationY: -28, filter: "blur(12px)" });
      gsap.set(letters, { autoAlpha: 0, y: 15 });
      gsap.timeline({ defaults: { ease: "power3.out" } }).to(emblem, {
        autoAlpha: 1,
        scale: 1.04,
        rotationX: 0,
        rotationY: 0,
        filter: "blur(0px)",
        duration: 1.15,
        ease: "back.out(1.35)"
      }).to(emblem, { scale: 1, duration: 0.36, ease: "power2.out" }, "-=0.25").to(letters, { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.11 }, "-=0.62").fromTo(
        [outerRing, innerRing].filter(Boolean),
        { autoAlpha: 0, scale: 0.84 },
        { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.12 },
        "-=0.85"
      ).fromTo(
        particleOrbits,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.55, stagger: 0.14 },
        "-=0.55"
      );
      gsap.to(emblem, { y: -7, duration: 3.8, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.55 });
      if (outerRing) gsap.to(outerRing, { rotation: 360, duration: 34, ease: "none", repeat: -1, delay: 1.4 });
      if (innerRing) gsap.to(innerRing, { rotation: -360, duration: 25, ease: "none", repeat: -1, delay: 1.4 });
      particleOrbits.forEach((particleOrbit, index) => {
        gsap.to(particleOrbit, {
          rotation: index % 2 ? -360 : 360,
          duration: index % 2 ? 19 : 27,
          ease: "none",
          repeat: -1,
          delay: 1.5
        });
      });
      gsap.to(orbit, {
        y: -18,
        scale: 0.96,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 }
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const rotateX = gsap.quickTo(emblem, "rotationX", { duration: 0.55, ease: "power3.out" });
        const rotateY = gsap.quickTo(emblem, "rotationY", { duration: 0.55, ease: "power3.out" });
        const moveX = gsap.quickTo(emblem, "x", { duration: 0.55, ease: "power3.out" });
        const moveY = gsap.quickTo(emblem, "y", { duration: 0.55, ease: "power3.out" });
        const onPointerMove = (event) => {
          const bounds = orbit.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          rotateX(-y * 9);
          rotateY(x * 12);
          moveX(x * 5);
          moveY(y * 4 - 7);
        };
        const onPointerLeave = () => {
          rotateX(0);
          rotateY(0);
          moveX(0);
          moveY(-7);
        };
        orbit.addEventListener("pointermove", onPointerMove);
        orbit.addEventListener("pointerleave", onPointerLeave);
        removePointerListeners = () => {
          orbit.removeEventListener("pointermove", onPointerMove);
          orbit.removeEventListener("pointerleave", onPointerLeave);
        };
      }
    }, hero);
    return () => {
      removePointerListeners();
      context.revert();
    };
  }, []);
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      var _a;
      (_a = document.getElementById(hash)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, shown]);
  useEffect(() => {
    setMobileDeckExpanded(false);
  }, [category, query]);
  useEffect(() => {
    if (!mobileDeckExpanded) return;
    const closeDeck = (event) => {
      if (storyRoot.current && !storyRoot.current.contains(event.target)) {
        setMobileDeckExpanded(false);
      }
    };
    document.addEventListener("pointerdown", closeDeck);
    return () => document.removeEventListener("pointerdown", closeDeck);
  }, [mobileDeckExpanded]);
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.style.overflow = previousRoot;
    };
  }, [active]);
  useEffect(() => () => {
    var _a;
    return (_a = dialogAnimation.current) == null ? void 0 : _a.revert();
  }, []);
  const openDetails = (card, trigger) => {
    dialogTrigger.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setActive(card);
    requestAnimationFrame(() => {
      var _a, _b;
      const modal = dialog.current;
      const content = modal == null ? void 0 : modal.querySelector(".course-dialog__inner");
      if (!modal || !content) return;
      if (!modal.open) modal.showModal();
      (_a = modal.querySelector(".course-dialog__close")) == null ? void 0 : _a.focus({ preventScroll: true });
      (_b = dialogAnimation.current) == null ? void 0 : _b.revert();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      dialogAnimation.current = gsap.context(() => {
        const visual = modal.querySelector(".course-dialog__visual");
        const title = modal.querySelector(".course-dialog__content h2");
        const cards = modal.querySelectorAll(".course-dialog__subcourse");
        const actions = modal.querySelector(".course-dialog__actions");
        const timeline = gsap.timeline();
        timeline.fromTo(
          content,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform,opacity,visibility" }
        );
        if (visual) timeline.fromTo(visual, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.38, ease: "power2.out", clearProps: "transform,opacity,visibility" }, "-=0.2");
        if (title) timeline.fromTo(title, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity,visibility" }, "-=0.18");
        if (cards.length) timeline.fromTo(cards, { autoAlpha: 0, y: 12, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.055, ease: "power2.out", clearProps: "transform,opacity,visibility" }, "-=0.12");
        if (actions) timeline.fromTo(actions, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "transform,opacity,visibility" }, "-=0.12");
      }, modal);
    });
  };
  const closeDetails = () => {
    var _a;
    const modal = dialog.current;
    const content = modal == null ? void 0 : modal.querySelector(".course-dialog__inner");
    if (!(modal == null ? void 0 : modal.open) || !content || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      modal == null ? void 0 : modal.close();
      return;
    }
    (_a = dialogAnimation.current) == null ? void 0 : _a.revert();
    dialogAnimation.current = gsap.context(() => {
      gsap.to(content, {
        autoAlpha: 0,
        y: 12,
        scale: 0.99,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => modal.close()
      });
    }, modal);
  };
  const enquiry = (courseName) => {
    navigate("/enquiry", courseName ? { state: { course: courseName } } : void 0);
  };
  const resetFilters = () => {
    setQuery("");
    setCategory("");
  };
  return /* @__PURE__ */ jsxs("section", { className: "courses-page", "aria-labelledby": "courses-title", children: [
    /* @__PURE__ */ jsx("div", { className: "course-bubbles", "aria-hidden": "true", children: Array.from({ length: 10 }, (_, index) => /* @__PURE__ */ jsx("span", { className: `course-bubble course-bubble--${index + 1}` }, index)) }),
    /* @__PURE__ */ jsxs("header", { ref: heroRef, className: "courses-hero", children: [
      /* @__PURE__ */ jsx("div", { className: "courses-hero__glow", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs("div", { className: "courses-hero__copy", children: [
        /* @__PURE__ */ jsx("p", { className: "courses-kicker courses-hero__kicker", children: "Learn. Achieve. Become." }),
        /* @__PURE__ */ jsx("h1", { id: "courses-title", children: "Discover Your Future with the Right Course" }),
        /* @__PURE__ */ jsx("p", { children: "Build strong foundations, develop practical skills, and move confidently toward the future you imagine." }),
        /* @__PURE__ */ jsxs("a", { className: "courses-primary", href: "#course-list", children: [
          "Explore Courses ",
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "↓" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { ref: orbitRef, className: "courses-hero__orbit", role: "img", "aria-label": "AST Education logo", children: [
        /* @__PURE__ */ jsx("span", { className: "courses-hero__energy-ring courses-hero__energy-ring--outer", "data-energy-ring": "outer", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__energy-ring courses-hero__energy-ring--inner", "data-energy-ring": "inner", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__particle-orbit courses-hero__particle-orbit--one", "data-particle-orbit": true, "aria-hidden": "true", children: /* @__PURE__ */ jsx("i", {}) }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__particle-orbit courses-hero__particle-orbit--two", "data-particle-orbit": true, "aria-hidden": "true", children: /* @__PURE__ */ jsx("i", {}) }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__education-object courses-hero__education-object--book", "aria-hidden": "true", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 32 32", focusable: "false", children: /* @__PURE__ */ jsx("path", { d: "M16 9c-4-3-8-3-12-1v16c4-2 8-2 12 1 4-3 8-3 12-1V8c-4-2-8-2-12 1Zm0 0v16M7 12c2-.5 4 0 6 1m12-1c-2-.5-4 0-6 1" }) }) }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__education-object courses-hero__education-object--cap", "aria-hidden": "true", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 32 32", focusable: "false", children: /* @__PURE__ */ jsx("path", { d: "m3 12 13-7 13 7-13 7L3 12Zm5 3v7c5 4 11 4 16 0v-7m5-2v8m0 0-2 3m2-3 2 3" }) }) }),
        /* @__PURE__ */ jsx("span", { className: "courses-hero__education-object courses-hero__education-object--code", "aria-hidden": "true", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 32 32", focusable: "false", children: /* @__PURE__ */ jsx("path", { d: "m11 9-7 7 7 7m10-14 7 7-7 7m-2-19-5 24" }) }) }),
        /* @__PURE__ */ jsxs("div", { ref: emblemRef, className: "courses-hero__emblem", children: [
          /* @__PURE__ */ jsxs("span", { className: "courses-hero__emblem-mark", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("span", { "data-logo-letter": true, children: "A" }),
            /* @__PURE__ */ jsx("span", { "data-logo-letter": true, children: "S" }),
            /* @__PURE__ */ jsx("span", { "data-logo-letter": true, children: "T" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "courses-hero__emblem-name", children: "AST" }),
          /* @__PURE__ */ jsx("span", { className: "courses-hero__emblem-caption", children: "EDUCATION" })
        ] }),
        /* @__PURE__ */ jsxs("b", { children: [
          "Learn",
          /* @__PURE__ */ jsx("br", {}),
          "Build",
          /* @__PURE__ */ jsx("br", {}),
          "Grow"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("a", { className: "courses-scroll", href: "#course-list", "aria-label": "Scroll to courses", children: [
        /* @__PURE__ */ jsx("span", { children: "Scroll to explore" }),
        /* @__PURE__ */ jsx("i", { "aria-hidden": "true" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "courses-content", id: "course-list", children: [
      /* @__PURE__ */ jsxs("header", { className: "courses-heading", "data-reveal": true, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "courses-kicker courses-kicker--dark", children: "Programme catalogue" }),
          /* @__PURE__ */ jsx("h2", { children: "Find your direction" })
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          shown.length,
          " of ",
          state.items.length,
          " programmes"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "course-tools", role: "search", "data-reveal": true, children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "course-search", children: "Search courses" }),
        /* @__PURE__ */ jsx("span", { className: "course-tools__icon", "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "course-search",
            type: "search",
            value: query,
            onChange: (event) => setQuery(event.target.value),
            placeholder: "Search courses, categories, or topics"
          }
        ),
        query && /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "Clear course search", onClick: () => setQuery(""), children: "×" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "course-filter", role: "group", "aria-label": "Filter courses by category", "data-reveal": true, children: [
        /* @__PURE__ */ jsxs("button", { type: "button", "aria-pressed": !category, onClick: () => setCategory(""), children: [
          "All Courses ",
          /* @__PURE__ */ jsx("span", { children: state.items.length })
        ] }),
        CATEGORY_NAV.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": category === item.key,
            onClick: () => setCategory(item.key),
            children: [
              item.label,
              " ",
              /* @__PURE__ */ jsx("span", { children: state.items.filter((course) => course.category === item.key).length })
            ]
          },
          item.key
        ))
      ] }),
      state.availability === "loading" && /* @__PURE__ */ jsx("p", { className: "course-status", role: "status", children: "Loading courses..." }),
      state.availability === "fallback" && /* @__PURE__ */ jsxs("p", { className: "course-status course-status--fallback", role: "status", children: [
        "Live course information is unavailable. Showing approved course details from ",
        APPROVED_LIST_DATE,
        "."
      ] }),
      categoryCards.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "course-empty", "data-reveal": true, children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ jsx("h3", { children: "No matching courses" }),
        /* @__PURE__ */ jsx("p", { children: "Try another search or explore all categories." }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: resetFilters, children: "Reset filters" })
      ] }) : /* @__PURE__ */ jsx(
        "div",
        {
          className: `course-card-fan${mobileDeckExpanded ? " course-card-fan--mobile-expanded" : ""}`,
          ref: storyRoot,
          role: "group",
          "aria-label": "AST course card deck",
          "aria-expanded": mobileDeckExpanded,
          onClick: (event) => {
            if (event.target === event.currentTarget && window.matchMedia("(max-width: 980px)").matches) {
              setMobileDeckExpanded((expanded) => !expanded);
            }
          },
          children: categoryCards.map((card, index) => /* @__PURE__ */ jsxs(
            "article",
            {
              className: `premium-course-card premium-course-card--${card.key}`,
              id: CATEGORY_SECTION_IDS[card.key],
              "data-reveal": true,
              style: { "--card-index": index },
              onPointerMove: (event) => {
                if (event.pointerType === "touch") return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                event.currentTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 9}deg`);
                event.currentTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 9}deg`);
                event.currentTarget.style.setProperty("--light-x", `${x * 100}%`);
                event.currentTarget.style.setProperty("--light-y", `${y * 100}%`);
              },
              onPointerLeave: (event) => {
                event.currentTarget.style.setProperty("--tilt-x", "0deg");
                event.currentTarget.style.setProperty("--tilt-y", "0deg");
              },
              onClick: (event) => {
                event.stopPropagation();
                if (window.matchMedia("(max-width: 980px)").matches && !mobileDeckExpanded) {
                  setMobileDeckExpanded(true);
                  return;
                }
                openDetails(card, event.currentTarget);
              },
              role: "button",
              tabIndex: 0,
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(card, event.currentTarget);
                }
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "premium-course-card__symbols", "aria-hidden": "true", children: CATEGORY_SYMBOLS[card.key].map((symbol, symbolIndex) => /* @__PURE__ */ jsx("span", { style: { "--symbol-index": symbolIndex }, children: symbol }, symbol)) }),
                /* @__PURE__ */ jsx("div", { className: "premium-course-card__glare", "aria-hidden": "true" }),
                /* @__PURE__ */ jsx(CourseIllustration, { category: card.key }),
                /* @__PURE__ */ jsxs("div", { className: "premium-course-card__top", children: [
                  /* @__PURE__ */ jsx("span", { children: CATEGORY_MARKS[card.key] }),
                  /* @__PURE__ */ jsx("b", { children: CATEGORY_GLYPH[card.key] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "premium-course-card__body", children: [
                  /* @__PURE__ */ jsx("p", { children: card.label }),
                  /* @__PURE__ */ jsx("h3", { children: card.label }),
                  /* @__PURE__ */ jsx("span", { className: "premium-course-card__summary", children: card.description }),
                  /* @__PURE__ */ jsx("span", { className: "premium-course-card__course-list", children: card.courses.map((course) => course.name).join(", ") }),
                  /* @__PURE__ */ jsxs("button", { type: "button", tabIndex: -1, children: [
                    "View course details ",
                    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "↗" })
                  ] })
                ] })
              ]
            },
            card.key
          ))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "courses-admission", "aria-labelledby": "admission-title", children: [
      /* @__PURE__ */ jsxs("div", { className: "courses-admission__copy", children: [
        /* @__PURE__ */ jsx("p", { className: "courses-kicker", children: "Admissions" }),
        /* @__PURE__ */ jsx("h2", { id: "admission-title", children: "Need help choosing the right course?" }),
        /* @__PURE__ */ jsx("p", { children: "Speak with our team and take your next step with confidence." })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => enquiry(), children: [
        "Submit an enquiry ",
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "dialog",
      {
        ref: dialog,
        className: "course-dialog",
        "aria-labelledby": active ? "course-dialog-title" : void 0,
        onClose: () => {
          var _a;
          (_a = dialogAnimation.current) == null ? void 0 : _a.revert();
          dialogAnimation.current = null;
          const trigger = dialogTrigger.current;
          dialogTrigger.current = null;
          if (trigger == null ? void 0 : trigger.isConnected) trigger.focus({ preventScroll: true });
          setActive(null);
        },
        onCancel: (event) => {
          event.preventDefault();
          closeDetails();
        },
        onKeyDown: (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDetails();
          }
        },
        onClick: (event) => {
          if (event.target === event.currentTarget) closeDetails();
        },
        children: active && /* @__PURE__ */ jsxs("div", { className: "course-dialog__inner", children: [
          /* @__PURE__ */ jsx("button", { className: "course-dialog__close", type: "button", "aria-label": "Close course details", onClick: closeDetails, children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "×" }) }),
          /* @__PURE__ */ jsxs("div", { className: `course-dialog__visual premium-course-card--${active.key}`, "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxs("span", { className: "course-dialog__number", children: [
              "PROGRAMME ",
              CATEGORY_MARKS[active.key] ?? "01"
            ] }),
            /* @__PURE__ */ jsx(
              CourseMotionVisual,
              {
                category: active.key,
                className: "course-dialog__motion"
              },
              active.key
            ),
            /* @__PURE__ */ jsx("div", { className: "course-dialog__visual-copy", children: /* @__PURE__ */ jsx("span", { children: "AST Education" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "course-dialog__content", children: [
            /* @__PURE__ */ jsx("h2", { id: "course-dialog-title", children: active.label }),
            /* @__PURE__ */ jsx("div", { className: "course-dialog__subcourses", "aria-label": `${active.label} sub-courses`, children: CATEGORY_SUBCOURSES[active.key].map((course) => /* @__PURE__ */ jsxs("article", { className: "course-dialog__subcourse", children: [
              /* @__PURE__ */ jsx("span", { className: "course-dialog__subcourse-icon", "aria-hidden": "true", children: course.icon }),
              /* @__PURE__ */ jsx("strong", { children: course.name })
            ] }, course.name)) }),
            /* @__PURE__ */ jsxs("div", { className: "course-dialog__actions", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => enquiry(active.label), children: "Admission enquiry" }),
              /* @__PURE__ */ jsx("a", { href: "https://wa.me/919690766514", target: "_blank", rel: "noopener noreferrer", children: "WhatsApp enquiry" })
            ] })
          ] })
        ] })
      }
    )
  ] });
}
const CoursesPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CoursesPage
}, Symbol.toStringTag, { value: "Module" }));
const COURSE_OPTIONS = [
  "LKG to Class 12",
  "Academic Coaching",
  "Subject-wise Support",
  "B.A.",
  "B.Com",
  "B.Tech",
  "Academic Support",
  "Basic Computer",
  "DCA",
  "ADCA",
  "CCC",
  "Tally",
  "MS Office",
  "Advanced Excel",
  "Coding Classes",
  "Programming Education",
  "Technical Skill Development",
  "English Speaking",
  "Communication Skills",
  "Motivation",
  "Personality Development",
  "Not sure yet"
];
const QUALIFICATIONS = ["Class 10", "Class 12", "Undergraduate", "Graduate", "Postgraduate", "Other"];
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^(\+91)?[6-9]\d{9}$/;
const enquirySchema = z.object({
  studentName: z.string().trim().min(2, "Enter at least 2 characters").max(80, "Use 80 characters or fewer").regex(NAME_RE, "Use letters, spaces, dots, apostrophes or hyphens only"),
  mobile: z.string().trim().refine((v) => MOBILE_RE.test(v.replace(/[\s()-]/g, "")), "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().max(120, "Use 120 characters or fewer").refine((v) => v === "" || EMAIL_RE.test(v), "Enter a valid email address, or leave this empty"),
  qualification: z.string().min(1, "Choose a qualification"),
  course: z.string().min(1, "Choose a course, or select Not sure yet"),
  message: z.string().max(500, "Use 500 characters or fewer"),
  consent: z.boolean().refine((v) => v === true, "Tick the consent box to continue"),
  website: z.string().max(200)
});
function buildWhatsAppUrl(d, whatsappNumber) {
  const text = [
    "Hello AST Education, I would like to enquire about admission.",
    "",
    `Student Name: ${d.studentName}`,
    `Mobile Number: ${d.mobile}`,
    `Email: ${d.email || "Not provided"}`,
    `Qualification: ${d.qualification}`,
    `Interested Course: ${d.course}`,
    `Message: ${d.message || "None"}`
  ].join("\n");
  const digits = whatsappNumber.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : "";
}
const STEPS = [
  { title: "Send your enquiry", text: "Fill in the form above with your details and the course you are interested in." },
  { title: "We contact you", text: "Our team reviews your enquiry and contacts you on the number you share, as the consent above describes." },
  { title: "Fees and course details", text: "Course fees and detailed information are shared when you enquire." },
  { title: "Follow-up", text: "Ask us anything else by phone or WhatsApp, and our team will guide you through the next steps." }
];
function AdmissionProcess() {
  return /* @__PURE__ */ jsxs("section", { className: "admission-process", "aria-labelledby": "admission-process-title", children: [
    /* @__PURE__ */ jsx("h2", { id: "admission-process-title", children: "How the admission enquiry works" }),
    /* @__PURE__ */ jsx("ol", { className: "clay-timeline", children: STEPS.map((step, index) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx("span", { className: "clay-milestone-dot", "aria-hidden": "true", children: index + 1 }),
      /* @__PURE__ */ jsxs("article", { className: "clay-milestone", children: [
        /* @__PURE__ */ jsx("h3", { children: step.title }),
        /* @__PURE__ */ jsx("p", { children: step.text })
      ] })
    ] }, step.title)) })
  ] });
}
function ContactAssistance() {
  const { facts } = useFacts();
  const digits = (facts.whatsapp ?? "").replace(/\D/g, "");
  const tel = (facts.phone ?? "").replace(/\s/g, "");
  return /* @__PURE__ */ jsxs("section", { className: "card contact-assist", "aria-labelledby": "contact-assist-title", children: [
    /* @__PURE__ */ jsx("h2", { id: "contact-assist-title", children: "Need help before you enquire?" }),
    /* @__PURE__ */ jsx("p", { children: "Call or WhatsApp our team if you have questions before you send the form." }),
    /* @__PURE__ */ jsxs("div", { className: "row", children: [
      tel && /* @__PURE__ */ jsxs("a", { className: "btn btn-n", href: `tel:${tel}`, children: [
        "Call ",
        facts.phone
      ] }),
      digits && /* @__PURE__ */ jsx("a", { className: "btn btn-g", href: `https://wa.me/${digits}`, target: "_blank", rel: "noopener noreferrer", children: "WhatsApp us" })
    ] }),
    facts.hours && /* @__PURE__ */ jsxs("p", { className: "hint", children: [
      "Working hours: ",
      facts.hours
    ] }),
    facts.address && /* @__PURE__ */ jsx("p", { className: "hint", children: facts.address })
  ] });
}
const EMPTY = {
  studentName: "",
  mobile: "",
  email: "",
  qualification: "",
  course: "",
  message: "",
  consent: false,
  website: ""
};
const COOLDOWN_MS = 2e4;
function Field({ id, label, error, hint, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { htmlFor: id, children: label }),
    children,
    hint && /* @__PURE__ */ jsx("p", { className: "hint", id: `${id}-hint`, children: hint }),
    error && /* @__PURE__ */ jsx("p", { className: "err", id: `${id}-error`, role: "alert", children: error })
  ] });
}
function EnquiryPage() {
  var _a, _b, _c, _d, _e, _f, _g;
  const { facts } = useFacts();
  const whatsapp2 = facts.whatsapp ?? "";
  const whatsappDigits = whatsapp2.replace(/\D/g, "");
  const presetCourse = ((_a = useLocation().state) == null ? void 0 : _a.course) ?? "";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(enquirySchema), defaultValues: { ...EMPTY, course: presetCourse }, mode: "onTouched" });
  const [done, setDone] = useState(null);
  const [cooling, setCooling] = useState(false);
  const [formError, setFormError] = useState("");
  const [courseOptions, setCourseOptions] = useState(COURSE_OPTIONS);
  useEffect(() => {
    publicGet("/courses").then(({ items }) => setCourseOptions(Array.from(/* @__PURE__ */ new Set([...items.map((course) => course.name), "Not sure yet"])))).catch(() => setCourseOptions(COURSE_OPTIONS));
  }, []);
  const describe = (k) => errors[k] ? `${String(k)}-error` : void 0;
  async function onSubmit(data) {
    var _a2, _b2;
    setFormError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePage: "/enquiry" })
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        setDone({ waUrl: buildWhatsAppUrl(data, whatsappDigits) });
        setCooling(true);
        window.setTimeout(() => setCooling(false), COOLDOWN_MS);
        return;
      }
      if (res.status === 400 && ((_a2 = body == null ? void 0 : body.error) == null ? void 0 : _a2.fields)) {
        Object.entries(body.error.fields).forEach(
          ([field, msgs]) => setError(field, { message: msgs[0] })
        );
        setFormError("Please check the highlighted fields.");
        return;
      }
      setFormError(((_b2 = body == null ? void 0 : body.error) == null ? void 0 : _b2.message) ?? "We could not record your enquiry. Please try again.");
    } catch {
      setFormError("We could not reach the server. Please try again.");
    }
  }
  if (done) {
    return /* @__PURE__ */ jsx("section", { className: "wrap sec", "aria-labelledby": "h-enq", children: /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
      /* @__PURE__ */ jsx("h1", { id: "h-enq", tabIndex: -1, children: "Admission Enquiry" }),
      /* @__PURE__ */ jsxs("div", { className: "note", role: "status", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Thank you. Your enquiry has been recorded." }),
          " Our team may contact you on the number you provided."
        ] }),
        done.waUrl && /* @__PURE__ */ jsx("p", { children: "You can also message us on WhatsApp with your details already filled in." }),
        /* @__PURE__ */ jsxs("div", { className: "row", children: [
          done.waUrl && /* @__PURE__ */ jsx("a", { className: "btn btn-o", href: done.waUrl, target: "_blank", rel: "noopener noreferrer", children: "Open WhatsApp" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", disabled: cooling, onClick: () => setDone(null), children: cooling ? "Please wait a moment" : "Send another enquiry" })
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec", "aria-labelledby": "h-enq", children: [
    /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
      /* @__PURE__ */ jsx("h1", { id: "h-enq", tabIndex: -1, children: "Admission Enquiry" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Share your details and our team will contact you. We store enquiries securely so we can respond. Read our ",
        /* @__PURE__ */ jsx("a", { href: "/privacy", children: "Privacy Policy" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("form", { noValidate: true, onSubmit: handleSubmit(onSubmit), children: [
        /* @__PURE__ */ jsx(Field, { id: "studentName", label: "Student name", error: (_b = errors.studentName) == null ? void 0 : _b.message, children: /* @__PURE__ */ jsx("input", { id: "studentName", autoComplete: "name", maxLength: 80, "aria-invalid": !!errors.studentName, "aria-describedby": describe("studentName"), ...register("studentName") }) }),
        /* @__PURE__ */ jsx(Field, { id: "mobile", label: "Mobile number", hint: "10-digit Indian mobile number. +91 is optional.", error: (_c = errors.mobile) == null ? void 0 : _c.message, children: /* @__PURE__ */ jsx("input", { id: "mobile", type: "tel", inputMode: "numeric", autoComplete: "tel-national", maxLength: 16, "aria-invalid": !!errors.mobile, "aria-describedby": describe("mobile") ?? "mobile-hint", ...register("mobile") }) }),
        /* @__PURE__ */ jsx(Field, { id: "email", label: "Email address (optional)", error: (_d = errors.email) == null ? void 0 : _d.message, children: /* @__PURE__ */ jsx("input", { id: "email", type: "email", autoComplete: "email", maxLength: 120, "aria-invalid": !!errors.email, "aria-describedby": describe("email"), ...register("email") }) }),
        /* @__PURE__ */ jsx(Field, { id: "qualification", label: "Qualification", error: (_e = errors.qualification) == null ? void 0 : _e.message, children: /* @__PURE__ */ jsxs("select", { id: "qualification", "aria-invalid": !!errors.qualification, "aria-describedby": describe("qualification"), ...register("qualification"), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select a qualification" }),
          QUALIFICATIONS.map((q) => /* @__PURE__ */ jsx("option", { value: q, children: q }, q))
        ] }) }),
        /* @__PURE__ */ jsx(Field, { id: "course", label: "Interested course", error: (_f = errors.course) == null ? void 0 : _f.message, children: /* @__PURE__ */ jsxs("select", { id: "course", "aria-invalid": !!errors.course, "aria-describedby": describe("course"), ...register("course"), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select a course" }),
          courseOptions.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] }) }),
        /* @__PURE__ */ jsx(Field, { id: "message", label: "Message (optional)", hint: "Up to 500 characters.", error: (_g = errors.message) == null ? void 0 : _g.message, children: /* @__PURE__ */ jsx("textarea", { id: "message", rows: 4, maxLength: 500, "aria-invalid": !!errors.message, "aria-describedby": describe("message") ?? "message-hint", ...register("message") }) }),
        /* @__PURE__ */ jsxs("div", { className: "check", children: [
          /* @__PURE__ */ jsx("input", { id: "consent", type: "checkbox", "aria-invalid": !!errors.consent, "aria-describedby": describe("consent"), ...register("consent") }),
          /* @__PURE__ */ jsxs("label", { htmlFor: "consent", children: [
            "I agree that AST Education may contact me about this enquiry. I have read the ",
            /* @__PURE__ */ jsx("a", { href: "/privacy", children: "Privacy Policy" }),
            "."
          ] })
        ] }),
        errors.consent && /* @__PURE__ */ jsx("p", { className: "err", id: "consent-error", role: "alert", children: errors.consent.message }),
        /* @__PURE__ */ jsxs("div", { className: "hp", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "website", children: "Leave this field empty" }),
          /* @__PURE__ */ jsx("input", { id: "website", tabIndex: -1, autoComplete: "off", ...register("website") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", disabled: isSubmitting, children: isSubmitting ? "Sending…" : "Send enquiry" }) }),
        formError && /* @__PURE__ */ jsxs("div", { className: "note", role: "alert", style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsx("p", { children: formError }),
          whatsappDigits && /* @__PURE__ */ jsxs("p", { children: [
            "You can also message us on WhatsApp: ",
            /* @__PURE__ */ jsx("a", { href: `https://wa.me/${whatsappDigits}`, target: "_blank", rel: "noopener noreferrer", children: whatsapp2 }),
            "."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
      /* @__PURE__ */ jsx(AdmissionProcess, {}),
      /* @__PURE__ */ jsx(ContactAssistance, {})
    ] })
  ] });
}
const EnquiryPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EnquiryPage
}, Symbol.toStringTag, { value: "Module" }));
const CATEGORIES = {
  "institute-building": "Institute Building",
  classrooms: "Classrooms",
  "computer-lab": "Computer Lab",
  faculty: "Faculty",
  students: "Students",
  "educational-activities": "Educational Activities",
  events: "Events"
};
function GalleryPage() {
  const [state, setState] = useState(loadingWith([]));
  const [category, setCategory] = useState("");
  const [index, setIndex] = useState(null);
  const dialog = useRef(null);
  useEffect(() => {
    publicGet("/gallery").then((r) => setState(settle({ ok: true, items: r.items }, []))).catch(() => setState(settle({ ok: false }, [])));
  }, []);
  const shown = state.items.filter((p) => !category || p.category === category);
  const current = index !== null ? shown[index] : void 0;
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);
  const step = (delta) => setIndex((i) => i === null || shown.length === 0 ? null : (i + delta + shown.length) % shown.length);
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec", "aria-labelledby": "h-gal", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-gal", tabIndex: -1, children: "Gallery" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Explore institute photographs or ",
      /* @__PURE__ */ jsx(Link, { to: "/videos", children: "watch AST Education videos" }),
      "."
    ] }),
    state.availability === "loading" && /* @__PURE__ */ jsx("p", { role: "status", children: "Checking the latest photographs…" }),
    state.availability === "fallback" && /* @__PURE__ */ jsx("div", { className: "note", role: "status", children: "Photographs are temporarily unavailable. Please try again later." }),
    state.availability === "live" && state.items.length === 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { children: "Photographs of the institute will appear here once the institute confirms permission to publish them." }),
      /* @__PURE__ */ jsx("div", { className: "empty", children: "No verified photographs are published yet. Categories: Institute Building, Classrooms, Computer Lab, Faculty, Students, Educational Activities and Events." })
    ] }),
    state.availability === "live" && state.items.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "filters", role: "group", "aria-label": "Filter photographs by category", children: [
        /* @__PURE__ */ jsx("button", { className: "chip", type: "button", "aria-pressed": category === "", onClick: () => setCategory(""), children: "All photographs" }),
        Object.entries(CATEGORIES).map(([key, label]) => /* @__PURE__ */ jsx("button", { className: "chip", type: "button", "aria-pressed": category === key, onClick: () => setCategory(key), children: label }, key))
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "hint", "aria-live": "polite", children: [
        shown.length,
        " ",
        shown.length === 1 ? "photograph" : "photographs"
      ] }),
      shown.length === 0 ? /* @__PURE__ */ jsx("div", { className: "empty", children: "No photographs in this category yet." }) : /* @__PURE__ */ jsx("div", { className: "grid", children: shown.map((p, i) => /* @__PURE__ */ jsxs("button", { type: "button", className: "thumb", onClick: () => setIndex(i), "aria-label": `Open photograph: ${p.altText}`, children: [
        /* @__PURE__ */ jsx("img", { src: p.src, srcSet: p.srcSet, sizes: "(min-width: 760px) 30vw, 90vw", width: p.width, height: p.height, alt: "", loading: "lazy" }),
        p.caption && /* @__PURE__ */ jsx("span", { className: "hint", style: { display: "block", marginTop: 6 }, children: p.caption })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      "dialog",
      {
        ref: dialog,
        "aria-label": "Photograph viewer",
        onClose: () => setIndex(null),
        onKeyDown: (e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        },
        style: { border: 0, borderRadius: 12, padding: 0, width: "min(860px, 94vw)" },
        children: current && /* @__PURE__ */ jsxs("div", { style: { padding: 16 }, children: [
          /* @__PURE__ */ jsx("button", { className: "x", type: "button", "aria-label": "Close photograph", onClick: () => {
            var _a;
            return (_a = dialog.current) == null ? void 0 : _a.close();
          }, children: "×" }),
          /* @__PURE__ */ jsx("img", { src: current.src, srcSet: current.srcSet, sizes: "(min-width: 900px) 860px, 94vw", width: current.width, height: current.height, alt: current.altText, style: { width: "100%", height: "auto", borderRadius: 8 } }),
          current.caption && /* @__PURE__ */ jsx("p", { className: "hint", children: current.caption }),
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => step(-1), children: "Previous" }),
            /* @__PURE__ */ jsx("button", { className: "btn btn-g", type: "button", onClick: () => step(1), children: "Next" }),
            /* @__PURE__ */ jsxs("span", { className: "hint", children: [
              (index ?? 0) + 1,
              " of ",
              shown.length
            ] })
          ] })
        ] })
      }
    )
  ] });
}
const GalleryPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: GalleryPage
}, Symbol.toStringTag, { value: "Module" }));
const OWNER_QUOTE = "CONFIDENCE AND HARD WORK IS THE BEST MEDICINE TO KILL THE DISEASE CALLED FAILURE. IT WILL MAKE YOU A SUCCESSFUL PERSON.";
const MANAGER_QUOTE = "EDUCATION IS THE PASSPORT TO THE FUTURE, FOR TOMORROW BELONG TO THOSE WHO PREPARE FOR IT TODAY.";
const PROFILES = {
  director: {
    role: "Director & Chairman",
    accent: "gold",
    defaults: {
      profileType: "director",
      designation: "Director & Chairman",
      name: "Ankit Chauhan",
      qualifications: "B.Tech, M.Tech",
      experience: "15 Years of Marketing Experience",
      biography: "Leading AST Education with a vision of excellence, innovation, and quality education. Bringing 15 years of marketing experience and a strong commitment towards institutional growth and student success.",
      responsibilities: "Provides institutional direction, supports strategic growth, strengthens educational partnerships, and oversees the long-term development of AST Education.",
      teachingManagement: "Guides academic and administrative priorities while encouraging innovation, quality standards, and student-focused institutional practices.",
      visionMission: "To build an institution driven by excellence, innovation, quality education, and meaningful student success.",
      quote: OWNER_QUOTE
    }
  },
  manager: {
    role: "General Manager & Teacher",
    accent: "blue",
    defaults: {
      profileType: "manager",
      designation: "General Manager & Teacher",
      name: "Shalu",
      biography: "Dedicated to educational excellence and effective institutional management. Passionate about supporting students, maintaining academic standards, and creating a positive learning environment.",
      responsibilities: "Supports daily institutional operations, coordinates academic activities, assists staff and students, and helps maintain an organized and supportive learning environment.",
      teachingManagement: "Combines classroom teaching with practical management, student guidance, academic coordination, and consistent communication with the educational team.",
      skills: "Academic coordination, teaching, student support, communication, administration, and educational management.",
      visionMission: "To create a positive, disciplined, and student-focused learning environment that encourages academic progress and personal development.",
      quote: MANAGER_QUOTE
    }
  }
};
function LeadershipPage() {
  const [state, setState] = useState(loadingWith([]));
  const [selected, setSelected] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    publicGet("/leadership").then((r) => setState(settle({ ok: true, items: r.items }, []))).catch(() => setState(settle({ ok: false }, [])));
  }, []);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selected]);
  function openProfile(profile) {
    setSelected(profile);
    requestAnimationFrame(() => {
      var _a;
      return (_a = dialogRef.current) == null ? void 0 : _a.showModal();
    });
  }
  function closeProfile() {
    var _a;
    (_a = dialogRef.current) == null ? void 0 : _a.close();
    setSelected(null);
  }
  function onKeyActivate(event, profile) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProfile(profile);
    }
  }
  function tilt(event) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${y * -8}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 10}deg`);
  }
  function resetTilt(event) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  }
  const selectedType = (selected == null ? void 0 : selected.profileType) ?? "";
  const selectedConfig = PROFILES[selectedType];
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec leadership-section", "aria-labelledby": "h-lead", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-lead", tabIndex: -1, children: "Our Leadership" }),
    /* @__PURE__ */ jsx("p", { className: "leadership-intro", children: "Guided by visionary leadership and a commitment to student success." }),
    state.availability === "loading" && /* @__PURE__ */ jsx("p", { className: "hint", role: "status", children: "Checking verified profiles…" }),
    /* @__PURE__ */ jsx("div", { className: "leadership-grid", children: Object.entries(PROFILES).map(([type, config]) => {
      const serverProfile = state.items.find((item) => item.profileType === type);
      const profile = { ...config.defaults, ...serverProfile, profileType: type };
      return /* @__PURE__ */ jsxs(
        "article",
        {
          className: `leadership-profile leadership-${config.accent}`,
          role: "button",
          tabIndex: 0,
          "aria-label": `View ${profile.name}'s full profile`,
          onClick: () => openProfile(profile),
          onKeyDown: (event) => onKeyActivate(event, profile),
          onPointerMove: tilt,
          onPointerLeave: resetTilt,
          children: [
            /* @__PURE__ */ jsx("div", { className: "leadership-particles", "aria-hidden": "true", children: Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ jsx("span", {}, index)) }),
            /* @__PURE__ */ jsxs("div", { className: "leadership-visual", children: [
              /* @__PURE__ */ jsx("div", { className: "holo-ring holo-ring-one", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("div", { className: "holo-ring holo-ring-two", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("div", { className: "leadership-frame", children: profile.photo && /* @__PURE__ */ jsx("img", { src: profile.photo.src, srcSet: profile.photo.srcSet, alt: `Portrait of ${profile.name}`, width: profile.photo.width, height: profile.photo.height, loading: "lazy" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "leadership-card-copy", children: [
              /* @__PURE__ */ jsx("span", { children: config.role }),
              /* @__PURE__ */ jsx("h2", { children: profile.name }),
              /* @__PURE__ */ jsx("p", { children: profile.biography }),
              /* @__PURE__ */ jsxs("button", { className: "leadership-view", type: "button", tabIndex: -1, children: [
                "View Full Profile ",
                /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
              ] })
            ] })
          ]
        },
        type
      );
    }) }),
    state.availability === "fallback" && /* @__PURE__ */ jsx("p", { className: "note leadership-fallback", role: "status", children: "Showing verified leadership details. Live profile information may be temporarily unavailable." }),
    /* @__PURE__ */ jsx(
      "dialog",
      {
        ref: dialogRef,
        className: `leadership-modal leadership-modal-${selectedType === "manager" ? "blue" : "gold"}`,
        "aria-labelledby": "leadership-modal-title",
        onCancel: (event) => {
          event.preventDefault();
          closeProfile();
        },
        onClose: () => setSelected(null),
        onClick: (event) => {
          if (event.target === event.currentTarget) closeProfile();
        },
        children: selected && selectedConfig && /* @__PURE__ */ jsxs("div", { className: "leadership-modal-shell", children: [
          /* @__PURE__ */ jsx("button", { className: "leadership-close", type: "button", "aria-label": "Close profile", onClick: closeProfile, children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "×" }) }),
          /* @__PURE__ */ jsx("div", { className: "leadership-modal-particles", "aria-hidden": "true", children: Array.from({ length: 18 }, (_, index) => /* @__PURE__ */ jsx("span", {}, index)) }),
          /* @__PURE__ */ jsxs("div", { className: "leadership-modal-portrait", children: [
            /* @__PURE__ */ jsx("div", { className: "holo-ring holo-ring-one", "aria-hidden": "true" }),
            /* @__PURE__ */ jsx("div", { className: "leadership-frame", children: selected.photo && /* @__PURE__ */ jsx("img", { src: selected.photo.src, srcSet: selected.photo.srcSet, alt: `Large portrait of ${selected.name}`, width: selected.photo.width, height: selected.photo.height }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "leadership-modal-content", children: [
            /* @__PURE__ */ jsx("span", { className: "leadership-modal-role", children: selected.designation }),
            /* @__PURE__ */ jsx("h2", { id: "leadership-modal-title", children: selected.name }),
            (selected.qualifications || selected.experience) && /* @__PURE__ */ jsxs("div", { className: "leadership-credentials", children: [
              selected.qualifications && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { children: "Education" }),
                /* @__PURE__ */ jsx("strong", { children: selected.qualifications })
              ] }),
              selected.experience && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { children: "Experience" }),
                /* @__PURE__ */ jsx("strong", { children: selected.experience })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "leadership-detail-grid", children: [
              /* @__PURE__ */ jsxs("section", { children: [
                /* @__PURE__ */ jsx("h3", { children: "Professional Introduction" }),
                /* @__PURE__ */ jsx("p", { children: selected.biography })
              ] }),
              selected.responsibilities && /* @__PURE__ */ jsxs("section", { children: [
                /* @__PURE__ */ jsx("h3", { children: "Responsibilities" }),
                /* @__PURE__ */ jsx("p", { children: selected.responsibilities })
              ] }),
              selected.teachingManagement && /* @__PURE__ */ jsxs("section", { children: [
                /* @__PURE__ */ jsx("h3", { children: "Teaching & Management" }),
                /* @__PURE__ */ jsx("p", { children: selected.teachingManagement })
              ] }),
              selected.visionMission && /* @__PURE__ */ jsxs("section", { children: [
                /* @__PURE__ */ jsx("h3", { children: "Vision & Mission" }),
                /* @__PURE__ */ jsx("p", { children: selected.visionMission })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("blockquote", { className: "leadership-quote", children: [
              /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "“" }),
              /* @__PURE__ */ jsx("p", { children: selected.quote })
            ] })
          ] })
        ] })
      }
    )
  ] });
}
const LeadershipPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LeadershipPage
}, Symbol.toStringTag, { value: "Module" }));
function PrivacyPage() {
  const { facts } = useFacts();
  return /* @__PURE__ */ jsx("section", { className: "wrap sec", "aria-labelledby": "h-priv", children: /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-priv", tabIndex: -1, children: "Privacy Policy" }),
    /* @__PURE__ */ jsx("h2", { children: "What we collect" }),
    /* @__PURE__ */ jsx("p", { children: "When you send an admission enquiry we store the student name, mobile number, email address (if you give one), qualification, the course you are interested in, any message you write, the time you gave consent, and the page you sent the enquiry from. We do not store your IP address with the enquiry." }),
    /* @__PURE__ */ jsx("h2", { children: "Why we use it" }),
    /* @__PURE__ */ jsx("p", { children: "We use these details to respond to your admission enquiry and, if you have agreed, to contact you about it. We do not use them for advertising." }),
    /* @__PURE__ */ jsx("h2", { children: "Who can see it" }),
    /* @__PURE__ */ jsx("p", { children: "Only authorised staff of AST Education can see enquiries, through a password-protected admin area. Enquiries are never published on this website." }),
    /* @__PURE__ */ jsx("h2", { children: "Where it is stored" }),
    /* @__PURE__ */ jsx("p", { children: "Enquiries are stored in the institute’s MongoDB database. The institute must publish the database hosting provider, encryption controls and backup arrangements once its production provider and configuration have been selected. Do not submit sensitive identity or payment information through this form." }),
    /* @__PURE__ */ jsx("h2", { children: "How long we keep it" }),
    /* @__PURE__ */ jsx("p", { children: "Enquiries are retained only for as long as needed to respond and for applicable legal or record-keeping requirements. The institute must set and publish a specific retention and deletion schedule before collecting enquiries on the production website. You may request deletion using the contact number on our Contact page, subject to any legal record-keeping requirement." }),
    /* @__PURE__ */ jsx("h2", { children: "Your choices" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "You can ask us to correct your details, withdraw your consent, or delete your enquiry. Contact us on ",
      facts.phone ?? "the number on our Contact page",
      "."
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Cookies" }),
    /* @__PURE__ */ jsx("p", { children: "The public website does not use analytics or advertising cookies. Staff who sign in to the admin area receive one essential session cookie." }),
    /* @__PURE__ */ jsx("h2", { children: "Embedded videos" }),
    /* @__PURE__ */ jsx("p", { children: "Some videos are embedded from YouTube using its privacy-enhanced player. Video thumbnails are loaded from YouTube when the page displays them; the video player itself loads only when you choose to play a video. YouTube/Google may receive technical information such as your IP address, browser and device details, and may process data under its own privacy policy. AST Education does not control YouTube's data practices." }),
    /* @__PURE__ */ jsx("h2", { children: "Changes to this policy" }),
    /* @__PURE__ */ jsx("p", { children: "Last reviewed: 4 November 2026. This policy must be reviewed whenever the enquiry form, data processors or retention practices change." }),
    /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx(Link, { to: "/enquiry", children: "Back to the admission enquiry" }) })
  ] }) });
}
function TermsPage() {
  return /* @__PURE__ */ jsx("section", { className: "wrap sec", "aria-labelledby": "h-terms", children: /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-terms", tabIndex: -1, children: "Terms of Use" }),
    /* @__PURE__ */ jsx("p", { children: "Information on this website describes AST Education for general information. Course fees and detailed information are shared when you enquire." }),
    /* @__PURE__ */ jsx("p", { children: "AST Education provides coaching, academic support, computer and technical training, and personality development. It does not award university degrees." }),
    /* @__PURE__ */ jsx("h2", { children: "Using this website" }),
    /* @__PURE__ */ jsx("p", { children: "You may use this website to learn about AST Education and submit genuine course enquiries. Do not attempt to disrupt the website, bypass access controls, upload harmful material or use another person’s information without permission." }),
    /* @__PURE__ */ jsx("h2", { children: "Course information" }),
    /* @__PURE__ */ jsx("p", { children: "Course availability, schedules, fees, eligibility and duration may change. They are confirmed by the institute when you enquire or enrol. A website enquiry is not an admission, booking or guarantee of a place." }),
    /* @__PURE__ */ jsx("h2", { children: "Intellectual property" }),
    /* @__PURE__ */ jsx("p", { children: "Unless otherwise stated, the website’s text, branding, graphics and original materials belong to AST Education or their respective rights holders. You may not reproduce or commercially reuse them without permission." }),
    /* @__PURE__ */ jsx("h2", { children: "External services" }),
    /* @__PURE__ */ jsx("p", { children: "This website may link to third-party services such as YouTube, Google Maps and WhatsApp. Those services operate under their own terms and privacy policies; AST Education does not control their availability or practices." }),
    /* @__PURE__ */ jsx("h2", { children: "Availability and changes" }),
    /* @__PURE__ */ jsx("p", { children: "We aim to keep information accurate and the website available, but do not guarantee uninterrupted access or that every page is error-free. We may update website content and these terms when needed." }),
    /* @__PURE__ */ jsx("h2", { children: "Contact" }),
    /* @__PURE__ */ jsx("p", { children: "For questions about these terms, contact AST Education using the details on our Contact page. These terms should be reviewed by the institute before production publication." })
  ] }) });
}
function NotFoundPage() {
  return /* @__PURE__ */ jsx("section", { className: "wrap sec", "aria-labelledby": "h-404", children: /* @__PURE__ */ jsxs("div", { className: "narrow", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-404", tabIndex: -1, children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { children: "This page does not exist. Go back to the home page, or browse our courses." }),
    /* @__PURE__ */ jsxs("div", { className: "row", children: [
      /* @__PURE__ */ jsx(Link, { className: "btn btn-o", to: "/", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { className: "btn btn-g", to: "/courses", children: "Browse courses" })
    ] })
  ] }) });
}
const LegalPages = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NotFoundPage,
  PrivacyPage,
  TermsPage
}, Symbol.toStringTag, { value: "Module" }));
function StudentPhoto({ name, photo }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const image = useRef(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => {
    var _a;
    return ((_a = part[0]) == null ? void 0 : _a.toLocaleUpperCase()) ?? "";
  }).join("") || "?";
  useEffect(() => {
    const current = image.current;
    if (!current) return;
    const syncLoadedState = () => {
      if (current.complete && current.naturalWidth > 0) setLoaded(true);
    };
    syncLoadedState();
    const frame = requestAnimationFrame(syncLoadedState);
    return () => cancelAnimationFrame(frame);
  }, [photo == null ? void 0 : photo.src]);
  return /* @__PURE__ */ jsxs("div", { className: "testimonial-avatar", role: "img", "aria-label": `${name} profile`, children: [
    /* @__PURE__ */ jsx("span", { className: "testimonial-avatar__initials", "aria-hidden": "true", children: initials }),
    (photo == null ? void 0 : photo.src) && !failed && /* @__PURE__ */ jsx(
      "img",
      {
        ref: image,
        className: `testimonial-photo${loaded ? " is-loaded" : ""}`,
        src: photo.src,
        srcSet: photo.srcSet || void 0,
        sizes: "72px",
        width: photo.width,
        height: photo.height,
        alt: "",
        "aria-hidden": "true",
        loading: "lazy",
        onLoad: () => setLoaded(true),
        onError: () => setFailed(true)
      }
    )
  ] });
}
function TestimonialsPage() {
  const [state, setState] = useState(loadingWith([]));
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const dialog = useRef(null);
  const [form, setForm] = useState({ studentName: "", courseName: "", rating: 5, review: "", consent: false, website: "" });
  const [photoAssetId, setPhotoAssetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    publicGet("/testimonials").then((r) => setState(settle({ ok: true, items: r.items }, []))).catch(() => setState(settle({ ok: false }, [])));
    publicGet("/videos").then((r) => setVideos(r.items.filter((v) => v.category === "student-feedback" || v.category === "parent-feedback"))).catch(() => setVideos([])).finally(() => setVideosLoading(false));
  }, []);
  async function uploadPhoto(file) {
    var _a;
    setSubmitError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 6 * 1024 * 1024) {
      setSubmitError("Upload a JPEG, PNG or WebP image smaller than 6 MB.");
      return;
    }
    try {
      const res = await fetch("/api/public/testimonials/upload", {
        method: "POST",
        headers: { "Content-Type": file.type, "X-Filename": encodeURIComponent(file.name), Accept: "application/json" },
        body: file
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(((_a = data == null ? void 0 : data.error) == null ? void 0 : _a.message) ?? "Could not upload the photo.");
      setPhotoAssetId(data.asset.id);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not upload the photo.");
    }
  }
  async function submitReview(e) {
    var _a;
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");
    try {
      const res = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, photoAssetId, consent: form.consent })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(((_a = data == null ? void 0 : data.error) == null ? void 0 : _a.message) ?? "Could not submit your review.");
      setSubmitMessage(data.message);
      setForm({ studentName: "", courseName: "", rating: 5, review: "", consent: false, website: "" });
      setPhotoAssetId(null);
    } catch (e2) {
      setSubmitError(e2 instanceof Error ? e2.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec", "aria-labelledby": "h-test", children: [
    /* @__PURE__ */ jsx("h1", { id: "h-test", tabIndex: -1, children: "Student Testimonials" }),
    /* @__PURE__ */ jsx("div", { className: "row testimonial-submit-row", children: /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "button", onClick: () => {
      var _a;
      return (_a = dialog.current) == null ? void 0 : _a.showModal();
    }, children: "Submit Your Review" }) }),
    (state.availability === "loading" || videosLoading) && /* @__PURE__ */ jsx("p", { role: "status", children: "Checking for published experiences…" }),
    !videosLoading && state.availability === "fallback" && /* @__PURE__ */ jsx("div", { className: "note", role: "status", children: "Student experiences are temporarily unavailable. Please try again later." }),
    !videosLoading && state.availability === "live" && state.items.length === 0 && videos.length === 0 && /* @__PURE__ */ jsx("div", { className: "empty", children: "Student experiences will be published after receiving verified consent." }),
    state.availability === "live" && state.items.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid", children: state.items.map((t) => /* @__PURE__ */ jsxs("blockquote", { className: "card testimonial-card", style: { margin: 0 }, children: [
      /* @__PURE__ */ jsx(StudentPhoto, { name: t.studentName, photo: t.photo }),
      /* @__PURE__ */ jsxs("p", { children: [
        "“",
        t.review || t.feedback,
        "”"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "testimonial-stars", "aria-label": `${t.rating ?? 0} out of 5 stars`, children: [
        "★".repeat(t.rating ?? 0),
        "☆".repeat(5 - (t.rating ?? 0))
      ] }),
      /* @__PURE__ */ jsxs("footer", { children: [
        /* @__PURE__ */ jsx("strong", { children: t.studentName }),
        t.courseName && /* @__PURE__ */ jsxs("span", { className: "hint", children: [
          " · ",
          t.courseName
        ] }),
        t.rating && /* @__PURE__ */ jsxs("span", { className: "hint", children: [
          " · Rated ",
          t.rating,
          " out of 5"
        ] })
      ] })
    ] }, t.id)) }),
    videos.length > 0 && /* @__PURE__ */ jsxs("section", { className: "sec", "aria-labelledby": "feedback-videos-title", children: [
      /* @__PURE__ */ jsx("h2", { id: "feedback-videos-title", children: "Video Experiences" }),
      /* @__PURE__ */ jsx("p", { children: "Student and parent feedback videos published with consent." }),
      /* @__PURE__ */ jsx("div", { className: "video-public-grid", children: videos.map((v) => /* @__PURE__ */ jsxs("article", { className: "video-public-card", children: [
        playing === v.id ? /* @__PURE__ */ jsx("iframe", { src: `${v.embedUrl}?autoplay=1`, title: v.title, loading: "lazy", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true }) : /* @__PURE__ */ jsxs("button", { className: "video-poster", type: "button", onClick: () => setPlaying(v.id), "aria-label": `Play ${v.title}`, children: [
          /* @__PURE__ */ jsx("img", { src: v.thumbnailUrl, alt: "", loading: "lazy" }),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "▶" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "video-public-copy", children: [
          /* @__PURE__ */ jsx("small", { children: v.category === "parent-feedback" ? "Parent Feedback" : "Student Feedback" }),
          /* @__PURE__ */ jsx("h2", { children: v.title }),
          v.description && /* @__PURE__ */ jsx("p", { children: v.description })
        ] })
      ] }, v.id)) })
    ] }),
    /* @__PURE__ */ jsx("dialog", { ref: dialog, "aria-labelledby": "review-form-title", children: /* @__PURE__ */ jsxs("div", { className: "dlg", children: [
      /* @__PURE__ */ jsx("button", { className: "x", type: "button", "aria-label": "Close review form", onClick: () => {
        var _a;
        return (_a = dialog.current) == null ? void 0 : _a.close();
      }, children: "×" }),
      /* @__PURE__ */ jsx("h2", { id: "review-form-title", children: "Submit Your Review" }),
      /* @__PURE__ */ jsx("p", { className: "hint", children: "Your experience will be published only after owner approval and consent review." }),
      /* @__PURE__ */ jsxs("form", { className: "review-form", onSubmit: submitReview, children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Student Full Name",
          /* @__PURE__ */ jsx("input", { value: form.studentName, maxLength: 80, required: true, onChange: (e) => setForm({ ...form, studentName: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Course Name",
          /* @__PURE__ */ jsx("input", { value: form.courseName, maxLength: 80, required: true, onChange: (e) => setForm({ ...form, courseName: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("fieldset", { className: "rating-field", children: [
          /* @__PURE__ */ jsx("legend", { children: "Star Rating" }),
          [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx("input", { type: "radio", name: "rating", value: n, checked: form.rating === n, onChange: () => setForm({ ...form, rating: n }) }),
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: n <= form.rating ? "★" : "☆" }),
            /* @__PURE__ */ jsxs("span", { className: "sr-only", children: [
              n,
              " star",
              n === 1 ? "" : "s"
            ] })
          ] }, n))
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Write Your Experience",
          /* @__PURE__ */ jsx("textarea", { value: form.review, maxLength: 1e3, minLength: 10, required: true, rows: 5, onChange: (e) => setForm({ ...form, review: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Student Photo (Optional)",
          /* @__PURE__ */ jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", onChange: (e) => {
            var _a;
            const file = (_a = e.target.files) == null ? void 0 : _a[0];
            if (file) void uploadPhoto(file);
          } })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hp", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("label", { children: [
          "Website",
          /* @__PURE__ */ jsx("input", { tabIndex: -1, autoComplete: "off", value: form.website, onChange: (e) => setForm({ ...form, website: e.target.value }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "check", children: [
          /* @__PURE__ */ jsx("input", { id: "review-consent", type: "checkbox", checked: form.consent, required: true, onChange: (e) => setForm({ ...form, consent: e.target.checked }) }),
          /* @__PURE__ */ jsx("label", { htmlFor: "review-consent", children: "I consent to this review and my optional photo being published after approval." })
        ] }),
        submitError && /* @__PURE__ */ jsx("p", { className: "err", role: "alert", children: submitError }),
        submitMessage && /* @__PURE__ */ jsx("p", { className: "ok", role: "status", children: submitMessage }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-o", type: "submit", disabled: submitting, children: submitting ? "Submitting…" : "Submit Review" })
      ] })
    ] }) })
  ] });
}
const TestimonialsPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TestimonialsPage
}, Symbol.toStringTag, { value: "Module" }));
const LABELS = { "centre-tour": "Centre Tour", "student-feedback": "Student Feedback", "parent-feedback": "Parent Feedback", "course-demonstration": "Course Demonstration", "events-activities": "Events & Activities", promotional: "Promotional Videos", achievements: "Achievements", other: "Other" };
function VideosPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");
  const [playing, setPlaying] = useState(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    publicGet("/videos").then((r) => {
      if (active) setItems(r.items);
    }).catch(() => {
      if (active) setFailed(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const shown = items.filter((v) => category === "all" || v.category === category);
  return /* @__PURE__ */ jsxs("section", { className: "wrap sec", "aria-labelledby": "videos-title", children: [
    /* @__PURE__ */ jsx("h1", { id: "videos-title", children: "AST Education Videos" }),
    /* @__PURE__ */ jsx("p", { children: "Centre tours, course demonstrations and student experiences." }),
    loading && /* @__PURE__ */ jsx("div", { className: "note", role: "status", "aria-live": "polite", children: "Loading approved videos…" }),
    failed && /* @__PURE__ */ jsx("div", { className: "note", role: "alert", children: "Videos are temporarily unavailable. Please try again later." }),
    !loading && !failed && items.length === 0 && /* @__PURE__ */ jsx("div", { className: "empty", children: "Videos will appear here after the institute has approved them for publication." }),
    !loading && !failed && items.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "filters", role: "group", "aria-label": "Filter videos", children: [
        /* @__PURE__ */ jsx("button", { className: "chip", "aria-pressed": category === "all", onClick: () => setCategory("all"), children: "All videos" }),
        Object.entries(LABELS).filter(([key]) => items.some((v) => v.category === key)).map(([key, label]) => /* @__PURE__ */ jsx("button", { className: "chip", "aria-pressed": category === key, onClick: () => setCategory(key), children: label }, key))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "video-public-grid", children: shown.map((v) => /* @__PURE__ */ jsxs("article", { className: "video-public-card", children: [
        playing === v.id ? /* @__PURE__ */ jsx("iframe", { src: `${v.embedUrl}?autoplay=1`, title: v.title, loading: "lazy", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true }) : /* @__PURE__ */ jsxs("button", { className: "video-poster", onClick: () => setPlaying(v.id), "aria-label": `Play ${v.title}`, children: [
          /* @__PURE__ */ jsx("img", { src: v.thumbnailUrl, alt: "", loading: "lazy" }),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "▶" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "video-public-copy", children: [
          /* @__PURE__ */ jsxs("small", { children: [
            LABELS[v.category] ?? "Video",
            v.isFeatured ? " · Featured" : ""
          ] }),
          /* @__PURE__ */ jsx("h2", { children: v.title }),
          v.description && /* @__PURE__ */ jsx("p", { children: v.description })
        ] })
      ] }, v.id)) })
    ] })
  ] });
}
const VideosPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: VideosPage
}, Symbol.toStringTag, { value: "Module" }));
const serverPages = {
  ApprovedPage,
  CertificationsPage,
  ContactPage,
  CoursesPage,
  EnquiryPage,
  GalleryPage,
  LeadershipPage,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
  TestimonialsPage,
  VideosPage
};
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(FactsProvider, { children: /* @__PURE__ */ jsx(App, { pageComponents: serverPages }) }) })
  );
}
export {
  COURSE_OPTIONS as C,
  render
};
