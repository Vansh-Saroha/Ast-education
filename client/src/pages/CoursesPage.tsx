import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CourseMotionVisual from '../components/CourseMotionVisual';
import { publicGet } from '../lib/publicApi';
import { APPROVED_LIST_DATE, CATEGORY_LABELS, COURSE_SEED } from '../lib/courses';
import { loadingWith, settle, type Loaded } from '../lib/dataState';
import '../styles/courses.css';

gsap.registerPlugin(ScrollTrigger);

type Course = { id: string; name: string; category: string; description: string };
type CourseCategory = 'school' | 'higher' | 'computer' | 'technical' | 'personality';
type SubCourse = { name: string; icon: string };

type CategoryCard = {
  key: CourseCategory;
  label: string;
  description: string;
  courses: Course[];
};

const CATEGORY_SUBCOURSES: Record<CourseCategory, SubCourse[]> = {
  school: [
    { name: 'LKG to Class 12', icon: 'A+' },
    { name: 'Academic Coaching', icon: 'ABC' },
    { name: 'Subject-wise Academic Support', icon: '12' },
  ],
  higher: [
    { name: 'B.A. Coaching', icon: 'BA' },
    { name: 'B.Com Coaching', icon: 'BC' },
    { name: 'B.Tech Coaching', icon: 'BT' },
  ],
  computer: [
    { name: 'Basic Computer', icon: 'PC' },
    { name: 'DCA', icon: 'DCA' },
    { name: 'ADCA', icon: 'AD' },
    { name: 'CCC', icon: 'CCC' },
    { name: 'Tally', icon: 'T' },
    { name: 'MS Office', icon: 'MS' },
    { name: 'Advanced Excel', icon: 'XLS' },
  ],
  technical: [
    { name: 'Coding Classes', icon: '</>' },
    { name: 'Programming Education', icon: '{ }' },
    { name: 'Technical Skill Development', icon: '01' },
  ],
  personality: [
    { name: 'English Speaking', icon: 'EN' },
    { name: 'Communication Skills', icon: 'HI' },
    { name: 'Motivation Classes', icon: 'GO' },
    { name: 'Personality Development', icon: 'YOU' },
  ],
};

const CATEGORY_NAV = [
  { key: 'school', label: 'School Education', short: 'School' },
  { key: 'higher', label: 'Higher Education Coaching', short: 'Higher' },
  { key: 'computer', label: 'Computer Education', short: 'Computer' },
  { key: 'technical', label: 'Programming & Technical', short: 'Technical' },
  { key: 'personality', label: 'Personality Development', short: 'Personality' },
] as const;

const CATEGORY_SECTION_IDS: Record<CourseCategory, string> = {
  school: 'school-education',
  higher: 'higher-education-coaching',
  computer: 'computer-education',
  technical: 'programming-technical',
  personality: 'personality-development',
};

const CATEGORY_MARKS: Record<CourseCategory, string> = {
  school: '01',
  higher: '02',
  computer: '03',
  technical: '04',
  personality: '05',
};

const CATEGORY_GLYPH: Record<CourseCategory, string> = {
  school: 'ABC',
  higher: 'UG',
  computer: '</>',
  technical: '01',
  personality: 'YOU',
};

const CATEGORY_DESCRIPTIONS: Record<CourseCategory, string> = {
  school: 'LKG to Class 12 academic coaching and subject-wise support.',
  higher: 'B.A., B.Com and B.Tech coaching with academic support.',
  computer: 'Foundational to practical computer education for office and accounting skills.',
  technical: 'Coding, programming education and technical skill development.',
  personality: 'English speaking, communication, motivation and personality development.',
};

const CATEGORY_SYMBOLS: Record<CourseCategory, string[]> = {
  school: ['A', 'B', '+', '12', 'BOOK'],
  higher: ['BA', 'BCom', 'BTech', 'CAP', 'BOOK'],
  computer: ['PC', '101', 'DCA', 'XLS', 'TALLY'],
  technical: ['</>', '{}', 'JS', '01', 'TERM'],
  personality: ['HI', 'YOU', '...', 'VOICE', 'GO'],
};

