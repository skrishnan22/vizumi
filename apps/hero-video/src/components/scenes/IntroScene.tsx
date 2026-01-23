import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DramaticBackground } from '../backgrounds';
import { ImpactTitle } from '../text/ImpactTitle';
import { GlowingGradientText } from '../text/GlowingText';
import { ImpactShake } from '../text/ShakeWrapper';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tagline animation - appears after logo lands
  const taglineProgress = spring({
    frame: frame - 55,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);

  // Subtitle word-by-word reveal
  const words = ['From', 'URL', 'to', 'mental', 'model'];

  return (
    <DramaticBackground
      intensity={1.2}
      lightRayOrigin={{ x: 50, y: 35 }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Shake wrapper for impact when logo lands */}
        <ImpactShake triggerFrame={35} scale={1.05}>
          <div style={{ textAlign: 'center' }}>
            {/* Main logo with letter-by-letter reveal */}
            <ImpactTitle
              text="VizDeck"
              delay={8}
              staggerFrames={3}
              fontSize={120}
              fontWeight={800}
            />

            {/* Tagline */}
            <div
              style={{
                marginTop: 30,
                transform: `translateY(${taglineY}px)`,
                opacity: taglineOpacity,
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {words.map((word, i) => {
                const wordDelay = 60 + i * 6;
                const wordProgress = spring({
                  frame: frame - wordDelay,
                  fps,
                  config: { damping: 15, stiffness: 100 },
                });

                const wordY = interpolate(wordProgress, [0, 1], [20, 0]);
                const wordOpacity = interpolate(wordProgress, [0, 1], [0, 1]);

                // Highlight "URL" and "mental model"
                const isHighlight = word === 'URL' || word === 'mental' || word === 'model';

                return (
                  <span
                    key={i}
                    style={{
                      fontSize: 36,
                      fontWeight: isHighlight ? 600 : 400,
                      fontFamily: 'Outfit, sans-serif',
                      color: isHighlight ? '#0D9488' : '#64748b',
                      transform: `translateY(${wordY}px)`,
                      opacity: wordOpacity,
                      display: 'inline-block',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </ImpactShake>
      </AbsoluteFill>
    </DramaticBackground>
  );
};
