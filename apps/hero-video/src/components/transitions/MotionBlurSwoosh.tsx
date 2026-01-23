import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

type SwooshDirection = 'left' | 'right' | 'up' | 'down';

interface MotionBlurSwooshProps extends Record<string, unknown> {
  direction?: SwooshDirection;
  maxBlur?: number;
}

const MotionBlurSwooshPresentation: React.FC<
  TransitionPresentationComponentProps<MotionBlurSwooshProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { direction = 'right', maxBlur = 35 } = passedProps;
  const progress = presentationProgress;
  const isEntering = presentationDirection === 'entering';

  // Direction multipliers
  const isHorizontal = direction === 'left' || direction === 'right';
  const dirMultiplier = direction === 'right' || direction === 'down' ? 1 : -1;

  if (isEntering) {
    // Incoming: slide in with blur
    const translate = interpolate(
      progress,
      [0, 1],
      [100 * dirMultiplier, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const blur = interpolate(
      progress,
      [0, 0.4, 1],
      [maxBlur, maxBlur * 0.8, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = interpolate(
      progress,
      [0, 0.4],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const transform = isHorizontal
      ? `translateX(${translate}%)`
      : `translateY(${translate}%)`;

    return (
      <AbsoluteFill
        style={{
          transform,
          filter: `blur(${blur}px)`,
          opacity,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  } else {
    // Outgoing: slide out with blur
    const translate = interpolate(
      progress,
      [0, 1],
      [0, -100 * dirMultiplier],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const blur = interpolate(
      progress,
      [0, 0.6, 1],
      [0, maxBlur * 0.8, maxBlur],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = interpolate(
      progress,
      [0.6, 1],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const transform = isHorizontal
      ? `translateX(${translate}%)`
      : `translateY(${translate}%)`;

    return (
      <AbsoluteFill
        style={{
          transform,
          filter: `blur(${blur}px)`,
          opacity,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
};

export const motionBlurSwoosh = (
  props: MotionBlurSwooshProps = {}
): TransitionPresentation<MotionBlurSwooshProps> => {
  return {
    component: MotionBlurSwooshPresentation,
    props,
  };
};
