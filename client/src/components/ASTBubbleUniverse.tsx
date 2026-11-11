import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ast-bubble-universe.css';

type Course = {
  name: string;
  shortName: string;
  description: string;
  offerings: string[];
  icon: string;
  position: string;
  sectionId: string;
};

const COURSES: Course[] = [
  { name: 'School Education', shortName: 'School Education', description: 'Academic coaching and subject-wise support.', offerings: ['LKG to Class 12', 'Academic Coaching', 'Subject-wise Support'], icon: 'ABC', position: 'course-1', sectionId: 'school-education' },
  { name: 'Higher Education Coaching', shortName: 'Higher Education Coaching', description: 'Coaching and academic support for higher education.', offerings: ['B.A.', 'B.Com', 'B.Tech', 'Academic Support'], icon: 'UG', position: 'course-2', sectionId: 'higher-education-coaching' },
  { name: 'Computer Education', shortName: 'Computer Education', description: 'Practical computer skills for study and work.', offerings: ['Basic Computer', 'DCA', 'ADCA', 'CCC', 'Tally', 'MS Office', 'Advanced Excel'], icon: '⌘', position: 'course-3', sectionId: 'computer-education' },
  { name: 'Programming & Technical', shortName: 'Programming & Technical', description: 'Coding and practical technical skill development.', offerings: ['Coding Classes', 'Programming Education', 'Technical Skill Development'], icon: '</>', position: 'course-4', sectionId: 'programming-technical' },
  { name: 'Personality Development', shortName: 'Personality Development', description: 'Communication skills and personal confidence.', offerings: ['English Speaking', 'Communication Skills', 'Motivation', 'Personality Development'], icon: '◎', position: 'course-5', sectionId: 'personality-development' },
];

function CourseBubble({ course, index }: { course: Course; index: number }) {
  const bubbleRef = useRef<HTMLAnchorElement>(null);
  const [selected, setSelected] = useState(false);

  const moveMagnet = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bubble = bubbleRef.current;
    if (!bubble) return;
    const rect = bubble.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    bubble.style.setProperty('--magnet-x', `${x * 0.12}px`);
    bubble.style.setProperty('--magnet-y', `${y * 0.12}px`);
  };

  const resetMagnet = () => {
    bubbleRef.current?.style.setProperty('--magnet-x', '0px');
    bubbleRef.current?.style.setProperty('--magnet-y', '0px');
  };

  return (
    <Link
      ref={bubbleRef}
      to={`/courses#${course.sectionId}`}
      className={`course-orbit-bubble ${course.position}`}
      aria-label={`${course.name}: ${course.description}`}
      style={{ '--course-delay': `${index * 55}ms` } as CSSProperties}
      onPointerMove={moveMagnet}
      onPointerLeave={resetMagnet}
      onClick={(event) => {
        if (window.matchMedia('(pointer: coarse)').matches && !selected) {
          event.preventDefault();
          setSelected(true);
          return;
        }
        if (window.matchMedia('(pointer: coarse)').matches && selected) {
          setSelected(false);
        }
      }}
    >
      <span className="course-orbit-bubble__surface">
        <span className="course-orbit-bubble__icon" aria-hidden="true">{course.icon}</span>
        <span className="course-orbit-bubble__name">{course.shortName}</span>
      </span>
      <span className={`course-description-card ${selected ? 'is-selected' : ''}`}>
        <strong>{course.name}</strong>
        <small>{course.description}</small>
        <span className="course-description-card__offerings">{course.offerings.join(' · ')}</span>
      </span>
    </Link>
  );
}

export default function ASTBubbleUniverse({ mobile = false }: { mobile?: boolean }) {
  const universeRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const moveParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const universe = universeRef.current;
    const main = mainRef.current;
    if (!universe || !main) return;
    const rect = universe.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    universe.style.setProperty('--parallax-x', `${x * 10}px`);
    universe.style.setProperty('--parallax-y', `${y * 10}px`);
    main.style.setProperty('--light-x', `${48 + x * 18}%`);
    main.style.setProperty('--light-y', `${38 + y * 18}%`);
    setActive(true);
  };

  const leaveUniverse = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const universe = universeRef.current;
    const main = mainRef.current;
    universe?.style.setProperty('--parallax-x', '0px');
    universe?.style.setProperty('--parallax-y', '0px');
    main?.style.setProperty('--light-x', '48%');
    main?.style.setProperty('--light-y', '38%');
    setActive(false);
  };

  const toggleMobile = () => {
    setActive((value) => !value);
  };

  return (
    <div
      ref={universeRef}
      className={`ast-bubble-universe ${mobile ? 'ast-bubble-universe--mobile' : ''} ${active ? 'is-active' : ''}`}
      onPointerMove={moveParallax}
      onPointerLeave={leaveUniverse}
      role="group"
      aria-label="AST Education course universe"
    >
      <div className="bubble-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
      </div>
      <div className="bubble-orbit-ring ring-outer" aria-hidden="true" />
      <div className="bubble-orbit-ring ring-inner" aria-hidden="true" />
      {COURSES.map((course, index) => <CourseBubble key={course.name} course={course} index={index} />)}
      <div
        ref={mainRef}
        className="main-ast-bubble"
        role="button"
        tabIndex={0}
        aria-expanded={active}
        aria-label="Explore AST Education courses"
        onClick={toggleMobile}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setActive((value) => !value);
          }
        }}
      >
        <span className="main-ast-bubble__shine" aria-hidden="true" />
        <span className="main-ast-bubble__mark" aria-hidden="true">
          <span className="mark-sun">A</span>
          <span className="mark-pages">S</span>
          <span className="mark-star">T</span>
        </span>
        <span className="main-ast-bubble__name">AST</span>
        <span className="main-ast-bubble__caption">EDUCATION</span>
      </div>
    </div>
  );
}
