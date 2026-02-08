'use client';

import { useEffect, useState } from 'react';

const MOBILE_MOTION_QUERY = '(max-width: 767px), (pointer: coarse)';

export function useIsMobileMotionDevice() {
  const [isMobileMotionDevice, setIsMobileMotionDevice] = useState(false);

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
