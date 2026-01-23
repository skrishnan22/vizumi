import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface ImpactTitleProps {
  text: string;
  delay?: number;
  staggerFrames?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  gradient?: boolean;
}

export const ImpactTitle: React.FC<ImpactTitleProps> = ({
  text,
  delay = 0,
  staggerFrames = 2,
  fontSize = 96,
  fontWeight = 800,
  color = '#0D9488',
  gradient = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gradientStyle = gradient
    ? {
        background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #10B981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : { color };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        overflow: 'visible',
        fontSize,
        fontWeight,
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '-0.03em',
        ...gradientStyle,
      }}
    >
      {text.split('').map((char, i) => {
        const charDelay = delay + i * staggerFrames;

        // Bouncy spring animation
        const progress = spring({
          frame: frame - charDelay,
          fps,
          config: {
            damping: 8,
            stiffness: 150,
            mass: 0.8,
          },
        });

        // Letter rises from below with overshoot
        const y = interpolate(progress, [0, 1], [100, 0]);

        // Scale with overshoot
        const scale = interpolate(
          progress,
          [0, 0.5, 0.75, 1],
          [0.3, 1.3, 0.95, 1]
        );

        // Opacity fades in
        const opacity = interpolate(
          progress,
          [0, 0.25],
          [0, 1],
          { extrapolateRight: 'clamp' }
        );

        // Motion blur effect (simulated with blur)
        const blur = interpolate(
          progress,
          [0, 0.4, 0.7],
          [12, 4, 0],
          { extrapolateRight: 'clamp' }
        );

        // Slight rotation for dynamism
        const rotation = interpolate(
          progress,
          [0, 0.5, 1],
          [-15, 5, 0]
        );

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px) scale(${scale}) rotate(${rotation}deg)`,
              opacity,
              filter: `blur(${blur}px)`,
              // Preserve space character width
              minWidth: char === ' ' ? '0.3em' : undefined,
              willChange: 'transform, opacity, filter',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};
