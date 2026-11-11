import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { a as adminApi, A as ApiError } from "./api-BUgD-bVR.js";
/* empty css                    */
const VIEWBOX_HEIGHT = 560;
const PULL_THRESHOLD = 86;
const MAX_PULL = 145;
function InteractiveLamp({ active, locked, reducedMotion, onPullStart, onPullEnd, onToggle }) {
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);
  const pullTargetRef = useRef(0);
  const pointerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const activatedRef = useRef(false);
  const pullActivationPendingRef = useRef(false);
  const frameRef = useRef(0);
  const releaseTimerRef = useRef(0);
  function updatePull(nextPull) {
    pullRef.current = nextPull;
    pullTargetRef.current = nextPull;
    setPull(nextPull);
  }
  function followPullTarget() {
    cancelAnimationFrame(frameRef.current);
    let previousTime = performance.now();
    const frame = (time) => {
      const step = Math.min((time - previousTime) / 16.67, 2);
      previousTime = time;
      const difference = pullTargetRef.current - pullRef.current;
      const nextPull = Math.abs(difference) < 0.35 ? pullTargetRef.current : pullRef.current + difference * (1 - Math.pow(0.7, step));
      setPull(nextPull);
      pullRef.current = nextPull;
      if (nextPull === pullTargetRef.current) frameRef.current = 0;
      else frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
  }
  function springBack() {
    cancelAnimationFrame(frameRef.current);
    pullTargetRef.current = 0;
    if (reducedMotion) {
      updatePull(0);
      return;
    }
    let position = pullRef.current;
    let velocity = 0;
    let previousTime = performance.now();
    const frame = (time) => {
      const step = Math.min((time - previousTime) / 16.67, 2);
      previousTime = time;
      velocity = (velocity - position * 0.19 * step) * Math.pow(0.7, step);
      position += velocity * step;
      if (Math.abs(position) < 0.35 && Math.abs(velocity) < 0.4) position = 0;
      updatePull(position);
      if (position === 0) frameRef.current = 0;
      else frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
  }
  function activate() {
    if (activatedRef.current) return;
    activatedRef.current = true;
    springBack();
    onToggle();
  }
  useEffect(() => {
    if (locked) {
      activatedRef.current = true;
      return;
    }
    activatedRef.current = false;
    pullActivationPendingRef.current = false;
    updatePull(0);
    cancelAnimationFrame(frameRef.current);
    window.clearTimeout(releaseTimerRef.current);
  }, [locked]);
  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    window.clearTimeout(releaseTimerRef.current);
  }, []);
  function handlePointerDown(event) {
    if (locked || activatedRef.current || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { id: event.pointerId, startY: event.clientY, moved: false };
    suppressClickRef.current = false;
    onPullStart();
  }
  function handlePointerMove(event) {
    var _a;
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId || activatedRef.current) return;
    const bounds = (_a = event.currentTarget.ownerSVGElement) == null ? void 0 : _a.getBoundingClientRect();
    const scale = bounds ? VIEWBOX_HEIGHT / bounds.height : 1;
    const nextPull = Math.max(0, Math.min(MAX_PULL, (event.clientY - pointer.startY) * scale));
    if (nextPull > 7) pointer.moved = true;
    if (reducedMotion) updatePull(nextPull);
    else {
      pullTargetRef.current = nextPull;
      followPullTarget();
    }
    if (nextPull >= PULL_THRESHOLD) {
      suppressClickRef.current = true;
      activatedRef.current = true;
      pullActivationPendingRef.current = true;
    }
  }
  function handlePointerUp(event) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    if (pointer.moved) suppressClickRef.current = true;
    if (pullActivationPendingRef.current) {
      pullActivationPendingRef.current = false;
      updatePull(pullTargetRef.current);
      springBack();
      releaseTimerRef.current = window.setTimeout(onToggle, reducedMotion ? 0 : 150);
      return;
    }
    if (!activatedRef.current) {
      updatePull(pullTargetRef.current);
      springBack();
      onPullEnd();
    }
  }
  function handleClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!locked) activate();
  }
  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!locked) activate();
  }
  const cordEnd = 306 + pull;
  return /* @__PURE__ */ jsxs("svg", { className: `interactive-lamp${active ? " is-active" : ""}`, viewBox: "0 0 760 560", role: "group", "aria-labelledby": "lamp-title", "aria-describedby": "lamp-description", children: [
    /* @__PURE__ */ jsx("title", { id: "lamp-title", children: "AST Education pull-cord lamp" }),
    /* @__PURE__ */ jsx("desc", { id: "lamp-description", children: "Pull the hanging cord downward, or focus it and press Enter, to reveal the owner login." }),
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "pendant-metal", x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#8295ad" }),
        /* @__PURE__ */ jsx("stop", { offset: ".2", stopColor: "#233653" }),
        /* @__PURE__ */ jsx("stop", { offset: ".5", stopColor: "#10213a" }),
        /* @__PURE__ */ jsx("stop", { offset: ".78", stopColor: "#324967" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#0d1930" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "pendant-edge", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#b6c4d6" }),
        /* @__PURE__ */ jsx("stop", { offset: ".4", stopColor: "#61748f" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#172943" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "lamp-light", x1: "0", y1: "0", x2: ".15", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#fff5c8", stopOpacity: ".6" }),
        /* @__PURE__ */ jsx("stop", { offset: ".45", stopColor: "#ffd477", stopOpacity: ".23" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#ff9e2e", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: "lamp-bulb", cx: ".5", cy: ".2", r: ".8", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#fffef2" }),
        /* @__PURE__ */ jsx("stop", { offset: ".42", stopColor: "#ffe6a0" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#ff9f31" })
      ] }),
      /* @__PURE__ */ jsx("filter", { id: "lamp-bloom", x: "-80%", y: "-50%", width: "260%", height: "250%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "30" }) }),
      /* @__PURE__ */ jsx("filter", { id: "cord-shadow", x: "-100%", y: "-100%", width: "300%", height: "300%", children: /* @__PURE__ */ jsx("feDropShadow", { dx: "1", dy: "4", stdDeviation: "3", floodColor: "#020711", floodOpacity: ".65" }) })
    ] }),
    /* @__PURE__ */ jsx("ellipse", { className: "lamp-floor-glow", cx: "376", cy: "535", rx: "245", ry: "43" }),
    /* @__PURE__ */ jsx("path", { className: "lamp-beam", d: "M259 168 L135 548 Q380 638 625 548 L501 168Z", fill: "url(#lamp-light)" }),
    /* @__PURE__ */ jsx("path", { className: "lamp-ray lamp-ray--left", d: "M281 173 L167 449" }),
    /* @__PURE__ */ jsx("path", { className: "lamp-ray lamp-ray--right", d: "M481 173 L590 445" }),
    /* @__PURE__ */ jsxs("g", { className: "lamp-dust", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("circle", { cx: "266", cy: "315", r: "2" }),
      /* @__PURE__ */ jsx("circle", { cx: "323", cy: "385", r: "1.7" }),
      /* @__PURE__ */ jsx("circle", { cx: "431", cy: "344", r: "2.1" }),
      /* @__PURE__ */ jsx("circle", { cx: "503", cy: "422", r: "1.6" }),
      /* @__PURE__ */ jsx("circle", { cx: "376", cy: "270", r: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "221", cy: "414", r: "1.8" })
    ] }),
    /* @__PURE__ */ jsxs("g", { className: "lamp-hardware", children: [
      /* @__PURE__ */ jsx("ellipse", { cx: "380", cy: "39", rx: "44", ry: "10", fill: "#061329", opacity: ".8" }),
      /* @__PURE__ */ jsx("path", { d: "M342 34 Q342 25 352 22 L408 22 Q418 25 418 34 L413 43 L347 43Z", fill: "url(#pendant-metal)" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "380", cy: "31", rx: "35", ry: "7", fill: "url(#pendant-edge)" }),
      /* @__PURE__ */ jsx("path", { d: "M380 38 L380 92", stroke: "#101c31", strokeWidth: "8" }),
      /* @__PURE__ */ jsx("path", { d: "M380 39 L380 91", stroke: "url(#pendant-edge)", strokeWidth: "3" }),
      /* @__PURE__ */ jsx("path", { d: "M255 161 Q269 98 333 85 Q380 75 427 85 Q491 98 505 161 Q507 170 493 175 L267 175 Q253 170 255 161Z", fill: "url(#pendant-metal)" }),
      /* @__PURE__ */ jsx("path", { d: "M276 148 Q297 107 342 99 Q380 92 418 99 Q463 107 484 148", fill: "none", stroke: "#a9b8cb", strokeOpacity: ".32", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "380", cy: "171", rx: "116", ry: "14", fill: "url(#pendant-edge)" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "380", cy: "169", rx: "100", ry: "8", fill: "#0b182c" }),
      /* @__PURE__ */ jsx("path", { className: "lamp-bulb", d: "M368 153 Q368 144 380 141 Q392 144 392 153 L389 171 L371 171Z", fill: "url(#lamp-bulb)" }),
      /* @__PURE__ */ jsx("ellipse", { className: "lamp-bulb-halo", cx: "380", cy: "169", rx: "54", ry: "12" }),
      /* @__PURE__ */ jsx("path", { d: `M461 163 C479 199 446 239 456 ${cordEnd}`, fill: "none", stroke: "#101826", strokeWidth: "5", filter: "url(#cord-shadow)" }),
      /* @__PURE__ */ jsx("path", { d: `M460 163 C476 197 448 237 456 ${cordEnd}`, fill: "none", stroke: "#d7dce2", strokeWidth: "1.4" }),
      /* @__PURE__ */ jsx("path", { d: `M462 164 C478 198 450 236 458 ${cordEnd}`, fill: "none", stroke: "#738095", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("path", { className: "lamp-light-shaft", d: "M270 178 L157 518 Q380 597 603 518 L490 178Z", fill: "url(#lamp-light)" })
    ] }),
    /* @__PURE__ */ jsxs(
      "g",
      {
        className: `pull-cord${pull > 0 ? " is-pulled" : ""}`,
        transform: `translate(0 ${pull})`,
        role: "button",
        tabIndex: locked ? -1 : 0,
        "aria-label": `Pull the cord to ${active ? "close" : "open"} Owner Login. You can also tap it or press Enter or Space.`,
        "aria-disabled": locked,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        children: [
          /* @__PURE__ */ jsx("rect", { className: "pull-cord__hit", x: "390", y: "260", width: "132", height: "130", rx: "55" }),
          /* @__PURE__ */ jsx("path", { className: "pull-cord__cue", d: "M486 326 V347 M481 342 L486 348 L491 342" }),
          /* @__PURE__ */ jsx("path", { d: "M456 306 C453 317 457 323 456 330", fill: "none", stroke: "#131d2d", strokeWidth: "4" }),
          /* @__PURE__ */ jsx("path", { d: "M456 306 C453 317 457 323 456 330", fill: "none", stroke: "#d7dce2", strokeWidth: "1.2" }),
          /* @__PURE__ */ jsx("rect", { className: "pull-cord__grip", x: "447", y: "327", width: "18", height: "32", rx: "8" }),
          /* @__PURE__ */ jsx("path", { d: "M451 333 L461 333", stroke: "#f3c26b", strokeOpacity: ".88", strokeWidth: "1.4" }),
          /* @__PURE__ */ jsx("circle", { cx: "456", cy: "361", r: "3", fill: "#c18a3d" })
        ]
      }
    )
  ] });
}
const EMAIL_KEY = "ast-owner-login-email";
function readEmail() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function LoginPage() {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const timersRef = useRef([]);
  const activationRef = useRef(false);
  const pullStartedOnRef = useRef(false);
  const [stage, setStage] = useState("idle");
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const [email, setEmail] = useState(readEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(Boolean(readEmail()));
  const [showPassword, setShowPassword] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (stage !== "login") {
      panel.setAttribute("inert", "");
      return;
    }
    panel.removeAttribute("inert");
  }, [stage]);
  function startPull() {
    activationRef.current = false;
    pullStartedOnRef.current = stage === "login";
    setStage("pulling");
  }
  function endPull() {
    setStage((current) => current === "pulling" ? pullStartedOnRef.current ? "login" : "idle" : current);
  }
  function toggleLamp() {
    var _a, _b;
    if (activationRef.current) return;
    activationRef.current = true;
    timersRef.current.forEach(window.clearTimeout);
    const shouldClose = pullStartedOnRef.current || stage === "login";
    if (shouldClose) {
      if (document.activeElement instanceof HTMLElement && ((_a = panelRef.current) == null ? void 0 : _a.contains(document.activeElement))) {
        (_b = document.querySelector(".pull-cord")) == null ? void 0 : _b.focus({ preventScroll: true });
      }
      if (reduceMotion) {
        setStage("idle");
        return;
      }
      setStage("closing");
      timersRef.current = [window.setTimeout(() => setStage("idle"), 720)];
      return;
    }
    if (reduceMotion) {
      setStage("login");
      return;
    }
    setStage("activated");
    timersRef.current = [
      window.setTimeout(() => setStage("revealing"), 420),
      window.setTimeout(() => setStage("login"), 790)
    ];
  }
  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      if (rememberEmail) window.localStorage.setItem(EMAIL_KEY, email);
      else window.localStorage.removeItem(EMAIL_KEY);
      setStorageNotice("");
    } catch {
      setStorageNotice("Remember me is unavailable in this browser; sign-in will continue.");
    }
    try {
      await adminApi.login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([key, value]) => [key, value[0]])));
      }
      setError(err instanceof ApiError ? err.message : "We could not sign you in. Please try again.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }
  const lampIsActive = stage === "activated" || stage === "revealing" || stage === "login" || stage === "pulling" && pullStartedOnRef.current;
  const lampIsLocked = stage === "activated" || stage === "revealing" || stage === "closing";
  const panelIsVisible = stage === "login" || stage === "closing" || stage === "pulling" && pullStartedOnRef.current;
  const layoutIsOpen = stage === "login" || stage === "closing" || stage === "pulling" && pullStartedOnRef.current;
  return /* @__PURE__ */ jsxs("main", { className: `owner-login owner-login--${stage}${lampIsActive ? " owner-login--lit" : ""}${layoutIsOpen ? " owner-login--panel-layout" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: "owner-login__ambient", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "owner-login__dust", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {})
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "lamp-scene", "aria-label": "AST Education welcome", children: [
      /* @__PURE__ */ jsx("header", { className: "lamp-scene__header", children: /* @__PURE__ */ jsxs("a", { className: "owner-brand", href: "/", "aria-label": "AST Education home", children: [
        /* @__PURE__ */ jsx("img", { src: "/assets/logo.webp", alt: "", width: 46, height: 46 }),
        /* @__PURE__ */ jsxs("span", { children: [
          "AST ",
          /* @__PURE__ */ jsx("b", { children: "EDUCATION" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "lamp-invitation", children: [
        /* @__PURE__ */ jsx("p", { className: "lamp-invitation__eyebrow", children: "A LITTLE LIGHT GOES A LONG WAY" }),
        /* @__PURE__ */ jsx("h1", { children: "Pull the cord." }),
        /* @__PURE__ */ jsx("p", { className: "lamp-invitation__subheading", children: "Light up your dashboard." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lamp-visual", children: /* @__PURE__ */ jsx(
        InteractiveLamp,
        {
          active: lampIsActive,
          locked: lampIsLocked,
          reducedMotion: reduceMotion,
          onPullStart: startPull,
          onPullEnd: endPull,
          onToggle: toggleLamp
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: `pull-instruction${lampIsActive ? " pull-instruction--active" : ""}`, children: [
        /* @__PURE__ */ jsx("span", { className: "pull-instruction__arrow", "aria-hidden": "true", children: "↓" }),
        /* @__PURE__ */ jsx("span", { children: lampIsActive ? "Pull the cord to close Owner Login" : "Pull the cord to enter" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "lamp-scene__footer", children: "A brighter view of AST Education starts here." })
    ] }),
    /* @__PURE__ */ jsxs("section", { ref: panelRef, className: "owner-login__panel", "aria-label": "Owner sign in", "aria-hidden": !panelIsVisible, children: [
      /* @__PURE__ */ jsxs("form", { className: "owner-card", onSubmit, noValidate: true, children: [
        /* @__PURE__ */ jsxs("div", { className: "owner-card__topline", children: [
          /* @__PURE__ */ jsxs("span", { className: "owner-card__overline", children: [
            /* @__PURE__ */ jsx("i", {}),
            " PRIVATE ACCESS"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "owner-card__secure", children: [
            /* @__PURE__ */ jsx("i", {}),
            " SECURE SIGN IN"
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { children: "Owner Login" }),
        /* @__PURE__ */ jsx("p", { className: "owner-card__intro", children: "Welcome back. Your dashboard is ready." }),
        /* @__PURE__ */ jsxs("label", { className: "owner-field", htmlFor: "email", children: [
          /* @__PURE__ */ jsx("span", { children: "Email address" }),
          /* @__PURE__ */ jsxs("span", { className: `owner-field__input${fieldErrors.email ? " has-error" : ""}`, children: [
            /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "5", width: "14", height: "10", rx: "2" }),
              /* @__PURE__ */ jsx("path", { d: "m4 7 6 4 6-4" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                type: "email",
                autoComplete: "username",
                value: email,
                onChange: (event) => setEmail(event.target.value),
                "aria-invalid": !!fieldErrors.email,
                "aria-describedby": fieldErrors.email ? "email-error" : void 0,
                required: true
              }
            )
          ] }),
          fieldErrors.email && /* @__PURE__ */ jsx("span", { className: "owner-field__error", id: "email-error", children: fieldErrors.email })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "owner-field", htmlFor: "password", children: [
          /* @__PURE__ */ jsx("span", { children: "Password" }),
          /* @__PURE__ */ jsxs("span", { className: `owner-field__input${fieldErrors.password ? " has-error" : ""}`, children: [
            /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx("rect", { x: "4", y: "9", width: "12", height: "8", rx: "2" }),
              /* @__PURE__ */ jsx("path", { d: "M7 9V6a3 3 0 0 1 6 0v3" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "password",
                type: showPassword ? "text" : "password",
                autoComplete: "current-password",
                value: password,
                onChange: (event) => setPassword(event.target.value),
                "aria-invalid": !!fieldErrors.password,
                "aria-describedby": fieldErrors.password ? "password-error" : void 0,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "password-toggle",
                type: "button",
                "aria-label": showPassword ? "Hide password" : "Show password",
                "aria-pressed": showPassword,
                onClick: () => setShowPassword((visible) => !visible),
                children: showPassword ? "Hide" : "Show"
              }
            )
          ] }),
          fieldErrors.password && /* @__PURE__ */ jsx("span", { className: "owner-field__error", id: "password-error", children: fieldErrors.password })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "owner-card__options", children: [
          /* @__PURE__ */ jsxs("label", { className: "remember-option", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: rememberEmail, onChange: (event) => setRememberEmail(event.target.checked) }),
            /* @__PURE__ */ jsx("span", { className: "remember-option__box", "aria-hidden": "true" }),
            "Remember me"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "owner-card__secure owner-card__secure--mobile", children: [
            /* @__PURE__ */ jsx("i", {}),
            " Secure connection"
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "owner-card__error", role: "alert", children: error }),
        /* @__PURE__ */ jsxs("button", { className: "owner-submit", type: "submit", disabled: busy, children: [
          /* @__PURE__ */ jsx("span", { children: busy ? "Signing in…" : "Access Dashboard" }),
          !busy && /* @__PURE__ */ jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M4 10h11m-4-4 4 4-4 4" }) })
        ] }),
        storageNotice && /* @__PURE__ */ jsx("p", { className: "owner-card__storage", role: "status", children: storageNotice }),
        /* @__PURE__ */ jsx("p", { className: "owner-card__foot", children: "Authorised AST Education owner and staff only." })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "owner-login__copyright", children: [
        "© AST Education ",
        /* @__PURE__ */ jsx("span", { children: "·" }),
        " Roorkee, Uttarakhand"
      ] })
    ] })
  ] });
}
export {
  LoginPage as default
};
