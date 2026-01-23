import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface FeatureCard3DProps {
  icon: string;
  title: string;
  subtitle: string;
  position?: { x: number; y: number; z: number };
  delay?: number;
  floating?: boolean;
}

const COLORS = {
  bgPaper: '#FFFFFF',
  primary: '#0D9488',
  primaryDark: '#0F766E',
  accentGreen: '#10B981',
  text: '#1c1a17',
  textMuted: '#64748b',
  border: '#E5E0D5',
};

export const FeatureCard3D: React.FC<FeatureCard3DProps> = ({
  icon,
  title,
  subtitle,
  position = { x: 0, y: 0, z: 0 },
  delay = 0,
  floating = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation with overshoot
  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1 },
  });

  const entryScale = interpolate(
    entryProgress,
    [0, 0.5, 0.8, 1],
    [0.3, 1.15, 0.98, 1]
  );
  const entryY = interpolate(entryProgress, [0, 1], [120, 0]);
  const entryOpacity = interpolate(
    entryProgress,
    [0, 0.3],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const entryRotateX = interpolate(entryProgress, [0, 1], [25, 0]);

  // Floating motion (after entry)
  const floatY = floating && entryProgress > 0.9
    ? Math.sin((frame - delay) * 0.025) * 10
    : 0;
  const floatRotateX = floating && entryProgress > 0.9
    ? Math.sin((frame - delay) * 0.018) * 2
    : 0;
  const floatRotateY = floating && entryProgress > 0.9
    ? Math.cos((frame - delay) * 0.022) * 2
    : 0;

  // Icon animation
  const iconProgress = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 8, stiffness: 120 },
  });
  const iconScale = interpolate(iconProgress, [0, 0.5, 1], [0, 1.4, 1]);
  const iconRotation = interpolate(iconProgress, [0, 1], [-180, 0]);

  // Text stagger
  const titleProgress = spring({
    frame: frame - delay - 12,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [25, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subtitleProgress = spring({
    frame: frame - delay - 18,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Animated gradient border
  const borderAngle = interpolate(
    frame - delay,
    [0, 120],
    [0, 360],
    { extrapolateRight: 'extend' }
  );

  // Glow effect
  const glowIntensity = 10 + Math.sin((frame - delay) * 0.05) * 5;

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: `
          translateX(-50%) translateY(-50%)
          translateY(${entryY + floatY}px)
          scale(${entryScale})
          perspective(1000px)
          rotateX(${entryRotateX + floatRotateX}deg)
          rotateY(${floatRotateY}deg)
          translateZ(${position.z}px)
        `,
        opacity: entryOpacity,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Animated gradient border wrapper */}
      <div
        style={{
          padding: 3,
          borderRadius: 28,
          background: `linear-gradient(${borderAngle}deg, ${COLORS.primaryDark}, ${COLORS.primary}, ${COLORS.accentGreen}, ${COLORS.primary}, ${COLORS.primaryDark})`,
          boxShadow: `0 0 ${glowIntensity}px rgba(13, 148, 136, 0.3)`,
        }}
      >
        {/* Card content */}
        <div
          style={{
            backgroundColor: COLORS.bgPaper,
            borderRadius: 25,
            padding: '50px 70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            minWidth: 450,
          }}
        >
          {/* Icon with glow */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              backgroundColor: `${COLORS.primary}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              transform: `scale(${iconScale}) rotate(${iconRotation}deg)`,
              boxShadow: `0 0 ${glowIntensity * 2}px rgba(13, 148, 136, 0.2)`,
            }}
          >
            {icon}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              color: COLORS.text,
              letterSpacing: '-0.02em',
              transform: `translateY(${titleY}px)`,
              opacity: titleOpacity,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              fontFamily: 'Outfit, sans-serif',
              color: COLORS.textMuted,
              transform: `translateY(${subtitleY}px)`,
              opacity: subtitleOpacity,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};
