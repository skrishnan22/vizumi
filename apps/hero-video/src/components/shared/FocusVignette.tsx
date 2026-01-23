import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface FocusVignetteProps {
  focusX?: number;
  focusY?: number;
  intensity?: number;
  animate?: boolean;
  delay?: number;
  fadeIn?: boolean;
}

export const FocusVignette: React.FC<FocusVignetteProps> = ({
  focusX = 50,
  focusY = 50,
  intensity = 0.6,
  animate = true,
  delay = 0,
  fadeIn = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in the vignette effect
  const fadeProgress = fadeIn
    ? spring({
        frame: frame - delay,
        fps,
        config: { damping: 30, stiffness: 80 },
      })
    : 1;

  const currentIntensity = intensity * fadeProgress;

  // Subtle breathing movement of focus point
  const x = animate ? focusX + Math.sin(frame * 0.015) * 4 : focusX;
  const y = animate ? focusY + Math.cos(frame * 0.012) * 3 : focusY;

  // Subtle pulse of vignette strength
  const pulseIntensity = animate
    ? currentIntensity * (1 + Math.sin(frame * 0.03) * 0.1)
    : currentIntensity;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(
          ellipse 65% 55% at ${x}% ${y}%,
          transparent 0%,
          transparent 35%,
          rgba(28, 26, 23, ${pulseIntensity * 0.2}) 60%,
          rgba(28, 26, 23, ${pulseIntensity * 0.5}) 80%,
          rgba(28, 26, 23, ${pulseIntensity}) 100%
        )`,
      }}
    />
  );
};

// Spotlight variant - brighter center, darker edges
interface SpotlightProps {
  x?: number;
  y?: number;
  size?: number;
  delay?: number;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  x = 50,
  y = 50,
  size = 40,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 25, stiffness: 60 },
  });

  const currentSize = size * progress;

  // Subtle movement
  const spotX = x + Math.sin(frame * 0.02) * 2;
  const spotY = y + Math.cos(frame * 0.015) * 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(
            ellipse ${currentSize}% ${currentSize * 0.8}% at ${spotX}% ${spotY}%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 70%
          ),
          radial-gradient(
            ellipse 100% 100% at 50% 50%,
            transparent 30%,
            rgba(28, 26, 23, 0.4) 100%
          )
        `,
      }}
    />
  );
};
