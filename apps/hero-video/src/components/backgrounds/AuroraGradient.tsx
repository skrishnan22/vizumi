import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface AuroraGradientProps {
  intensity?: number;
  baseHue?: number;
  speed?: number;
}

export const AuroraGradient: React.FC<AuroraGradientProps> = ({
  intensity = 1,
  baseHue = 170, // Teal
  speed = 1,
}) => {
  const frame = useCurrentFrame();

  // Animate gradient blob positions using sine/cosine waves
  const pos1X = interpolate(Math.sin(frame * 0.015 * speed), [-1, 1], [15, 35]);
  const pos1Y = interpolate(Math.cos(frame * 0.012 * speed), [-1, 1], [10, 30]);

  const pos2X = interpolate(Math.cos(frame * 0.018 * speed), [-1, 1], [55, 75]);
  const pos2Y = interpolate(Math.sin(frame * 0.014 * speed), [-1, 1], [60, 85]);

  const pos3X = interpolate(Math.sin(frame * 0.02 * speed + 2), [-1, 1], [70, 90]);
  const pos3Y = interpolate(Math.cos(frame * 0.016 * speed + 1), [-1, 1], [20, 45]);

  const pos4X = interpolate(Math.cos(frame * 0.013 * speed + 3), [-1, 1], [25, 50]);
  const pos4Y = interpolate(Math.sin(frame * 0.017 * speed + 2), [-1, 1], [70, 95]);

  // Subtle hue shift over time
  const hueShift = interpolate(frame, [0, 600], [0, 40]) % 40;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(
            ellipse 80% 60% at ${pos1X}% ${pos1Y}%,
            hsla(${baseHue + hueShift}, 75%, 50%, ${0.35 * intensity}) 0%,
            transparent 60%
          ),
          radial-gradient(
            ellipse 70% 50% at ${pos2X}% ${pos2Y}%,
            hsla(${baseHue - 20 + hueShift}, 70%, 45%, ${0.3 * intensity}) 0%,
            transparent 55%
          ),
          radial-gradient(
            ellipse 60% 70% at ${pos3X}% ${pos3Y}%,
            hsla(${baseHue + 10 + hueShift}, 80%, 55%, ${0.25 * intensity}) 0%,
            transparent 50%
          ),
          radial-gradient(
            ellipse 50% 40% at ${pos4X}% ${pos4Y}%,
            hsla(${baseHue + 30 + hueShift}, 65%, 48%, ${0.2 * intensity}) 0%,
            transparent 45%
          ),
          linear-gradient(
            180deg,
            #F5F2EB 0%,
            #EDE8DD 50%,
            #E8E3D8 100%
          )
        `,
        pointerEvents: 'none',
      }}
    />
  );
};
