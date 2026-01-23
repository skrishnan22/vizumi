import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DramaticBackground } from '../backgrounds';
import { LightRays } from '../backgrounds/LightRays';
import { ImpactTitle } from '../text/ImpactTitle';
import { GlowingGradientText } from '../text/GlowingText';
import { ImpactShake } from '../text/ShakeWrapper';

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation - dramatic bounce in
  const logoProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 8, stiffness: 100, mass: 1.2 },
  });

  const logoScale = interpolate(
    logoProgress,
    [0, 0.4, 0.7, 1],
    [0, 1.25, 0.95, 1]
  );
  const logoY = interpolate(logoProgress, [0, 1], [120, 0]);
  const logoOpacity = interpolate(logoProgress, [0, 0.2], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline animation
  const taglineProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);

  // CTA button animation
  const ctaProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const ctaScale = interpolate(ctaProgress, [0, 0.5, 1], [0.7, 1.1, 1]);
  const ctaOpacity = interpolate(ctaProgress, [0, 1], [0, 1]);

  // Pulsing glow on CTA
  const ctaGlow = 15 + Math.sin((frame - 70) * 0.1) * 10;

  // Pulsing glow on logo
  const logoGlow = 20 + Math.sin((frame - 30) * 0.06) * 15;

  return (
    <DramaticBackground
      intensity={1.3}
      lightRayOrigin={{ x: 50, y: 40 }}
    >
      {/* Extra light rays for drama */}
      <LightRays
        originX={50}
        originY={35}
        rayCount={16}
        intensity={1.5}
      />

      {/* Shake on logo land */}
      <ImpactShake triggerFrame={25} scale={1.04}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {/* Logo with glow */}
            <div
              style={{
                transform: `translateY(${logoY}px) scale(${logoScale})`,
                opacity: logoOpacity,
                filter: `drop-shadow(0 0 ${logoGlow}px rgba(13, 148, 136, 0.5))`,
              }}
            >
              <GlowingGradientText
                pulseSpeed={0.06}
                minGlow={15}
                maxGlow={40}
              >
                <span
                  style={{
                    fontSize: 110,
                    fontWeight: 800,
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '-0.03em',
                  }}
                >
                  VizDeck
                </span>
              </GlowingGradientText>
            </div>

            {/* Tagline */}
            <div
              style={{
                marginTop: 24,
                transform: `translateY(${taglineY}px)`,
                opacity: taglineOpacity,
              }}
            >
              <ImpactTitle
                text="Transform how you learn"
                delay={45}
                staggerFrames={2}
                fontSize={38}
                fontWeight={500}
                gradient={false}
                color="#64748b"
              />
            </div>

            {/* CTA Button */}
            <div
              style={{
                marginTop: 50,
                transform: `scale(${ctaScale})`,
                opacity: ctaOpacity,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '22px 65px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #10B981 100%)',
                  borderRadius: 60,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  color: 'white',
                  boxShadow: `
                    0 0 ${ctaGlow}px rgba(13, 148, 136, 0.5),
                    0 0 ${ctaGlow * 2}px rgba(13, 148, 136, 0.3),
                    0 8px 25px rgba(13, 148, 136, 0.3)
                  `,
                  letterSpacing: '0.01em',
                }}
              >
                Try Free Today
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </ImpactShake>
    </DramaticBackground>
  );
};
