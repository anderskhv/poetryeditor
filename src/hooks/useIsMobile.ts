import { useState, useEffect } from 'react';

/**
 * Detect mobile/touch devices for editor switching.
 * Decision is locked at mount — does NOT swap mid-session
 * (would lose cursor position and undo history).
 */
export function useIsMobile(): boolean {
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    return hasCoarsePointer && hasTouchPoints;
  });

  return isMobile;
}
