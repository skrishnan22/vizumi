import { useSyncExternalStore, useCallback } from 'react';
import { DEFAULT_MODELS, type ModelPreferenceKey, HEADERS } from '@/lib/constants';

const STORAGE_KEYS = {
  API_KEY: 'openrouter_api_key',
  MODEL_PREFS: 'model_preferences',
} as const;

export type ModelPreferences = Record<ModelPreferenceKey, string>;

// Pub/sub for localStorage changes within the same tab
// (The native 'storage' event only fires in OTHER tabs)
const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((callback) => callback());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    subscribers.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

// Snapshot cache - useSyncExternalStore requires stable references
// If getSnapshot returns a new object each time, React will infinite loop
let cachedApiKey: string | null = null;
let cachedModelPrefsRaw: string | null = null;
let cachedModelPrefs: ModelPreferences = DEFAULT_MODELS;

function getApiKeySnapshot(): string | null {
  const current = localStorage.getItem(STORAGE_KEYS.API_KEY);
  // Strings are primitives, so === comparison works, but cache anyway for consistency
  if (current !== cachedApiKey) {
    cachedApiKey = current;
  }
  return cachedApiKey;
}

function getApiKeyServerSnapshot(): string | null {
  return null;
}

function getModelPrefsSnapshot(): ModelPreferences {
  const raw = localStorage.getItem(STORAGE_KEYS.MODEL_PREFS);
  // Only create new object if the raw string changed
  if (raw !== cachedModelPrefsRaw) {
    cachedModelPrefsRaw = raw;
    cachedModelPrefs = { ...DEFAULT_MODELS, ...(raw ? JSON.parse(raw) : {}) };
  }
  return cachedModelPrefs;
}

function getModelPrefsServerSnapshot(): ModelPreferences {
  return DEFAULT_MODELS;
}

// Hydration detection using useSyncExternalStore (no useEffect needed!)
function subscribeNoop() {
  return () => { };
}
function getIsHydratedSnapshot() {
  return true;
}
function getIsHydratedServerSnapshot() {
  return false;
}

/**
 * Hook for managing user settings (API key and model preferences)
 * Uses useSyncExternalStore for proper React 18+ external store integration
 */
export function useSettings() {
  // Read from localStorage using useSyncExternalStore (no useEffect!)
  const apiKey = useSyncExternalStore(subscribe, getApiKeySnapshot, getApiKeyServerSnapshot);
  const modelPrefs = useSyncExternalStore(subscribe, getModelPrefsSnapshot, getModelPrefsServerSnapshot);
  const isLoaded = useSyncExternalStore(subscribeNoop, getIsHydratedSnapshot, getIsHydratedServerSnapshot);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();

    localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
    emitChange();
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    emitChange();
  }, []);

  const setModelPreference = useCallback((feature: ModelPreferenceKey, model: string) => {
    const current = getModelPrefsSnapshot();
    const updated = { ...current, [feature]: model };
    localStorage.setItem(STORAGE_KEYS.MODEL_PREFS, JSON.stringify(updated));
    emitChange();
  }, []);

  const resetModelPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.MODEL_PREFS);
    emitChange();
  }, []);

  // Generate headers for API requests
  const getRequestHeaders = useCallback(
    (feature: ModelPreferenceKey): Record<string, string> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        [HEADERS.MODEL]: modelPrefs[feature],
      };

      if (apiKey) {
        headers[HEADERS.API_KEY] = apiKey;
      }

      return headers;
    },
    [apiKey, modelPrefs]
  );

  return {
    // State
    apiKey,
    modelPrefs,
    hasApiKey: !!apiKey,
    isLoaded,

    saveApiKey,
    clearApiKey,

    setModelPreference,
    resetModelPreferences,

    getRequestHeaders,
  };
}
