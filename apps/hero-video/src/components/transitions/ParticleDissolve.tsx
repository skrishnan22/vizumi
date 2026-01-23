import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

interface ParticleDissolveProps extends Record<string, unknown> {
  particleCount?: number;
  particleColor?: string;
}

const ParticleDissolvePresentation: React.FC<
  TransitionPresentationComponentProps<ParticleDissolveProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { particleCount = 60, particleColor = '#0D9488' } = passedProps;
  const progress = presentationProgress;
  const isEntering = presentationDirection === 'entering';

  // Generate particles deterministically
  const particles = useMemo(() => {
    const PHI = 1.618033988749895;
    return Array.from({ length: particleCount }, (_, i) => ({
      startX: (i * PHI * 100) % 100,
      startY: (i * 2.236 * 100) % 100,
      // Scatter to edges
      endX: 50 + (Math.sin(i * 0.7) * 60),
      endY: 50 + (Math.cos(i * 0.9) * 50),
      size: 3 + (i % 4) * 2,
      delay: (i % 15) / 100,
    }));
  }, [particleCount]);

  if (isEntering) {
    // Incoming: particles gather into scene
    const sceneOpacity = interpolate(
      progress,
      [0.4, 0.8],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const sceneScale = interpolate(
      progress,
      [0.4, 1],
      [0.95, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <>
        <AbsoluteFill
          style={{
            opacity: sceneOpacity,
            transform: `scale(${sceneScale})`,
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Particles gathering */}
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {particles.map((p, i) => {
            const particleProgress = Math.max(
              0,
              Math.min(1, (progress - p.delay) / 0.7)
            );

            // Start scattered, end at position
            const x = interpolate(
              particleProgress,
              [0, 1],
              [p.endX, p.startX]
            );
            const y = interpolate(
              particleProgress,
              [0, 1],
              [p.endY, p.startY]
            );
            const opacity = interpolate(
              particleProgress,
              [0, 0.2, 0.8, 1],
              [0, 1, 1, 0]
            );
            const scale = interpolate(
              particleProgress,
              [0, 0.5, 1],
              [0.5, 1.2, 0.3]
            );

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: particleColor,
                  opacity,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  boxShadow: `0 0 ${p.size * 2}px ${particleColor}80`,
                }}
              />
            );
          })}
        </AbsoluteFill>
      </>
    );
  } else {
    // Outgoing: scene dissolves into particles
    const sceneOpacity = interpolate(
      progress,
      [0, 0.4],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const sceneScale = interpolate(
      progress,
      [0, 0.4],
      [1, 1.05],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <>
        <AbsoluteFill
          style={{
            opacity: sceneOpacity,
            transform: `scale(${sceneScale})`,
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Particles scattering */}
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {particles.map((p, i) => {
            const particleProgress = Math.max(
              0,
              Math.min(1, (progress - p.delay) / 0.8)
            );

            // Start at position, scatter outward
            const x = interpolate(
              particleProgress,
              [0, 1],
              [p.startX, p.endX]
            );
            const y = interpolate(
              particleProgress,
              [0, 1],
              [p.startY, p.endY]
            );
            const opacity = interpolate(
              particleProgress,
              [0, 0.2, 0.7, 1],
              [0, 1, 1, 0]
            );
            const scale = interpolate(
              particleProgress,
              [0, 0.3, 1],
              [0.3, 1.2, 0.5]
            );

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: particleColor,
                  opacity,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  boxShadow: `0 0 ${p.size * 2}px ${particleColor}80`,
                }}
              />
            );
          })}
        </AbsoluteFill>
      </>
    );
  }
};

export const particleDissolve = (
  props: ParticleDissolveProps = {}
): TransitionPresentation<ParticleDissolveProps> => {
  return {
    component: ParticleDissolvePresentation,
    props,
  };
};
