import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ASTBubbleUniverse from './ASTBubbleUniverse';
import '../styles/mobile-home.css';

const REVEAL_TARGETS = ['h1', 'h2', 'h3', '.tag', 'p', '.hero .row', '.trust > div', '.grid > .card', '.featured-video'];

export default function MobileKnowledgeUniverse() {
  const universeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const universe = universeRef.current;
    const layout = universe?.closest<HTMLElement>('.mobile-home-layout');
    if (!universe || !layout) return;

    const targets = Array.from(layout.querySelectorAll<HTMLElement>(REVEAL_TARGETS.join(',')));
    const matchMedia = gsap.matchMedia();
    const context = gsap.context(() => {
      matchMedia.add('(max-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
        const visual = universe.querySelector<HTMLElement>('.ast-bubble-universe--mobile');
        const center = universe.querySelector<HTMLElement>('.main-ast-bubble');
        const headline = layout.querySelector<HTMLElement>('.hero h1');
        const badge = layout.querySelector<HTMLElement>('.hero .tag');
        const actions = layout.querySelectorAll<HTMLElement>('.hero .row');
        if (!visual || !center) return;

        const revealContent = [badge, headline, ...Array.from(actions)]
          .filter((element): element is HTMLElement => Boolean(element));
        gsap.set([visual, center], { autoAlpha: 0 });
        gsap.set(revealContent, { autoAlpha: 0, y: 18 });

        const entrance = gsap.timeline({ defaults: { ease: 'power2.out' } });
        entrance
          .to(visual, { autoAlpha: 1, duration: 0.45 })
          .to(center, { autoAlpha: 1, duration: 0.55 }, '-=0.12')
          .to(revealContent, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09, clearProps: 'opacity,visibility,transform' }, '-=0.08');

        const visibilityObserver = 'IntersectionObserver' in window
          ? new IntersectionObserver(([entry]) => {
            universe.classList.toggle('is-in-view', entry.isIntersecting);
            if (entry.isIntersecting) entrance.play();
            else entrance.pause();
          }, { threshold: 0.08 })
          : null;
        if (visibilityObserver) visibilityObserver.observe(universe);
        else entrance.play();

        return () => {
          visibilityObserver?.disconnect();
          entrance.kill();
        };
      });
    }, universe);

    targets.forEach((target) => {
      const siblingIndex = target.parentElement ? Array.from(target.parentElement.children).indexOf(target) : 0;
      target.style.setProperty('--home-reveal-delay', `${Math.min(siblingIndex, 4) * 55}ms`);
      target.classList.add('home-scroll-reveal');
    });
    layout.classList.add('home-motion-ready');

    if (!('IntersectionObserver' in window)) targets.forEach((target) => target.classList.add('is-visible'));
    const revealObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
      : null;
    targets.forEach((target) => revealObserver?.observe(target));

    let parallaxFrame = 0;
    const updateParallax = () => {
      if (parallaxFrame || !universe.classList.contains('is-in-view')) return;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxFrame = 0;
        const distance = 88 - universe.getBoundingClientRect().top;
        const shift = Math.max(-5, Math.min(5, distance * 0.02));
        universe.querySelector<HTMLElement>('.ast-bubble-universe--mobile')
          ?.style.setProperty('--mobile-parallax-y', `${shift.toFixed(1)}px`);
      });
    };
    window.addEventListener('scroll', updateParallax, { passive: true });

    return () => {
      context.revert();
      matchMedia.revert();
      revealObserver?.disconnect();
      window.removeEventListener('scroll', updateParallax);
      if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
      universe.querySelector<HTMLElement>('.ast-bubble-universe--mobile')?.style.removeProperty('--mobile-parallax-y');
      layout.classList.remove('home-motion-ready');
    };
  }, []);

  return (
    <div
      ref={universeRef}
      className="mobile-knowledge-universe"
      role="group"
      aria-label="AST Education courses"
    >
      <ASTBubbleUniverse mobile />
    </div>
  );
}
