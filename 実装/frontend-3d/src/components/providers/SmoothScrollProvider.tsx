"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

// Safari (particularly iOS) stutters with Lenis's default touch sync and low
// lerp; bumping lerp and disabling syncTouch fixes it without hurting the
// feel on other platforms.
const lenisOptions = {
  lerp: 0.1,
  duration: 1.2,
  smoothWheel: true,
  syncTouch: false,
  touchMultiplier: 1.5,
};

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}
