import { useEffect, useRef } from 'react';

/**
 * Hook to manage focus for accessibility
 * Automatically focuses on the first focusable element when a page loads
 */
export const useFocusOnMount = () => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  return elementRef;
};

/**
 * Hook to trap focus within a modal or dialog
 */
export const useFocusTrap = (isOpen: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return containerRef;
};

/**
 * Hook to restore focus after a modal closes
 */
export const useFocusRestore = () => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    previouslyFocusedElement.current?.focus();
  };

  return { saveFocus, restoreFocus };
};