function CourseIllustration({ category }: { category: string }) {
  const book = (
    <g className="course-art__book course-art__float--slow">
      <path d="M56 87c10-5 20-4 30 2v25c-10-6-20-7-30-2z" fill="#fffdf7" stroke="#082b50" strokeWidth="2" />
      <path d="M86 89c10-6 20-7 30-2v25c-10-5-20-4-30 2z" fill="#f4b928" stroke="#082b50" strokeWidth="2" />
      <path d="M86 90v25M63 94c6-2 12-1 17 2M93 94c6-3 12-4 17-2" fill="none" stroke="#f26a21" strokeWidth="2" strokeLinecap="round" />
    </g>
  );

  return (
    <div className={`premium-course-card__illustration premium-course-card__illustration--${category}`} aria-hidden="true">
      <svg viewBox="0 0 220 140" role="presentation">
        <ellipse className="course-art__ground" cx="110" cy="124" rx="68" ry="7" />
        {category === 'school' && (
          <>
            <g className="course-art__float--slow">
              <path d="m52 57 33-14 34 14-34 14z" fill="#082b50" />
              <path d="m64 61 21-9 22 9-22 9z" fill="#f4b928" />
              <path d="M85 57v15c0 6 8 6 8 0V57" fill="none" stroke="#f26a21" strokeWidth="3" />
              <path d="m116 58 8 5-2 20-6-5z" fill="#f26a21" />
            </g>
            {book}
            <g className="course-art__float--delay">
              <path d="m145 77 19-33 5 3-14 36-8 4z" fill="#f26a21" />
              <path d="m164 44 3-6 6 3-4 6z" fill="#f4b928" />
              <path d="m146 87 8-4-5 10z" fill="#082b50" />
            </g>
            <g className="course-art__sparkle course-art__sparkle--one"><path d="M42 81v10m-5-5h10" /></g>
            <circle className="course-art__dot course-art__float--delay" cx="177" cy="69" r="4" />
            <path className="course-art__accent" d="m139 43 4-7 4 7 7 4-7 4-4 7-4-7-7-4z" />
          </>
        )}
        {category === 'higher' && (
          <>
            <path d="M151 99V49m0 0-8 9m8-9 8 9" className="course-art__growth" />
            <g className="course-art__float--slow">
              <path d="m60 61 30-13 30 13-30 13z" fill="#082b50" />
              <path d="m72 65 18-8 18 8-18 8z" fill="#f4b928" />
              <path d="M90 61v14c0 7 9 7 9 0V61" fill="none" stroke="#f26a21" strokeWidth="3" />
              <path d="M121 60c4 5 4 10 0 15" fill="none" stroke="#f26a21" strokeWidth="2" />
            </g>
            <g className="course-art__certificate course-art__float--delay">
              <path d="M125 74h42v35h-42z" fill="#fffdf7" stroke="#082b50" strokeWidth="2" />
              <path d="M132 82h27M132 88h18" stroke="#91a7bb" strokeWidth="2" strokeLinecap="round" />
              <circle cx="153" cy="100" r="5" fill="#f4b928" />
              <path d="m151 104-2 8 4-3 4 3-2-8" fill="#f26a21" />
            </g>
            <path d="M55 105h38v10H55z" fill="#f26a21" />
            <path d="M59 96h34v9H59z" fill="#f4b928" />
            <path d="M64 87h29v9H64z" fill="#fffdf7" stroke="#082b50" strokeWidth="1.5" />
            <circle className="course-art__dot course-art__float--delay" cx="48" cy="56" r="4" />
          </>
        )}
        {category === 'computer' && (
          <>
            <g className="course-art__monitor">
              <rect x="61" y="39" width="103" height="66" rx="8" fill="#082b50" />
              <rect x="67" y="45" width="91" height="53" rx="4" fill="#f8fbff" />
              <path d="M105 105v8m15-8v8m-25 2h36" stroke="#082b50" strokeWidth="4" strokeLinecap="round" />
              <path d="M78 53h21v12H78zM105 53h21v12h-21zM132 53h18v12h-18zM78 70h21v12H78zM105 70h21v12h-21zM132 70h18v12h-18z" fill="#e7eef5" stroke="#b7c8d8" />
              <path className="course-art__cell" d="M78 87h21v7H78zM105 87h21v7h-21zM132 87h18v7h-18z" fill="#f4b928" />
            </g>
            <g className="course-art__calculator course-art__float--delay">
              <rect x="39" y="73" width="37" height="48" rx="6" fill="#f26a21" stroke="#082b50" strokeWidth="2" />
              <rect x="45" y="79" width="25" height="10" rx="2" fill="#fffdf7" />
              <path d="M47 96h4m5 0h4m5 0h4m-22 8h4m5 0h4m5 0h4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </g>
            <path className="course-art__code-mark" d="m174 65-7 6 7 6m5-12 7 6-7 6" />
            <circle className="course-art__dot course-art__float--slow" cx="51" cy="48" r="4" />
          </>
        )}
        {category === 'technical' && (
          <>
            <g className="course-art__laptop">
              <rect x="54" y="37" width="112" height="72" rx="8" fill="#082b50" />
              <rect x="61" y="44" width="98" height="57" rx="4" fill="#f8fbff" />
              <path d="m45 113 11-7h108l11 7c2 2 0 5-3 5H48c-3 0-5-3-3-5" fill="#c6d5e0" stroke="#082b50" strokeWidth="2" />
              <path d="M78 56h14m-14 9h33m-33 9h22m-22 9h39" stroke="#91a7bb" strokeWidth="3" strokeLinecap="round" />
              <path d="m135 55-5 7 5 7m9-14 5 7-5 7" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <rect className="course-art__cursor" x="125" y="81" width="3" height="9" rx="1" fill="#f26a21" />
            </g>
            <g className="course-art__terminal course-art__float--delay">
              <rect x="144" y="34" width="36" height="27" rx="5" fill="#fffdf7" stroke="#082b50" strokeWidth="2" />
              <path d="m152 42 4 4-4 4m9 0h10" fill="none" stroke="#f26a21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path className="course-art__accent course-art__float--slow" d="m41 52 4-7 4 7 7 4-7 4-4 7-4-7-7-4z" />
          </>
        )}
        {category === 'personality' && (
          <>
            <g className="course-art__microphone course-art__float--slow">
              <rect x="98" y="42" width="25" height="46" rx="12.5" fill="#082b50" />
              <path d="M92 68v5c0 20 37 20 37 0v-5m-18 25v15m-12 0h24" fill="none" stroke="#f26a21" strokeWidth="4" strokeLinecap="round" />
              <path d="M104 51h13m-13 8h13m-13 8h13" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
            </g>
            <g className="course-art__speech course-art__float--delay">
              <path d="M47 48h37a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H67l-9 8v-8h-3a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8z" fill="#fffdf7" stroke="#082b50" strokeWidth="2" />
              <path d="M59 62h21m-21 7h14" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="course-art__speech course-art__float--slow">
              <path d="M139 55h29a7 7 0 0 1 7 7v12a7 7 0 0 1-7 7h-4v7l-8-7h-17a7 7 0 0 1-7-7V62a7 7 0 0 1 7-7z" fill="#f4b928" stroke="#082b50" strokeWidth="2" />
              <circle cx="145" cy="68" r="2" fill="#082b50" /><circle cx="154" cy="68" r="2" fill="#082b50" /><circle cx="163" cy="68" r="2" fill="#082b50" />
            </g>
            <path className="course-art__sound" d="M83 94c-5-5-5-12 0-17m-7 22c-9-8-9-20 0-28m54 28c5-5 5-12 0-17" />
            <path className="course-art__accent" d="m181 91 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<Loaded<Course[]>>(loadingWith(COURSE_SEED));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [active, setActive] = useState<CategoryCard | null>(null);
  const [mobileDeckExpanded, setMobileDeckExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const storyRoot = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const dialogAnimation = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    publicGet<{ items: Course[] }>('/courses')
      .then((result) => setState(settle({ ok: true, items: result.items }, COURSE_SEED)))
      .catch(() => setState(settle({ ok: false }, COURSE_SEED)));
  }, []);

  const shown = useMemo(() => state.items.filter((course) => {
    if (category && course.category !== category) return false;
    const categoryLabel = CATEGORY_NAV.find((item) => item.key === course.category)?.label
      ?? CATEGORY_LABELS[course.category]
      ?? course.category;
    const haystack = `${course.name} ${categoryLabel} ${course.description}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [state.items, category, query]);

  const categoryCards = useMemo<CategoryCard[]>(() => CATEGORY_NAV.flatMap((item) => {
    const courses = shown.filter((course) => course.category === item.key);
    return courses.length ? [{
      key: item.key,
      label: item.label,
      description: CATEGORY_DESCRIPTIONS[item.key],
      courses,
    }] : [];
  }), [shown]);

  useEffect(() => {
    const root = storyRoot.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [shown]);

  useEffect(() => {
    const root = storyRoot.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = root.querySelectorAll<HTMLElement>('.premium-course-card');
    const context = gsap.context(() => {
      gsap.fromTo(cards,
        { autoAlpha: 0, y: 34, scale: 0.96, filter: 'blur(7px)' },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,filter',
          scrollTrigger: { trigger: root, start: 'top 82%', once: true },
        },
      );
    }, root);
    return () => context.revert();
  }, [categoryCards]);

  useEffect(() => {
    const hero = heroRef.current;
    const orbit = orbitRef.current;
    const emblem = emblemRef.current;
    if (!hero || !orbit || !emblem || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let removePointerListeners = () => {};
    const context = gsap.context(() => {
      const letters = emblem.querySelectorAll<HTMLElement>('[data-logo-letter]');
      const outerRing = orbit.querySelector<HTMLElement>('[data-energy-ring="outer"]');
      const innerRing = orbit.querySelector<HTMLElement>('[data-energy-ring="inner"]');
      const particleOrbits = orbit.querySelectorAll<HTMLElement>('[data-particle-orbit]');

      gsap.set(emblem, { transformPerspective: 900, transformOrigin: '50% 50%' });
      gsap.set(emblem, { autoAlpha: 0, scale: 0.76, rotationX: 16, rotationY: -28, filter: 'blur(12px)' });
      gsap.set(letters, { autoAlpha: 0, y: 15 });

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(emblem, {
          autoAlpha: 1,
          scale: 1.04,
          rotationX: 0,
          rotationY: 0,
          filter: 'blur(0px)',
          duration: 1.15,
          ease: 'back.out(1.35)',
        })
        .to(emblem, { scale: 1, duration: 0.36, ease: 'power2.out' }, '-=0.25')
        .to(letters, { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.11 }, '-=0.62')
        .fromTo([outerRing, innerRing].filter(Boolean),
          { autoAlpha: 0, scale: 0.84 },
          { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.12 },
          '-=0.85',
        )
        .fromTo(particleOrbits,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.55, stagger: 0.14 },
          '-=0.55',
        );

      gsap.to(emblem, { y: -7, duration: 3.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.55 });
      if (outerRing) gsap.to(outerRing, { rotation: 360, duration: 34, ease: 'none', repeat: -1, delay: 1.4 });
      if (innerRing) gsap.to(innerRing, { rotation: -360, duration: 25, ease: 'none', repeat: -1, delay: 1.4 });
      particleOrbits.forEach((particleOrbit, index) => {
        gsap.to(particleOrbit, {
          rotation: index % 2 ? -360 : 360,
          duration: index % 2 ? 19 : 27,
          ease: 'none',
          repeat: -1,
          delay: 1.5,
        });
      });

      gsap.to(orbit, {
        y: -18,
        scale: 0.96,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const rotateX = gsap.quickTo(emblem, 'rotationX', { duration: 0.55, ease: 'power3.out' });
        const rotateY = gsap.quickTo(emblem, 'rotationY', { duration: 0.55, ease: 'power3.out' });
        const moveX = gsap.quickTo(emblem, 'x', { duration: 0.55, ease: 'power3.out' });
        const moveY = gsap.quickTo(emblem, 'y', { duration: 0.55, ease: 'power3.out' });
        const onPointerMove = (event: PointerEvent) => {
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
        orbit.addEventListener('pointermove', onPointerMove);
        orbit.addEventListener('pointerleave', onPointerLeave);
        removePointerListeners = () => {
          orbit.removeEventListener('pointermove', onPointerMove);
          orbit.removeEventListener('pointerleave', onPointerLeave);
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
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, shown]);

  useEffect(() => {
    setMobileDeckExpanded(false);
  }, [category, query]);

  useEffect(() => {
    if (!mobileDeckExpanded) return;
    const closeDeck = (event: PointerEvent) => {
      if (storyRoot.current && !storyRoot.current.contains(event.target as Node)) {
        setMobileDeckExpanded(false);
      }
    };
    document.addEventListener('pointerdown', closeDeck);
    return () => document.removeEventListener('pointerdown', closeDeck);
  }, [mobileDeckExpanded]);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.style.overflow = previousRoot;
    };
  }, [active]);

  useEffect(() => () => dialogAnimation.current?.revert(), []);

  const openDetails = (card: CategoryCard, trigger?: HTMLElement) => {
    dialogTrigger.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setActive(card);
    requestAnimationFrame(() => {
      const modal = dialog.current;
      const content = modal?.querySelector<HTMLElement>('.course-dialog__inner');
      if (!modal || !content) return;
      if (!modal.open) modal.showModal();
      modal.querySelector<HTMLButtonElement>('.course-dialog__close')?.focus({ preventScroll: true });
      dialogAnimation.current?.revert();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      dialogAnimation.current = gsap.context(() => {
        const visual = modal.querySelector<HTMLElement>('.course-dialog__visual');
        const title = modal.querySelector<HTMLElement>('.course-dialog__content h2');
        const cards = modal.querySelectorAll<HTMLElement>('.course-dialog__subcourse');
        const actions = modal.querySelector<HTMLElement>('.course-dialog__actions');
        const timeline = gsap.timeline();
        timeline.fromTo(content,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity,visibility' },
        );
        if (visual) timeline.fromTo(visual, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.38, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, '-=0.2');
        if (title) timeline.fromTo(title, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, '-=0.18');
        if (cards.length) timeline.fromTo(cards, { autoAlpha: 0, y: 12, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.055, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, '-=0.12');
        if (actions) timeline.fromTo(actions, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, '-=0.12');
      }, modal);
    });
  };

  const closeDetails = () => {
    const modal = dialog.current;
    const content = modal?.querySelector<HTMLElement>('.course-dialog__inner');
    if (!modal?.open || !content || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      modal?.close();
      return;
    }
    dialogAnimation.current?.revert();
    dialogAnimation.current = gsap.context(() => {
      gsap.to(content, {
        autoAlpha: 0,
        y: 12,
        scale: 0.99,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => modal.close(),
      });
    }, modal);
  };

  const enquiry = (courseName?: string) => {
    navigate('/enquiry', courseName ? { state: { course: courseName } } : undefined);
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('');
  };

  return (
    <section className="courses-page" aria-labelledby="courses-title">
      <div className="course-bubbles" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} className={`course-bubble course-bubble--${index + 1}`} />
        ))}
      </div>

      <header ref={heroRef} className="courses-hero">
        <div className="courses-hero__glow" aria-hidden="true" />
        <div className="courses-hero__copy">
          <p className="courses-kicker courses-hero__kicker">Learn. Achieve. Become.</p>
          <h1 id="courses-title">Discover Your Future with the Right Course</h1>
          <p>Build strong foundations, develop practical skills, and move confidently toward the future you imagine.</p>
          <a className="courses-primary" href="#course-list">Explore Courses <span aria-hidden="true">↓</span></a>
        </div>
        <div ref={orbitRef} className="courses-hero__orbit" role="img" aria-label="AST Education logo">
          <span className="courses-hero__energy-ring courses-hero__energy-ring--outer" data-energy-ring="outer" aria-hidden="true" />
          <span className="courses-hero__energy-ring courses-hero__energy-ring--inner" data-energy-ring="inner" aria-hidden="true" />
          <span className="courses-hero__particle-orbit courses-hero__particle-orbit--one" data-particle-orbit aria-hidden="true"><i /></span>
          <span className="courses-hero__particle-orbit courses-hero__particle-orbit--two" data-particle-orbit aria-hidden="true"><i /></span>
          <span className="courses-hero__education-object courses-hero__education-object--book" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false"><path d="M16 9c-4-3-8-3-12-1v16c4-2 8-2 12 1 4-3 8-3 12-1V8c-4-2-8-2-12 1Zm0 0v16M7 12c2-.5 4 0 6 1m12-1c-2-.5-4 0-6 1" /></svg>
          </span>
          <span className="courses-hero__education-object courses-hero__education-object--cap" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false"><path d="m3 12 13-7 13 7-13 7L3 12Zm5 3v7c5 4 11 4 16 0v-7m5-2v8m0 0-2 3m2-3 2 3" /></svg>
          </span>
          <span className="courses-hero__education-object courses-hero__education-object--code" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false"><path d="m11 9-7 7 7 7m10-14 7 7-7 7m-2-19-5 24" /></svg>
          </span>
          <div ref={emblemRef} className="courses-hero__emblem">
            <span className="courses-hero__emblem-mark" aria-hidden="true">
              <span data-logo-letter>A</span><span data-logo-letter>S</span><span data-logo-letter>T</span>
            </span>
            <span className="courses-hero__emblem-name">AST</span>
            <span className="courses-hero__emblem-caption">EDUCATION</span>
          </div>
          <b>Learn<br />Build<br />Grow</b>
        </div>
        <a className="courses-scroll" href="#course-list" aria-label="Scroll to courses">
          <span>Scroll to explore</span>
          <i aria-hidden="true" />
        </a>
      </header>

      <div className="courses-content" id="course-list">
        <header className="courses-heading" data-reveal>
          <div>
            <p className="courses-kicker courses-kicker--dark">Programme catalogue</p>
            <h2>Find your direction</h2>
          </div>
          <p>{shown.length} of {state.items.length} programmes</p>
        </header>

        <div className="course-tools" role="search" data-reveal>
          <label htmlFor="course-search">Search courses</label>
          <span className="course-tools__icon" aria-hidden="true">⌕</span>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, categories, or topics"
          />
          {query && (
            <button type="button" aria-label="Clear course search" onClick={() => setQuery('')}>×</button>
          )}
        </div>

        <div className="course-filter" role="group" aria-label="Filter courses by category" data-reveal>
          <button type="button" aria-pressed={!category} onClick={() => setCategory('')}>
            All Courses <span>{state.items.length}</span>
          </button>
          {CATEGORY_NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={category === item.key}
              onClick={() => setCategory(item.key)}
            >
              {item.label} <span>{state.items.filter((course) => course.category === item.key).length}</span>
            </button>
          ))}
        </div>

        {state.availability === 'loading' && <p className="course-status" role="status">Loading courses...</p>}
        {state.availability === 'fallback' && (
          <p className="course-status course-status--fallback" role="status">
            Live course information is unavailable. Showing approved course details from {APPROVED_LIST_DATE}.
          </p>
        )}

        {categoryCards.length === 0 ? (
          <div className="course-empty" data-reveal>
            <span aria-hidden="true">⌕</span>
            <h3>No matching courses</h3>
            <p>Try another search or explore all categories.</p>
            <button type="button" onClick={resetFilters}>Reset filters</button>
          </div>
        ) : (
          <div
            className={`course-card-fan${mobileDeckExpanded ? ' course-card-fan--mobile-expanded' : ''}`}
            ref={storyRoot}
            role="group"
            aria-label="AST course card deck"
            aria-expanded={mobileDeckExpanded}
            onClick={(event) => {
              if (event.target === event.currentTarget && window.matchMedia('(max-width: 980px)').matches) {
                setMobileDeckExpanded((expanded) => !expanded);
              }
            }}
          >
            {categoryCards.map((card, index) => (
              <article
                className={`premium-course-card premium-course-card--${card.key}`}
                key={card.key}
                id={CATEGORY_SECTION_IDS[card.key]}
                data-reveal
                style={{ '--card-index': index } as CSSProperties}
                onPointerMove={(event) => {
                  if (event.pointerType === 'touch') return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = (event.clientX - rect.left) / rect.width;
                  const y = (event.clientY - rect.top) / rect.height;
                  event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 9}deg`);
                  event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`);
                  event.currentTarget.style.setProperty('--light-x', `${x * 100}%`);
                  event.currentTarget.style.setProperty('--light-y', `${y * 100}%`);
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty('--tilt-x', '0deg');
                  event.currentTarget.style.setProperty('--tilt-y', '0deg');
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (window.matchMedia('(max-width: 980px)').matches && !mobileDeckExpanded) {
                    setMobileDeckExpanded(true);
                    return;
                  }
                  openDetails(card, event.currentTarget);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDetails(card, event.currentTarget);
                  }
                }}
              >
                <div className="premium-course-card__symbols" aria-hidden="true">
                  {CATEGORY_SYMBOLS[card.key].map((symbol, symbolIndex) => (
                    <span key={symbol} style={{ '--symbol-index': symbolIndex } as CSSProperties}>{symbol}</span>
                  ))}
                </div>
                <div className="premium-course-card__glare" aria-hidden="true" />
                <CourseIllustration category={card.key} />
                <div className="premium-course-card__top">
                  <span>{CATEGORY_MARKS[card.key]}</span>
                  <b>{CATEGORY_GLYPH[card.key]}</b>
                </div>
                <div className="premium-course-card__body">
                  <p>{card.label}</p>
                  <h3>{card.label}</h3>
                  <span className="premium-course-card__summary">{card.description}</span>
                  <span className="premium-course-card__course-list">{card.courses.map((course) => course.name).join(', ')}</span>
                  <button type="button" tabIndex={-1}>
                    View course details <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <section className="courses-admission" aria-labelledby="admission-title">
        <div className="courses-admission__copy">
          <p className="courses-kicker">Admissions</p>
          <h2 id="admission-title">Need help choosing the right course?</h2>
          <p>Speak with our team and take your next step with confidence.</p>
        </div>
        <button type="button" onClick={() => enquiry()}>
          Submit an enquiry <span aria-hidden="true">→</span>
        </button>
      </section>

      <dialog
        ref={dialog}
        className="course-dialog"
        aria-labelledby={active ? 'course-dialog-title' : undefined}
        onClose={() => {
          dialogAnimation.current?.revert();
          dialogAnimation.current = null;
          const trigger = dialogTrigger.current;
          dialogTrigger.current = null;
          if (trigger?.isConnected) trigger.focus({ preventScroll: true });
          setActive(null);
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeDetails();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeDetails();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDetails();
        }}
      >
        {active && (
          <div className="course-dialog__inner">
            <button className="course-dialog__close" type="button" aria-label="Close course details" onClick={closeDetails}>
              <span aria-hidden="true">×</span>
            </button>
            <div className={`course-dialog__visual premium-course-card--${active.key}`} aria-hidden="true">
              <span className="course-dialog__number">PROGRAMME {CATEGORY_MARKS[active.key] ?? '01'}</span>
              <CourseMotionVisual
                key={active.key}
                category={active.key}
                className="course-dialog__motion"
              />
              <div className="course-dialog__visual-copy">
                <span>AST Education</span>
              </div>
            </div>
            <div className="course-dialog__content">
              <h2 id="course-dialog-title">{active.label}</h2>
              <div className="course-dialog__subcourses" aria-label={`${active.label} sub-courses`}>
                {CATEGORY_SUBCOURSES[active.key].map((course) => (
                  <article className="course-dialog__subcourse" key={course.name}>
                    <span className="course-dialog__subcourse-icon" aria-hidden="true">{course.icon}</span>
                    <strong>{course.name}</strong>
                  </article>
                ))}
              </div>
              <div className="course-dialog__actions">
                <button type="button" onClick={() => enquiry(active.label)}>Admission enquiry</button>
                <a href="https://wa.me/919690766514" target="_blank" rel="noopener noreferrer">WhatsApp enquiry</a>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
