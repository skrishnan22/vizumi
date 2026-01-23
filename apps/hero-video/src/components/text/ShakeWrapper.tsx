import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface ShakeConfig {
  intensity?: number;
  duration?: number;
  frequency?: number;
}

export const getShakeOffset = (
  frame: number,
  startFrame: number,
  config: ShakeConfig = {}
): { x: number; y: number; rotation: number } => {
  const { intensity = 12, duration = 18, frequency = 1.5 } = config;

  const progress = (frame - startFrame) / duration;

  // Not yet started or finished
  if (progress < 0 || progress > 1) {
    return { x: 0, y: 0, rotation: 0 };
  }

  // Exponential decay
  const decay = Math.pow(1 - progress, 2);

  // High-frequency shake using multiple sine waves for chaos
  const shakeX =
    (Math.sin(frame * frequency * 1.5) * 0.7 +
      Math.sin(frame * frequency * 2.3 + 1) * 0.3) *
    intensity *
    decay;

  const shakeY =
    (Math.cos(frame * frequency * 1.3) * 0.6 +
      Math.cos(frame * frequency * 1.9 + 2) * 0.4) *
    intensity *
    decay *
    0.8;

  const rotation =
    Math.sin(frame * frequency * 2) * 0.8 * decay;

  return { x: shakeX, y: shakeY, rotation };
};

interface ShakeWrapperProps {
  children: React.ReactNode;
  triggerFrame: number;
  intensity?: number;
  duration?: number;
  frequency?: number;
  style?: React.CSSProperties;
}

export const ShakeWrapper: React.FC<ShakeWrapperProps> = ({
  children,
  triggerFrame,
  intensity = 12,
  duration = 18,
  frequency = 1.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const { x, y, rotation } = getShakeOffset(frame, triggerFrame, {
    intensity,
    duration,
    frequency,
  });

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Impact shake - for dramatic moments with a "slam" effect
interface ImpactShakeProps {
  children: React.ReactNode;
  triggerFrame: number;
  scale?: number;
  style?: React.CSSProperties;
}

export const ImpactShake: React.FC<ImpactShakeProps> = ({
  children,
  triggerFrame,
  scale = 1.1,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = (frame - triggerFrame);

  if (progress < 0) {
    return <div style={style}>{children}</div>;
  }

  // Quick scale bump that decays
  const impactScale = progress < 8
    ? interpolate(progress, [0, 3, 8], [1, scale, 1])
    : 1;

  // Shake after impact
  const { x, y, rotation } = getShakeOffset(frame, triggerFrame + 2, {
    intensity: 15,
    duration: 20,
    frequency: 2,
  });

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${impactScale})`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
