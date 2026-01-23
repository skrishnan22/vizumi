import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DramaticBackground } from '../backgrounds';
import { GlowingText } from '../text/GlowingText';
import { ImpactShake } from '../text/ShakeWrapper';

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1 animation
  const line1Progress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const line1Y = interpolate(line1Progress, [0, 1], [60, 0]);
  const line1Opacity = interpolate(line1Progress, [0, 1], [0, 1]);
  const line1Scale = interpolate(line1Progress, [0, 0.5, 1], [0.8, 1.05, 1]);

  // Line 2 animation (staggered)
  const line2Progress = spring({
    frame: frame - 22,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const line2Y = interpolate(line2Progress, [0, 1], [50, 0]);
  const line2Opacity = interpolate(line2Progress, [0, 1], [0, 1]);

  // "isn't" emphasis animation
  const emphasisProgress = spring({
    frame: frame - 38,
    fps,
    config: { damping: 6, stiffness: 120 },
  });

  const emphasisScale = interpolate(
    emphasisProgress,
    [0, 0.4, 0.7, 1],
    [1, 1.25, 1.1, 1.15]
  );

  // Trigger shake when "isn't" hits
  const shakeFrame = 40;

  return (
    <DramaticBackground
      intensity={0.9}
      showLightRays={false}
    >
      {/* Shake the whole scene for impact */}
      <ImpactShake triggerFrame={shakeFrame} scale={1.03}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Line 1: "Reading is linear." */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: '#1c1a17',
                letterSpacing: '-0.02em',
                transform: `translateY(${line1Y}px) scale(${line1Scale})`,
                opacity: line1Opacity,
              }}
            >
              Reading is linear.
            </div>

            {/* Line 2: "Understanding isn't." */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 500,
                fontFamily: 'Outfit, sans-serif',
                color: '#64748b',
                letterSpacing: '-0.02em',
                transform: `translateY(${line2Y}px)`,
                opacity: line2Opacity,
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
              }}
            >
              <span>Understanding</span>
              <GlowingText color="#0D9488" pulseSpeed={0.08} minGlow={10} maxGlow={35}>
                <span
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: 72,
                    fontWeight: 400,
                    color: '#0D9488',
                    transform: `scale(${emphasisScale})`,
                    display: 'inline-block',
                  }}
                >
                  isn't
                </span>
              </GlowingText>
              <span>.</span>
            </div>
          </div>
        </AbsoluteFill>
      </ImpactShake>
    </DramaticBackground>
  );
};
