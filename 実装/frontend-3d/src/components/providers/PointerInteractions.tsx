"use client";

import { useEffect } from "react";

const HOVER_TARGET_SELECTOR = "a, button, input, textarea, [role='button']";
const MAGNETIC_SELECTOR = "[data-magnetic]";

/**
 * Desktop-only polish: a custom cursor dot that grows over interactive
 * elements, plus a gentle "magnetic" pull on primary buttons toward the
 * pointer. Gated on `(pointer: fine)` so it never touches the mobile
 * experience most guests will actually use.
 */
export function PointerInteractions() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const handleMove = (e: PointerEvent) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    const handleOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(HOVER_TARGET_SELECTOR)) {
        cursor.classList.add("is-active");
      }
    };
    const handleOut = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(HOVER_TARGET_SELECTOR)) {
        cursor.classList.remove("is-active");
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);

    const magnets = Array.from(
      document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR)
    );
    magnets.forEach((el) => el.classList.add("magnetic"));

    const magnetMove = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
    };
    const magnetLeave = (e: PointerEvent) => {
      (e.currentTarget as HTMLElement).style.transform = "";
    };

    magnets.forEach((el) => {
      el.addEventListener("pointermove", magnetMove);
      el.addEventListener("pointerleave", magnetLeave);
    });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      magnets.forEach((el) => {
        el.removeEventListener("pointermove", magnetMove);
        el.removeEventListener("pointerleave", magnetLeave);
      });
      cursor.remove();
    };
  }, []);

  return null;
}
