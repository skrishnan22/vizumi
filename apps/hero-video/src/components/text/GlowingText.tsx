import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface GlowingTextProps {
  children: React.ReactNode;
  color?: string;
  pulseSpeed?: number;
  minGlow?: number;
  maxGlow?: number;
  style?: React.CSSProperties;
}

export const GlowingText: React.FC<GlowingTextProps> = ({
  children,
  color = '#0D9488',
  pulseSpeed = 0.06,
  minGlow = 15,
  maxGlow = 45,
  style,
}) => {
  const frame = useCurrentFrame();

  // Pulsing glow intensity
  const glowIntensity = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [minGlow, maxGlow]
  );

  // Pulsing shadow opacity
  const shadowOpacity = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [0.35, 0.75]
  );

  // Convert hex to rgba for shadow
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <span
      style={{
        textShadow: `
          0 0 ${glowIntensity * 0.5}px ${hexToRgba(color, shadowOpacity)},
          0 0 ${glowIntensity}px ${hexToRgba(color, shadowOpacity * 0.7)},
          0 0 ${glowIntensity * 1.5}px ${hexToRgba(color, shadowOpacity * 0.5)},
          0 0 ${glowIntensity * 2.5}px ${hexToRgba(color, shadowOpacity * 0.3)}
        `,
        willChange: 'text-shadow',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Gradient text with glow variant
interface GlowingGradientTextProps extends Omit<GlowingTextProps, 'color'> {
  gradientColors?: string[];
}

export const GlowingGradientText: React.FC<GlowingGradientTextProps> = ({
  children,
  gradientColors = ['#0F766E', '#0D9488', '#10B981'],
  pulseSpeed = 0.06,
  minGlow = 15,
  maxGlow = 45,
  style,
}) => {
  const frame = useCurrentFrame();

  const glowIntensity = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [minGlow, maxGlow]
  );

  const shadowOpacity = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [0.35, 0.75]
  );

  return (
    <span
      style={{
        background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: `drop-shadow(0 0 ${glowIntensity}px rgba(13, 148, 136, ${shadowOpacity}))`,
        willChange: 'filter',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
