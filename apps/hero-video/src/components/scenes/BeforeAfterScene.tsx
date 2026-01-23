import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DramaticBackground } from '../backgrounds';

export const BeforeAfterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Divider animation - slides from left to center
  const dividerProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 18, stiffness: 50 },
  });

  const dividerX = interpolate(dividerProgress, [0, 1], [5, 50]); // Percentage

  // Labels fade in
  const beforeLabelProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const afterLabelProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Divider glow pulse
  const glowIntensity = 15 + Math.sin(frame * 0.08) * 8;

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F2EB' }}>
      {/* BEFORE side (dark, messy) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${dividerX}%`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width,
            height: '100%',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
          }}
        >
          {/* Messy text representation */}
          <div
            style={{
              maxWidth: 600,
              color: '#888',
              fontSize: 14,
              lineHeight: 1.8,
              fontFamily: 'Georgia, serif',
              opacity: 0.7,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i} style={{ margin: '8px 0' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>

          {/* BEFORE label */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 50,
              color: '#ef4444',
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.1em',
              opacity: interpolate(beforeLabelProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(beforeLabelProgress, [0, 1], [20, 0])}px)`,
            }}
          >
            BEFORE
          </div>
        </div>
      </div>

      {/* AFTER side (bright, visual) */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: `${100 - dividerX}%`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            width,
            height: '100%',
          }}
        >
          <DramaticBackground intensity={0.8} showLightRays={false}>
            <AbsoluteFill
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 60,
              }}
            >
              {/* Visual notes representation */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 20,
                  maxWidth: 700,
                }}
              >
                {/* Mind map / diagram representation */}
                {Array.from({ length: 6 }, (_, i) => {
                  const cardDelay = 50 + i * 8;
                  const cardProgress = spring({
                    frame: frame - cardDelay,
                    fps,
                    config: { damping: 12, stiffness: 80 },
                  });

                  const colors = ['#0D9488', '#10B981', '#14B8A6', '#0F766E', '#059669', '#0D9488'];

                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderLeft: `4px solid ${colors[i]}`,
                        opacity: interpolate(cardProgress, [0, 1], [0, 1]),
                        transform: `
                          translateY(${interpolate(cardProgress, [0, 1], [30, 0])}px)
                          scale(${interpolate(cardProgress, [0, 1], [0.9, 1])})
                        `,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          backgroundColor: `${colors[i]}30`,
                          borderRadius: 4,
                          marginBottom: 10,
                        }}
                      />
                      <div
                        style={{
                          width: '80%',
                          height: 6,
                          backgroundColor: '#e5e7eb',
                          borderRadius: 3,
                          marginBottom: 6,
                        }}
                      />
                      <div
                        style={{
                          width: '60%',
                          height: 6,
                          backgroundColor: '#e5e7eb',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* AFTER label */}
              <div
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 50,
                  color: '#10B981',
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.1em',
                  opacity: interpolate(afterLabelProgress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(afterLabelProgress, [0, 1], [20, 0])}px)`,
                }}
              >
                AFTER
              </div>
            </AbsoluteFill>
          </DramaticBackground>
        </div>
      </div>

      {/* Animated divider line */}
      <div
        style={{
          position: 'absolute',
          left: `${dividerX}%`,
          top: 0,
          width: 5,
          height: '100%',
          backgroundColor: '#0D9488',
          boxShadow: `
            0 0 ${glowIntensity}px rgba(13, 148, 136, 0.6),
            0 0 ${glowIntensity * 2}px rgba(13, 148, 136, 0.4)
          `,
          transform: 'translateX(-50%)',
        }}
      />

      {/* Divider handle/dot */}
      <div
        style={{
          position: 'absolute',
          left: `${dividerX}%`,
          top: '50%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#0D9488',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 ${glowIntensity * 1.5}px rgba(13, 148, 136, 0.5)`,
        }}
      >
        <div style={{ color: 'white', fontSize: 18 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
