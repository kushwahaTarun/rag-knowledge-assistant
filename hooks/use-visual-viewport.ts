"use client";

import { useEffect, useState } from "react";

/**
 * Returns how many pixels the on-screen keyboard (or browser chrome) is
 * covering at the bottom of the layout viewport.
 *
 * Used on the chat page so the composer stays above the mobile keyboard.
 */
export function useKeyboardBottomInset() {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const update = () => {
      // Difference between layout viewport and visible viewport, accounting for offset
      const inset = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      );
      setBottomInset(inset > 40 ? inset : 0);
    };

    update();
    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      visualViewport.removeEventListener("resize", update);
      visualViewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return bottomInset;
}
