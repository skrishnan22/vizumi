import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_MODELS, ModelPreferenceKey, HEADERS } from '@/lib/constants';

const STORAGE_KEYS = {
  API_KEY: 'openrouter_api_key',
  MODEL_PREFS: 'model_preferences',
} as const;

export type ModelPreferences = Record<ModelPreferenceKey, string>;

/**
 * Hook for managing user settings (API key and model preferences)
 * Stores in localStorage and provides helpers for API requests
 */
export function useSettings() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [modelPrefs, setModelPrefsState] = useState<ModelPreferences>(DEFAULT_MODELS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const storedPrefs = localStorage.getItem(STORAGE_KEYS.MODEL_PREFS) || '{}';

    setApiKeyState(storedKey);
    setModelPrefsState({ ...DEFAULT_MODELS, ...JSON.parse(storedPrefs) });

    setIsLoaded(true);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed && !trimmed.startsWith('sk-or-')) {
      throw new Error('Invalid key format. OpenRouter keys start with "sk-or-"');
    }
    localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
    setApiKeyState(trimmed);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setApiKeyState(null);
  }, []);

  const setModelPreference = useCallback((feature: ModelPreferenceKey, model: string) => {
    setModelPrefsState((prev) => {
      const updated = { ...prev, [feature]: model };
      localStorage.setItem(STORAGE_KEYS.MODEL_PREFS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetModelPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.MODEL_PREFS);
    setModelPrefsState(DEFAULT_MODELS);
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
