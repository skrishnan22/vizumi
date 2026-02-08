'use client';

import type posthogJs from 'posthog-js';

type GenerationMode = 'canvas' | 'note';

type GenerationAttempt = {
  docId: string;
  mode: GenerationMode;
  model: string;
  url: string;
  startedAt: number;
  source: 'home' | 'new-page';
};

type AnalyticsProperties = Record<string, unknown>;

type ErrorDetails = {
  error_name: string;
  error_message: string;
  error_stack?: string;
};

const LOCAL_ANALYTICS_USER_ID_KEY = 'viz_notes_analytics_user_id';

type PostHogClient = typeof posthogJs;

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST);
}

function withPostHog(callback: (client: PostHogClient) => void): void {
  if (typeof window === 'undefined' || !isPostHogConfigured()) {
    return;
  }

  void import('posthog-js')
    .then(({ default: posthog }) => {
      callback(posthog);
    })
    .catch(() => {
      // No-op: analytics should never break user flows.
    });
}

export function getOrCreateAnalyticsUserId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existingId = localStorage.getItem(LOCAL_ANALYTICS_USER_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const generatedId = `viz_${crypto.randomUUID()}`;
  localStorage.setItem(LOCAL_ANALYTICS_USER_ID_KEY, generatedId);
  return generatedId;
}

function modeProperties(mode: GenerationMode): AnalyticsProperties {
  return {
    generation_mode: mode,
    output_type: mode === 'note' ? 'blueprint' : 'canvas',
  };
}

function urlHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function trackGenerationStarted(attempt: GenerationAttempt): void {
  withPostHog((posthog) => {
    posthog.capture('doc_generation_started', {
      ...modeProperties(attempt.mode),
      model: attempt.model,
      doc_id: attempt.docId,
      source: attempt.source,
      url_hostname: urlHostname(attempt.url),
    });
  });
}

export function trackGenerationSucceeded(
  attempt: GenerationAttempt,
  extraProperties: AnalyticsProperties = {}
): void {
  withPostHog((posthog) => {
    posthog.capture('doc_generation_succeeded', {
      ...modeProperties(attempt.mode),
      model: attempt.model,
      doc_id: attempt.docId,
      source: attempt.source,
      url_hostname: urlHostname(attempt.url),
      duration_ms: Date.now() - attempt.startedAt,
      ...extraProperties,
    });
  });
}

export function trackGenerationDuplicate(args: {
  mode: GenerationMode;
  model: string;
  url: string;
  existingDocId: string;
}): void {
  withPostHog((posthog) => {
    posthog.capture('doc_generation_duplicate_found', {
      ...modeProperties(args.mode),
      model: args.model,
      existing_doc_id: args.existingDocId,
      url_hostname: urlHostname(args.url),
    });
  });
}

function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
    };
  }

  return {
    error_name: 'UnknownError',
    error_message: String(error),
  };
}

export function trackGenerationFailed(
  attempt: GenerationAttempt,
  error: unknown,
  extraProperties: AnalyticsProperties = {}
): void {
  withPostHog((posthog) => {
    posthog.capture('doc_generation_failed', {
      ...modeProperties(attempt.mode),
      model: attempt.model,
      doc_id: attempt.docId,
      source: attempt.source,
      url_hostname: urlHostname(attempt.url),
      duration_ms: Date.now() - attempt.startedAt,
      ...getErrorDetails(error),
      ...extraProperties,
    });
  });
}

export function trackClientError(error: unknown, properties: AnalyticsProperties = {}): void {
  const errorDetails = getErrorDetails(error);
  withPostHog((posthog) => {
    posthog.captureException(error, {
      ...errorDetails,
      ...properties,
    });
  });
}

export type { GenerationAttempt };
