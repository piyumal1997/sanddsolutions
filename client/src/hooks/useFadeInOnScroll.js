// src/hooks/useFadeInOnScroll.js
import { useEffect, useRef, useState } from 'react';

export const useFadeInOnScroll = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // animate only once
        }
      },
      {
        threshold: 0.1,               // 10% visible → trigger
        rootMargin: '0px 0px -80px 0px' // trigger a bit before fully in view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return { ref, isVisible };
};