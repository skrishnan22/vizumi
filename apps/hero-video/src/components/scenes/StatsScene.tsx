import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DramaticBackground } from '../backgrounds';
import { GlowingText } from '../text/GlowingText';
import { ImpactShake } from '../text/ShakeWrapper';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: StatItem[] = [
  { value: 10, suffix: 'x', label: 'Faster comprehension', color: '#0D9488' },
  { value: 50, suffix: '%', label: 'Better retention', color: '#10B981' },
  { value: 1000, suffix: '+', label: 'Active users', color: '#14B8A6' },
];

interface AnimatedCounterProps {
  value: number;
  suffix: string;
  delay: number;
  color: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animation
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 40, stiffness: 80 },
    durationInFrames: 50,
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  // Scale bump when reaching final value
  const scaleProgress = spring({
    frame: frame - delay - 45,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  const scale = interpolate(
    scaleProgress,
    [0, 0.5, 1],
    [1, 1.15, 1]
  );

  // Glow intensity increases as number gets higher
  const glowMultiplier = interpolate(progress, [0, 1], [0.5, 1]);

  return (
    <div style={{ transform: `scale(${scale})` }}>
      <GlowingText
        color={color}
        pulseSpeed={0.08}
        minGlow={10 * glowMultiplier}
        maxGlow={35 * glowMultiplier}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {displayValue.toLocaleString()}
          {suffix}
        </span>
      </GlowingText>
    </div>
  );
};

export const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <DramaticBackground intensity={1} showLightRays={true}>
      {/* Shake when first stat lands */}
      <ImpactShake triggerFrame={55} scale={1.02}>
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 80px',
          }}
        >
          {stats.map((stat, i) => {
            const itemDelay = 10 + i * 20;

            // Container animation
            const containerProgress = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 15, stiffness: 80 },
            });

            const containerY = interpolate(containerProgress, [0, 1], [60, 0]);
            const containerOpacity = interpolate(containerProgress, [0, 1], [0, 1]);

            // Label animation (staggered after number)
            const labelProgress = spring({
              frame: frame - itemDelay - 30,
              fps,
              config: { damping: 20, stiffness: 100 },
            });

            const labelY = interpolate(labelProgress, [0, 1], [20, 0]);
            const labelOpacity = interpolate(labelProgress, [0, 1], [0, 1]);

            return (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  transform: `translateY(${containerY}px)`,
                  opacity: containerOpacity,
                }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  delay={itemDelay}
                  color={stat.color}
                />

                <div
                  style={{
                    marginTop: 16,
                    fontSize: 24,
                    fontWeight: 500,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#64748b',
                    transform: `translateY(${labelY}px)`,
                    opacity: labelOpacity,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </ImpactShake>
    </DramaticBackground>
  );
};
