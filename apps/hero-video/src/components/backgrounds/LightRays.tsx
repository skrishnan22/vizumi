import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface LightRaysProps {
  originX?: number;
  originY?: number;
  rayCount?: number;
  color?: string;
  intensity?: number;
}

export const LightRays: React.FC<LightRaysProps> = ({
  originX = 50,
  originY = 30,
  rayCount = 12,
  color = 'rgba(13, 148, 136, 1)',
  intensity = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: rayCount }, (_, i) => {
        const baseAngle = (i / rayCount) * 360;
        // Slow rotation of the entire ray system
        const rotationOffset = frame * 0.1;
        const angle = baseAngle + rotationOffset;

        const pulseOffset = i * 15;

        // Pulsing opacity
        const opacity = interpolate(
          Math.sin((frame + pulseOffset) * 0.025),
          [-1, 1],
          [0.015 * intensity, 0.08 * intensity]
        );

        // Pulsing length
        const length = interpolate(
          Math.sin((frame + pulseOffset) * 0.02),
          [-1, 1],
          [70, 110]
        );

        // Varying width
        const width = 2 + (i % 3) * 2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${originX}%`,
              top: `${originY}%`,
              width: width,
              height: `${length}%`,
              background: `linear-gradient(
                180deg,
                ${color.replace('1)', `${opacity})`)} 0%,
                ${color.replace('1)', `${opacity * 0.5})`)} 40%,
                transparent 100%
              )`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'top center',
              filter: 'blur(6px)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
