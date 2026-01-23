import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

type CalloutDirection = 'left' | 'right' | 'top' | 'bottom';

interface AnimatedCalloutProps {
  x: number; // Percentage position
  y: number;
  label: string;
  delay?: number;
  direction?: CalloutDirection;
  lineLength?: number;
  color?: string;
}

export const AnimatedCallout: React.FC<AnimatedCalloutProps> = ({
  x,
  y,
  label,
  delay = 0,
  direction = 'right',
  lineLength = 70,
  color = '#F97316',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Overall animation progress
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Dot scale with pulse
  const dotScale = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const dotPulse = 1 + Math.sin((frame - delay) * 0.12) * 0.15;
  const finalDotScale = dotScale * (progress > 0.3 ? dotPulse : 1);

  // Line extends after dot appears
  const lineProgress = interpolate(progress, [0.2, 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentLineLength = lineLength * lineProgress;

  // Label fades in after line
  const labelOpacity = interpolate(progress, [0.5, 0.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const labelSlide = interpolate(progress, [0.5, 0.9], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate offsets based on direction
  const isHorizontal = direction === 'left' || direction === 'right';
  const isPositive = direction === 'right' || direction === 'bottom';

  const lineStyle: React.CSSProperties = isHorizontal
    ? {
        width: currentLineLength,
        height: 2,
        left: isPositive ? 8 : 'auto',
        right: isPositive ? 'auto' : 8,
        top: 5,
      }
    : {
        width: 2,
        height: currentLineLength,
        left: 5,
        top: isPositive ? 8 : 'auto',
        bottom: isPositive ? 'auto' : 8,
      };

  const labelOffset = currentLineLength + 15;
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    ...(direction === 'right' && { left: labelOffset, top: -8 }),
    ...(direction === 'left' && { right: labelOffset, top: -8 }),
    ...(direction === 'bottom' && { left: -40, top: labelOffset }),
    ...(direction === 'top' && { left: -40, bottom: labelOffset }),
    transform: isHorizontal
      ? `translateX(${isPositive ? labelSlide : -labelSlide}px)`
      : `translateY(${isPositive ? labelSlide : -labelSlide}px)`,
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      }}
    >
      {/* Pulsing dot at anchor point */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: color,
          transform: `scale(${finalDotScale})`,
          boxShadow: `0 0 15px ${color}99, 0 0 25px ${color}66`,
        }}
      />

      {/* Connecting line */}
      <div
        style={{
          position: 'absolute',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}80`,
          ...lineStyle,
        }}
      />

      {/* Label bubble */}
      <div
        style={{
          ...labelStyle,
          backgroundColor: color,
          color: 'white',
          padding: '10px 18px',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          opacity: labelOpacity,
          whiteSpace: 'nowrap',
          boxShadow: `0 4px 12px ${color}40`,
        }}
      >
        {label}
      </div>
    </div>
  );
};
