'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGenerationStore } from '@/store/generationStore';
import { useSettings } from '@/hooks/use-settings';
import { ModelSelector } from './ModelSelector';
import type { DocKind } from '@/lib/db/noteMetadata';
import { validateUrl } from '@/lib/validation';
import { getNoteByUrl } from '@/lib/db/actions';
import { toast } from 'sonner';
import styles from './NoteGenerator.module.css';

export function HeroInput() {
  const router = useRouter();
  const { modelPrefs, hasApiKey } = useSettings();
  const setPending = useGenerationStore((state) => state.setPending);

  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [mode, setMode] = useState<DocKind>('canvas');
  const [sessionModel, setSessionModel] = useState<string | null>(null);

  const effectiveModel = sessionModel ?? modelPrefs.generate;

  const handleGenerate = async () => {
    const result = validateUrl(url);

    if (!result.valid) {
      setUrlError(result.error);
      return;
    }

    // Check for duplicate before navigating
    const existing = await getNoteByUrl(result.url, mode);
    if (existing) {
      const label = mode === 'canvas' ? 'Canvas' : 'Blueprint';
      toast.info(`A ${label.toLowerCase()} already exists for this URL`, {
        description: existing.title || `View the existing ${label.toLowerCase()}`,
        action: {
          label: `View ${label}`,
          onClick: () => router.push(`/doc/${existing.noteId}`),
        },
        duration: 8000,
      });
      return;
    }

    setPending({
      url: result.url,
      mode,
      model: sessionModel,
    });

    router.push('/new');
  };

  return (
    <div className="w-full max-w-xl">
      <div className={styles.modeToggleRow}>
        <div className={styles.modeToggle} aria-label="Document mode">
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'canvas' ? styles.modeButtonActive : ''}`}
            onClick={() => setMode('canvas')}
          >
            Canvas
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'note' ? styles.modeButtonActive : ''}`}
            onClick={() => setMode('note')}
          >
            Blueprint
          </button>
        </div>
      </div>

      <div className={`${styles.inputCard} ${urlError ? styles.inputCardError : ''}`}>
        <div className={styles.inputWrapper}>
          <svg
            className={styles.inputIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGenerate();
              }
            }}
            className={styles.urlInput}
            placeholder="Paste article URL..."
            data-testid="hero-url-input"
          />
        </div>

        <div className={styles.inputDivider} />

        <ModelSelector
          value={effectiveModel}
          onChange={setSessionModel}
          disabled={false}
          className={styles.embeddedModelSelector}
          hasApiKey={hasApiKey}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!url.trim()}
          className={styles.generateButton}
          data-testid="hero-generate-button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>{mode === 'canvas' ? 'Generate Canvas' : 'Generate Blueprint'}</span>
        </button>
      </div>
      {urlError && <p className={styles.errorMessage}>{urlError}</p>}
    </div>
  );
}
