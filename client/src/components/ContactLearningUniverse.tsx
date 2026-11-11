import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ContactLearningUniverse() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const book = bookRef.current;
    const orbit = orbitRef.current;
    const sun = sunRef.current;
    if (!scene || !book || !orbit || !sun) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let removePointerListeners = () => {};
    const context = gsap.context(() => {
      gsap.fromTo(scene,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      );
      gsap.to(book, {
        y: -7,
        rotationZ: -1.5,
        duration: 3.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.8,
      });
      gsap.to(orbit, { rotation: 360, duration: 52, ease: 'none', repeat: -1 });
      gsap.to(sun, {
        scale: 1.06,
        opacity: 0.82,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const rotateX = gsap.quickTo(book, 'rotationX', { duration: 0.55, ease: 'power3.out' });
        const rotateY = gsap.quickTo(book, 'rotationY', { duration: 0.55, ease: 'power3.out' });
        const onPointerMove = (event: PointerEvent) => {
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
        scene.addEventListener('pointermove', onPointerMove);
        scene.addEventListener('pointerleave', onPointerLeave);
        removePointerListeners = () => {
          scene.removeEventListener('pointermove', onPointerMove);
          scene.removeEventListener('pointerleave', onPointerLeave);
        };
      }
    }, scene);

    return () => {
      removePointerListeners();
      context.revert();
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="contact-learning-universe"
      role="img"
      aria-label="AST Education learning universe with a floating open book, golden sunrise and orbiting study symbols"
    >
      <div className="contact-learning-universe__sky" aria-hidden="true">
        <span ref={sunRef} className="contact-learning-universe__sun" />
        <span ref={orbitRef} className="contact-learning-universe__orbit">
          <i className="contact-learning-universe__orbit-dot contact-learning-universe__orbit-dot--one" />
          <i className="contact-learning-universe__orbit-dot contact-learning-universe__orbit-dot--two" />
        </span>
        <span className="contact-learning-universe__star contact-learning-universe__star--one">✦</span>
        <span className="contact-learning-universe__star contact-learning-universe__star--two">✧</span>
        <span className="contact-learning-universe__star contact-learning-universe__star--three">✦</span>
        <span className="contact-learning-universe__float contact-learning-universe__float--cap" aria-hidden="true">
          <svg viewBox="0 0 32 32" focusable="false">
            <path d="m3 12 13-7 13 7-13 7-13-7Z" />
            <path d="M8 15v7c4.5 3.5 11.5 3.5 16 0v-7M28 13v8" />
          </svg>
        </span>
        <span className="contact-learning-universe__float contact-learning-universe__float--code" aria-hidden="true">&lt;/&gt;</span>
        <span className="contact-learning-universe__float contact-learning-universe__float--spark" aria-hidden="true">✧</span>
      </div>

      <div ref={bookRef} className="contact-learning-universe__book" aria-hidden="true">
        <svg viewBox="0 0 360 220" focusable="false">
          <defs>
            <linearGradient id="learning-book-left" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#DCE8F4" />
            </linearGradient>
            <linearGradient id="learning-book-right" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#FFFDF5" />
              <stop offset="1" stopColor="#F4B928" />
            </linearGradient>
            <linearGradient id="learning-book-cover" x1="0" x2="0.9" y1="0" y2="1">
              <stop offset="0" stopColor="#F26A21" />
              <stop offset="1" stopColor="#C84716" />
            </linearGradient>
            <filter id="learning-book-shadow" x="-30%" y="-30%" width="160%" height="180%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <ellipse cx="180" cy="188" rx="118" ry="15" fill="#082B50" opacity=".16" filter="url(#learning-book-shadow)" />
          <g className="contact-learning-universe__book-cover">
            <path d="M47 70 Q112 49 178 79 L178 179 Q111 151 52 174 Q43 171 43 162 L43 80 Q43 73 47 70Z" fill="url(#learning-book-cover)" />
            <path d="M313 70 Q248 49 182 79 L182 179 Q249 151 308 174 Q317 171 317 162 L317 80 Q317 73 313 70Z" fill="url(#learning-book-cover)" />
          </g>
          <path d="M52 56 Q115 36 176 69 L176 166 Q111 140 56 160 Q49 162 49 153 L49 65 Q49 59 52 56Z" fill="url(#learning-book-left)" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M308 56 Q245 36 184 69 L184 166 Q249 140 304 160 Q311 162 311 153 L311 65 Q311 59 308 56Z" fill="url(#learning-book-right)" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M180 72 L180 171" stroke="#082B50" strokeOpacity=".24" strokeWidth="5" strokeLinecap="round" />
          <path d="M65 76 Q112 61 157 80 M65 91 Q112 77 157 96 M65 106 Q110 92 157 111 M65 121 Q107 109 157 126" fill="none" stroke="#6D88A2" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
          <path d="M203 80 Q248 61 295 76 M203 96 Q248 77 295 91 M203 111 Q250 92 295 106 M203 126 Q253 109 295 121" fill="none" stroke="#C4932A" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
          <text x="238" y="146" fill="#082B50" fontFamily="Georgia,serif" fontSize="19" fontWeight="700" letterSpacing="3">AST</text>
          <path d="M160 180 Q180 187 200 180" fill="none" stroke="#F26A21" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <span className="contact-learning-universe__tagline" aria-hidden="true">LEARN <i>·</i> BUILD <i>·</i> GROW</span>
    </div>
  );
}
