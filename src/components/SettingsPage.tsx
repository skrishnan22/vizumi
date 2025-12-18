'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { AVAILABLE_MODELS } from '@/lib/constants';
import { toast } from 'sonner';
import { Key, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export function SettingsPage() {
  const {
    apiKey,
    modelPrefs,
    saveApiKey,
    clearApiKey,
    setModelPreference,
    isLoaded,
  } = useSettings();

  const [keyInput, setKeyInput] = useState('');

  // Sync keyInput once when settings load from localStorage
  useEffect(() => {
    if (isLoaded && apiKey) {
      setKeyInput(apiKey);
    }
  }, [isLoaded, apiKey]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Loading settings...</div>
      </div>
    );
  }

  const handleSaveKey = () => {
    try {
      saveApiKey(keyInput);
      toast.success('API key saved successfully');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid API key format');
    }
  };

  const handleClearKey = () => {
    clearApiKey();
    setKeyInput('');
    toast.success('API key cleared');
  };

  const handleModelChange = (modelId: string) => {
    // Set the same model for all features
    setModelPreference('generate', modelId);
    setModelPreference('deepDive', modelId);
    setModelPreference('d2Fix', modelId);
    toast.success('Default model updated');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Settings</h1>
          <p className="text-stone-600">
            Configure your OpenRouter API key and default model preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* API Key Section */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Key className="w-5 h-5 text-stone-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-stone-900 mb-1">
                  OpenRouter API Key
                </h2>
                <p className="text-sm text-stone-600">
                  Add your OpenRouter API key to use any model. Without a key, only free
                  tier models are available.{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Get your key here
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-stone-700 mb-2">
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveKey}
                  disabled={!keyInput.trim()}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Save Key
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium"
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {apiKey && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>API key is configured</span>
                </div>
              )}
            </div>
          </section>

          {/* Model Selection Section */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-stone-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-stone-900 mb-1">
                  Default Model
                </h2>
                <p className="text-sm text-stone-600">
                  Choose which AI model to use for generating notes, deep dives, and diagram
                  fixes. Premium models require an API key.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-stone-700 mb-2">
                Select Model
              </label>
              <select
                id="model-select"
                value={modelPrefs.generate}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent bg-white"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>

              <div className="mt-3 text-sm text-stone-500">
                Currently selected: <span className="font-medium text-stone-700">{modelPrefs.generate}</span>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">About Models</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Different models have varying speeds and capabilities</li>
              <li>• Premium models typically provide better quality responses</li>
              <li>• Your API key is stored locally in your browser</li>
              <li>• Free tier models may have rate limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
