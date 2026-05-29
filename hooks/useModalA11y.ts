'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal accessibility primitives, shared by the age gate, product detail
 * dialog, and coverage cluster modal (pre-launch QA finding).
 *
 * When `active` is true it:
 *   - moves focus into the dialog container on open;
 *   - traps Tab / Shift+Tab inside the dialog;
 *   - closes on Escape via `onEscape` (omit to disable — e.g. the age-gate
 *     challenge, which must not be dismissable);
 *   - optionally locks body scroll (default on);
 *   - restores focus to the previously-focused element on close.
 *
 * `onEscape` is read through a ref so passing a fresh inline arrow each render
 * does NOT re-run the effect (which would otherwise steal focus on every
 * parent re-render). The effect re-runs only when `active`/`lockScroll` change.
 *
 * The container element must be focusable — give it `tabIndex={-1}`.
 */
export function useModalA11y(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: { onEscape?: () => void; lockScroll?: boolean } = {}
) {
  const { onEscape, lockScroll = true } = options;
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
    };

    // Focus the dialog container itself (a screen reader then announces its
    // label, and the first Tab lands on the first control). rAF so entrance
    // animations have laid the element out before we move focus.
    const raf = requestAnimationFrame(() => {
      (container ?? getFocusable()[0])?.focus?.();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onEscapeRef.current) {
          event.preventDefault();
          event.stopPropagation();
          onEscapeRef.current();
        }
        return;
      }
      if (event.key !== 'Tab' || !container) return;
      const list = getFocusable();
      if (list.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const activeEl = document.activeElement;
      if (event.shiftKey) {
        if (activeEl === first || activeEl === container || !container.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    let prevOverflow: string | undefined;
    if (lockScroll) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      if (lockScroll) document.body.style.overflow = prevOverflow ?? '';
      // Restore focus to whatever opened the modal (keyboard users don't lose
      // their place). Guard in case that element is gone.
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, lockScroll]);
}
