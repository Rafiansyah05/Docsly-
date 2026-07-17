'use client';

import { useEffect } from 'react';


export function LandingLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenisInstance: any;
    
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });
      lenisInstance = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }).catch(err => console.error("Failed to load lenis:", err));

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html, body {
          overflow: auto !important;
          height: auto !important;
        }
      `}} />
      {children}
    </>
  );
}
