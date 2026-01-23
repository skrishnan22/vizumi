import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
  direction?: 'up' | 'down' | 'radial';
  speedMultiplier?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 80,
  color = '#0D9488',
  direction = 'up',
  speedMultiplier = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate particles deterministically using golden ratio for even distribution
  const particles: Particle[] = useMemo(() => {
    const PHI = 1.618033988749895;
    const SQRT5 = 2.236067977499790;

    return Array.from({ length: count }, (_, i) => ({
      x: ((i * PHI * width) % width),
      y: ((i * SQRT5 * height) % height),
      size: 2 + (i % 5) * 1.5,
      speed: (0.3 + (i % 10) * 0.15) * speedMultiplier,
      opacity: 0.2 + (i % 7) * 0.1,
      delay: (i % 25) * 2,
    }));
  }, [count, width, height, speedMultiplier]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const localFrame = Math.max(0, frame - p.delay);

        let xPos = p.x;
        let yPos = p.y;

        if (direction === 'up') {
          // Move upward, wrap around
          yPos = ((p.y - localFrame * p.speed) % (height + 40)) + 20;
          if (yPos < -20) yPos += height + 40;
        } else if (direction === 'down') {
          yPos = ((p.y + localFrame * p.speed) % (height + 40)) - 20;
        } else if (direction === 'radial') {
          // Radial outward motion from center
          const centerX = width / 2;
          const centerY = height / 2;
          const angle = Math.atan2(p.y - centerY, p.x - centerX);
          const distance = localFrame * p.speed * 0.5;
          xPos = p.x + Math.cos(angle) * distance;
          yPos = p.y + Math.sin(angle) * distance;
        }

        // Pulse opacity using sine wave
        const pulseOpacity = interpolate(
          Math.sin(localFrame * 0.04 + i * 0.5),
          [-1, 1],
          [p.opacity * 0.4, p.opacity]
        );

        // Slight horizontal drift
        const drift = Math.sin(localFrame * 0.02 + i) * 3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xPos + drift,
              top: yPos,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: pulseOpacity,
              filter: p.size > 4 ? 'blur(1px)' : 'none',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
