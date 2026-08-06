"use client";
import { useEffect, useRef, useState } from "react";

export function useHeaderVisibility(threshold = 8) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const findScrollParent = (): Element | Window => {
      let el: HTMLElement | null = document.body;
      while (el) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const canScroll =
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight;
        if (canScroll) return el;
        el = el.parentElement;
      }
      return window;
    };

    const scrollEl = findScrollParent();

    const getScrollTop = () =>
      scrollEl === window ? window.scrollY : (scrollEl as Element).scrollTop;

    lastScrollY.current = getScrollTop();

    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = getScrollTop();
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (Math.abs(diff) > threshold) {
        setVisible(diff <= 0); // scrolling down => hide
        lastScrollY.current = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}
