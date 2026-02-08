'use client';

import { useEffect, useState } from 'react';

const MOBILE_MOTION_QUERY = '(max-width: 767px), (pointer: coarse)';

export function useIsMobileMotionDevice() {
  // Initialize with true during SSR to prevent hydration mismatch.
  // This ensures mobile devices start with simplified animations rather than
  // flashing desktop animations before switching.
  const [isMobileMotionDevice, setIsMobileMotionDevice] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(MOBILE_MOTION_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MOTION_QUERY);

    const update = () => {
      setIsMobileMotionDevice(mediaQuery.matches);
    };

    // Only update if value changed to avoid unnecessary re-renders
    if (mediaQuery.matches !== isMobileMotionDevice) {
      update();
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [isMobileMotionDevice]);

  return isMobileMotionDevice;
}
