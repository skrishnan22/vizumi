import React from 'react';
import { useCurrentFrame } from 'remotion';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}';

interface ScrambleTextProps {
  text: string;
  delay?: number;
  scrambleFrames?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  delay = 0,
  scrambleFrames = 25,
  staggerFrames = 2,
  style,
}) => {
  const frame = useCurrentFrame();

  const displayText = text.split('').map((targetChar, i) => {
    // Each character starts revealing at a staggered time
    const charStart = delay + i * staggerFrames;
    const charEnd = charStart + scrambleFrames;
    const localFrame = frame - charStart;

    // Not started yet
    if (localFrame < 0) {
      return { char: ' ', opacity: 0 };
    }

    // Fully revealed
    if (localFrame >= scrambleFrames) {
      return { char: targetChar, opacity: 1 };
    }

    // Scrambling phase - cycle through random characters
    // Use a deterministic "random" based on frame and index
    const progress = localFrame / scrambleFrames;

    // As we get closer to the end, increase chance of showing correct char
    if (progress > 0.7 && Math.sin(localFrame * 10 + i * 100) > 0) {
      return { char: targetChar, opacity: 1 };
    }

    // Show scrambled character
    const scrambleIndex = Math.floor(
      ((localFrame * 7 + i * 13) % SCRAMBLE_CHARS.length)
    );
    const scrambleChar = targetChar === ' ' ? ' ' : SCRAMBLE_CHARS[scrambleIndex];

    return { char: scrambleChar, opacity: 0.7 + progress * 0.3 };
  });

  return (
    <span style={{ fontFamily: 'monospace', ...style }}>
      {displayText.map((item, i) => (
        <span
          key={i}
          style={{
            opacity: item.opacity,
            color: item.char === text[i] ? undefined : '#0D9488',
          }}
        >
          {item.char === ' ' ? '\u00A0' : item.char}
        </span>
      ))}
    </span>
  );
};

// Word-by-word variant
interface ScrambleWordsProps {
  text: string;
  delay?: number;
  scrambleFrames?: number;
  wordGap?: number;
  style?: React.CSSProperties;
}

export const ScrambleWords: React.FC<ScrambleWordsProps> = ({
  text,
  delay = 0,
  scrambleFrames = 20,
  wordGap = 10,
  style,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <span style={style}>
      {words.map((word, wordIndex) => {
        const wordDelay = delay + wordIndex * (scrambleFrames + wordGap);

        return (
          <React.Fragment key={wordIndex}>
            <ScrambleText
              text={word}
              delay={wordDelay}
              scrambleFrames={scrambleFrames}
              staggerFrames={1}
            />
            {wordIndex < words.length - 1 && '\u00A0'}
          </React.Fragment>
        );
      })}
    </span>
  );
};
