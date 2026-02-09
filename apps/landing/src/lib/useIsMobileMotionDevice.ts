'use client';

import { useEffect, useState } from 'react';

const MOBILE_MOTION_QUERY = '(max-width: 767px), (pointer: coarse)';

export function useIsMobileMotionDevice() {
  // Keep the first render deterministic across server and client.
  // We prefer simplified motion until the client computes the real value.
  const [isMobileMotionDevice, setIsMobileMotionDevice] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MOTION_QUERY);

    const update = () => {
      setIsMobileMotionDevice(mediaQuery.matches);
    };

    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return isMobileMotionDevice;
}
