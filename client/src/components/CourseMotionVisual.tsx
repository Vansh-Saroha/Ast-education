import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type CourseCategory = 'school' | 'higher' | 'computer' | 'technical' | 'personality';

type CourseMotionVisualProps = {
  category: CourseCategory;
  className?: string;
};

export default function CourseMotionVisual({ category, className = '' }: CourseMotionVisualProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const artwork = scene.querySelector<SVGSVGElement>('.course-motion-visual__artwork');
    const floaters = scene.querySelectorAll<SVGElement>('.course-motion-visual__floater');
    if (!artwork) return;

    const context = gsap.context(() => {
      gsap.fromTo(artwork,
        { autoAlpha: 0, scale: 0.9, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      );
      gsap.to(artwork, {
        y: -5,
        rotation: 1,
        duration: 4.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.7,
      });
      floaters.forEach((floater, index) => {
        gsap.to(floater, {
          y: index % 2 ? -7 : 6,
          rotation: index % 2 ? 3 : -3,
          duration: 3.2 + index * 0.35,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.22,
        });
      });
    }, scene);

    return () => context.revert();
  }, [category]);

  return (
    <div ref={sceneRef} className={`course-motion-visual course-motion-visual--${category} ${className}`} aria-hidden="true">
      <span className="course-motion-visual__particle course-motion-visual__particle--one" />
      <span className="course-motion-visual__particle course-motion-visual__particle--two" />
      <span className="course-motion-visual__particle course-motion-visual__particle--three" />
      <svg className="course-motion-visual__artwork" viewBox="0 0 300 240" role="presentation">
        <ellipse cx="150" cy="204" rx="94" ry="12" fill="rgba(8,43,80,.12)" />
        {category === 'school' && (
          <>
            <g className="course-motion-visual__floater">
              <path d="M66 110c24-13 50-12 77 2v53c-27-14-53-15-77-2z" fill="#fffdf7" stroke="#082b50" strokeWidth="3" />
              <path d="M143 112c27-14 53-15 77-2v53c-24-13-50-12-77 2z" fill="#f4b928" stroke="#082b50" strokeWidth="3" />
              <path d="M143 115v53m-63-44c15-5 29-3 43 4m31-4c15-7 29-9 44-4" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="m178 63 18-34 7 4-13 37-9 6z" fill="#f26a21" />
              <path d="m196 29 4-8 8 4-5 8z" fill="#f4b928" />
              <path d="m179 76 11-6-7 14z" fill="#082b50" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="m91 78 35-16 36 16-36 16z" fill="#082b50" />
              <path d="m105 82 21-9 22 9-22 9z" fill="#f4b928" />
              <path d="M126 78v17c0 8 10 8 10 0V78m23 2 9 6-2 23-7-6z" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="54" y="71" fill="#f26a21" fontSize="18" fontWeight="800">A+</text>
            <text x="222" y="96" fill="#082b50" fontSize="17" fontWeight="800">12</text>
          </>
        )}
        {category === 'higher' && (
          <>
            <g className="course-motion-visual__floater">
              <path d="M92 75h101v88H92z" fill="#fffdf7" stroke="#082b50" strokeWidth="3" />
              <path d="M107 96h68m-68 13h55" stroke="#9aafc1" strokeWidth="4" strokeLinecap="round" />
              <circle cx="158" cy="139" r="11" fill="#f4b928" />
              <path d="m154 148-3 20 8-6 8 6-4-20" fill="#f26a21" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="m55 65 39-18 40 18-40 18z" fill="#082b50" />
              <path d="m71 69 23-11 24 11-24 11z" fill="#f4b928" />
              <path d="M94 65v17c0 8 10 8 10 0V65m27 2 10 7-2 25-8-7z" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="m196 158 18-31 6 4-13 34-8 5z" fill="#f26a21" />
              <path d="m213 127 4-7 7 4-5 7z" fill="#f4b928" />
            </g>
            <path d="M224 113V72m0 0-10 11m10-11 10 11" fill="none" stroke="#f26a21" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {category === 'computer' && (
          <>
            <g className="course-motion-visual__floater">
              <rect x="69" y="49" width="158" height="111" rx="12" fill="#082b50" />
              <rect x="78" y="58" width="140" height="91" rx="6" fill="#f8fbff" />
              <path d="M135 160v16m27-16v16m-44 5h61" stroke="#082b50" strokeWidth="6" strokeLinecap="round" />
              <path d="M90 72h35v20H90zm44 0h35v20h-35zm44 0h29v20h-29zM90 100h35v20H90zm44 0h35v20h-35zm44 0h29v20h-29z" fill="#e7eef5" stroke="#b7c8d8" strokeWidth="2" />
              <path d="M90 128h35v13H90zM134 128h35v13h-35z" fill="#f4b928" />
              <path d="M178 128h29v13h-29z" fill="#f26a21" />
            </g>
            <g className="course-motion-visual__floater">
              <rect x="36" y="112" width="48" height="67" rx="8" fill="#f26a21" stroke="#082b50" strokeWidth="3" />
              <rect x="43" y="120" width="34" height="13" rx="3" fill="#fffdf7" />
              <path d="M46 143h5m8 0h5m8 0h2m-28 11h5m8 0h5m8 0h2m-28 11h5m8 0h5m8 0h2" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x="215" y="45" fill="#f26a21" fontSize="18" fontWeight="800">PC</text>
          </>
        )}
        {category === 'technical' && (
          <>
            <g className="course-motion-visual__floater">
              <rect x="61" y="53" width="177" height="112" rx="12" fill="#082b50" />
              <rect x="71" y="63" width="157" height="91" rx="6" fill="#f8fbff" />
              <path d="m43 179 18-14h177l18 14c2 4-1 7-6 7H49c-5 0-8-3-6-7" fill="#c6d5e0" stroke="#082b50" strokeWidth="3" />
              <path d="M92 85h22m-22 15h55m-55 15h34m-34 15h70" stroke="#9aafc1" strokeWidth="4" strokeLinecap="round" />
              <path d="m183 81-9 9 9 9m18-18 9 9-9 9" fill="none" stroke="#f26a21" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <rect className="course-motion-visual__cursor" x="170" y="125" width="4" height="13" rx="2" fill="#f26a21" />
            </g>
            <g className="course-motion-visual__floater">
              <rect x="194" y="34" width="47" height="34" rx="6" fill="#fffdf7" stroke="#082b50" strokeWidth="3" />
              <path d="m204 44 5 5-5 5m12 0h13" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="47" y="87" fill="#f4b928" fontSize="19" fontWeight="800">{'{ }'}</text>
          </>
        )}
        {category === 'personality' && (
          <>
            <g className="course-motion-visual__floater">
              <rect x="134" y="54" width="36" height="78" rx="18" fill="#082b50" />
              <path d="M125 99v8c0 27 54 27 54 0v-8m-27 35v25m-17 0h34" fill="none" stroke="#f26a21" strokeWidth="5" strokeLinecap="round" />
              <path d="M144 69h16m-16 12h16m-16 12h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="M44 56h60a12 12 0 0 1 12 12v23a12 12 0 0 1-12 12H76l-18 15v-15h-14a12 12 0 0 1-12-12V68a12 12 0 0 1 12-12z" fill="#fffdf7" stroke="#082b50" strokeWidth="3" />
              <path d="M52 77h44m-44 10h30" stroke="#f26a21" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g className="course-motion-visual__floater">
              <path d="M191 85h50a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-8v13l-15-13h-27a10 10 0 0 1-10-10V95a10 10 0 0 1 10-10z" fill="#f4b928" stroke="#082b50" strokeWidth="3" />
              <circle cx="200" cy="104" r="3" fill="#082b50" /><circle cx="215" cy="104" r="3" fill="#082b50" /><circle cx="230" cy="104" r="3" fill="#082b50" />
            </g>
            <path d="M97 149c-8-8-8-19 0-27m-13 34c-14-13-14-31 0-44m101 37c7-8 7-19 0-27" fill="none" stroke="#f26a21" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}
