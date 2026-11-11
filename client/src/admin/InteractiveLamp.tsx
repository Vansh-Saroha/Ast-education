import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';

const VIEWBOX_HEIGHT = 560;
const PULL_THRESHOLD = 86;
const MAX_PULL = 145;

interface InteractiveLampProps {
  active: boolean;
  locked: boolean;
  reducedMotion: boolean;
  onPullStart: () => void;
  onPullEnd: () => void;
  onToggle: () => void;
}

export default function InteractiveLamp({ active, locked, reducedMotion, onPullStart, onPullEnd, onToggle }: InteractiveLampProps) {
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);
  const pullTargetRef = useRef(0);
  const pointerRef = useRef<{ id: number; startY: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const activatedRef = useRef(false);
  const pullActivationPendingRef = useRef(false);
  const frameRef = useRef(0);
  const releaseTimerRef = useRef(0);

  function updatePull(nextPull: number) {
    pullRef.current = nextPull;
    pullTargetRef.current = nextPull;
    setPull(nextPull);
  }

  function followPullTarget() {
    cancelAnimationFrame(frameRef.current);
    let previousTime = performance.now();
    const frame = (time: number) => {
      const step = Math.min((time - previousTime) / 16.67, 2);
      previousTime = time;
      const difference = pullTargetRef.current - pullRef.current;
      const nextPull = Math.abs(difference) < 0.35
        ? pullTargetRef.current
        : pullRef.current + difference * (1 - Math.pow(0.7, step));
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
    const frame = (time: number) => {
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

  function handlePointerDown(event: PointerEvent<SVGGElement>) {
    if (locked || activatedRef.current || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { id: event.pointerId, startY: event.clientY, moved: false };
    suppressClickRef.current = false;
    onPullStart();
  }

  function handlePointerMove(event: PointerEvent<SVGGElement>) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId || activatedRef.current) return;
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
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

  function handlePointerUp(event: PointerEvent<SVGGElement>) {
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

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!locked) activate();
  }

  const cordEnd = 306 + pull;

  return (
    <svg className={`interactive-lamp${active ? ' is-active' : ''}`} viewBox="0 0 760 560" role="group" aria-labelledby="lamp-title" aria-describedby="lamp-description">
      <title id="lamp-title">AST Education pull-cord lamp</title>
      <desc id="lamp-description">Pull the hanging cord downward, or focus it and press Enter, to reveal the owner login.</desc>
      <defs>
        <linearGradient id="pendant-metal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8295ad" />
          <stop offset=".2" stopColor="#233653" />
          <stop offset=".5" stopColor="#10213a" />
          <stop offset=".78" stopColor="#324967" />
          <stop offset="1" stopColor="#0d1930" />
        </linearGradient>
        <linearGradient id="pendant-edge" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#b6c4d6" />
          <stop offset=".4" stopColor="#61748f" />
          <stop offset="1" stopColor="#172943" />
        </linearGradient>
        <linearGradient id="lamp-light" x1="0" y1="0" x2=".15" y2="1">
          <stop stopColor="#fff5c8" stopOpacity=".6" />
          <stop offset=".45" stopColor="#ffd477" stopOpacity=".23" />
          <stop offset="1" stopColor="#ff9e2e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lamp-bulb" cx=".5" cy=".2" r=".8">
          <stop stopColor="#fffef2" />
          <stop offset=".42" stopColor="#ffe6a0" />
          <stop offset="1" stopColor="#ff9f31" />
        </radialGradient>
        <filter id="lamp-bloom" x="-80%" y="-50%" width="260%" height="250%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id="cord-shadow" x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#020711" floodOpacity=".65" />
        </filter>
      </defs>

      <ellipse className="lamp-floor-glow" cx="376" cy="535" rx="245" ry="43" />
      <path className="lamp-beam" d="M259 168 L135 548 Q380 638 625 548 L501 168Z" fill="url(#lamp-light)" />
      <path className="lamp-ray lamp-ray--left" d="M281 173 L167 449" />
      <path className="lamp-ray lamp-ray--right" d="M481 173 L590 445" />
      <g className="lamp-dust" aria-hidden="true">
        <circle cx="266" cy="315" r="2" />
        <circle cx="323" cy="385" r="1.7" />
        <circle cx="431" cy="344" r="2.1" />
        <circle cx="503" cy="422" r="1.6" />
        <circle cx="376" cy="270" r="1.5" />
        <circle cx="221" cy="414" r="1.8" />
      </g>

      <g className="lamp-hardware">
        <ellipse cx="380" cy="39" rx="44" ry="10" fill="#061329" opacity=".8" />
        <path d="M342 34 Q342 25 352 22 L408 22 Q418 25 418 34 L413 43 L347 43Z" fill="url(#pendant-metal)" />
        <ellipse cx="380" cy="31" rx="35" ry="7" fill="url(#pendant-edge)" />
        <path d="M380 38 L380 92" stroke="#101c31" strokeWidth="8" />
        <path d="M380 39 L380 91" stroke="url(#pendant-edge)" strokeWidth="3" />
        <path d="M255 161 Q269 98 333 85 Q380 75 427 85 Q491 98 505 161 Q507 170 493 175 L267 175 Q253 170 255 161Z" fill="url(#pendant-metal)" />
        <path d="M276 148 Q297 107 342 99 Q380 92 418 99 Q463 107 484 148" fill="none" stroke="#a9b8cb" strokeOpacity=".32" strokeWidth="2" />
        <ellipse cx="380" cy="171" rx="116" ry="14" fill="url(#pendant-edge)" />
        <ellipse cx="380" cy="169" rx="100" ry="8" fill="#0b182c" />
        <path className="lamp-bulb" d="M368 153 Q368 144 380 141 Q392 144 392 153 L389 171 L371 171Z" fill="url(#lamp-bulb)" />
        <ellipse className="lamp-bulb-halo" cx="380" cy="169" rx="54" ry="12" />
        <path d={`M461 163 C479 199 446 239 456 ${cordEnd}`} fill="none" stroke="#101826" strokeWidth="5" filter="url(#cord-shadow)" />
        <path d={`M460 163 C476 197 448 237 456 ${cordEnd}`} fill="none" stroke="#d7dce2" strokeWidth="1.4" />
        <path d={`M462 164 C478 198 450 236 458 ${cordEnd}`} fill="none" stroke="#738095" strokeWidth="1" />
        <path className="lamp-light-shaft" d="M270 178 L157 518 Q380 597 603 518 L490 178Z" fill="url(#lamp-light)" />
      </g>

      <g
        className={`pull-cord${pull > 0 ? ' is-pulled' : ''}`}
        transform={`translate(0 ${pull})`}
        role="button"
        tabIndex={locked ? -1 : 0}
        aria-label={`Pull the cord to ${active ? 'close' : 'open'} Owner Login. You can also tap it or press Enter or Space.`}
        aria-disabled={locked}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <rect className="pull-cord__hit" x="390" y="260" width="132" height="130" rx="55" />
        <path className="pull-cord__cue" d="M486 326 V347 M481 342 L486 348 L491 342" />
        <path d="M456 306 C453 317 457 323 456 330" fill="none" stroke="#131d2d" strokeWidth="4" />
        <path d="M456 306 C453 317 457 323 456 330" fill="none" stroke="#d7dce2" strokeWidth="1.2" />
        <rect className="pull-cord__grip" x="447" y="327" width="18" height="32" rx="8" />
        <path d="M451 333 L461 333" stroke="#f3c26b" strokeOpacity=".88" strokeWidth="1.4" />
        <circle cx="456" cy="361" r="3" fill="#c18a3d" />
      </g>
    </svg>
  );
}
