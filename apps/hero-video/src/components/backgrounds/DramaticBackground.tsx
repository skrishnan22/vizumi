import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { ParticleField } from './ParticleField';
import { AuroraGradient } from './AuroraGradient';
import { LightRays } from './LightRays';

interface DramaticBackgroundProps {
  children?: React.ReactNode;
  intensity?: number;
  showParticles?: boolean;
  showAurora?: boolean;
  showLightRays?: boolean;
  particleColor?: string;
  lightRayOrigin?: { x: number; y: number };
}

export const DramaticBackground: React.FC<DramaticBackgroundProps> = ({
  children,
  intensity = 1,
  showParticles = true,
  showAurora = true,
  showLightRays = true,
  particleColor = '#0D9488',
  lightRayOrigin = { x: 50, y: 30 },
}) => {
  const frame = useCurrentFrame();

  // Parallax layers move at different speeds
  const farLayerY = interpolate(frame, [0, 1000], [0, -30], { extrapolateRight: 'extend' });
  const midLayerY = interpolate(frame, [0, 1000], [0, -60], { extrapolateRight: 'extend' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F2EB' }}>
      {/* Layer 1: Aurora gradient (far, slowest) */}
      {showAurora && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${farLayerY * 0.3}px)`,
          }}
        >
          <AuroraGradient intensity={intensity * 0.8} />
        </div>
      )}

      {/* Layer 2: Far particles (slow) */}
      {showParticles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${farLayerY}px)`,
            opacity: 0.4,
          }}
        >
          <ParticleField
            count={30}
            color={`${particleColor}40`}
            speedMultiplier={0.5}
          />
        </div>
      )}

      {/* Layer 3: Light rays (mid layer) */}
      {showLightRays && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${midLayerY * 0.5}px)`,
          }}
        >
          <LightRays
            originX={lightRayOrigin.x}
            originY={lightRayOrigin.y}
            intensity={intensity}
          />
        </div>
      )}

      {/* Layer 4: Main particles (mid speed) */}
      {showParticles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${midLayerY * 0.3}px)`,
          }}
        >
          <ParticleField
            count={50}
            color={`${particleColor}60`}
            speedMultiplier={0.8}
          />
        </div>
      )}

      {/* Layer 5: Content layer */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>

      {/* Layer 6: Foreground particles (nearest, fastest) */}
      {showParticles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <ParticleField
            count={20}
            color={`${particleColor}30`}
            speedMultiplier={1.2}
          />
        </div>
      )}

      {/* Subtle vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(
            ellipse 80% 70% at 50% 50%,
            transparent 0%,
            transparent 60%,
            rgba(28, 26, 23, ${0.08 * intensity}) 100%
          )`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
