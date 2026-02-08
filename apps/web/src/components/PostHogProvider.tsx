'use client';

import { useEffect } from 'react';
import { getOrCreateAnalyticsUserId, isPostHogConfigured } from '@/lib/posthog';

declare global {
  interface Window {
    __vizPostHogInitialized?: boolean;
  }
}

export function PostHogProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !isPostHogConfigured()) {
      return;
    }

    if (window.__vizPostHogInitialized) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!apiKey || !apiHost) {
      return;
    }

    void import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(apiKey, {
          api_host: apiHost,
          capture_pageview: 'history_change',
          capture_pageleave: true,
          loaded: (instance) => {
            const analyticsUserId = getOrCreateAnalyticsUserId();
            instance.identify(analyticsUserId, {
              app: 'viz-notes-d2',
            });
            instance.startExceptionAutocapture();
          },
        });

        window.__vizPostHogInitialized = true;
      })
      .catch(() => {
        // No-op: analytics should never break user flows.
      });
  }, []);

  return null;
}
