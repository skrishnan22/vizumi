import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface BrowserMockupProps {
  children: React.ReactNode;
  url?: string;
  delay?: number;
  animate?: boolean;
}

const COLORS = {
  bgPaper: '#FFFFFF',
  border: '#E5E0D5',
  textMuted: '#64748b',
};

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  children,
  url = 'vizdeck.app',
  delay = 0,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const progress = animate
    ? spring({
        frame: frame - delay,
        fps,
        config: { damping: 18, stiffness: 70 },
      })
    : 1;

  const y = interpolate(progress, [0, 1], [80, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtle shadow pulse
  const shadowIntensity = 0.08 + Math.sin(frame * 0.03) * 0.02;

  return (
    <div
      style={{
        width: '92%',
        maxWidth: 1450,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, ${shadowIntensity}),
          0 12px 24px -8px rgba(0, 0, 0, ${shadowIntensity * 0.6})
        `,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bgPaper,
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Browser header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          backgroundColor: '#f8fafc',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 9 }}>
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.1)',
            }}
          />
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#eab308',
              boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.1)',
            }}
          />
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.bgPaper,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 9,
              padding: '7px 20px',
              fontSize: 15,
              fontFamily: 'Outfit, sans-serif',
              color: COLORS.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: '#22c55e', fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </span>
            {url}
          </div>
        </div>

        {/* Spacer for balance */}
        <div style={{ width: 70 }} />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
