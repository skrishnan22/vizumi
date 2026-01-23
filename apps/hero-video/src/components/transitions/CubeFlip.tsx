import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

type CubeFlipDirection = 'horizontal' | 'vertical';

interface CubeFlipProps extends Record<string, unknown> {
  direction?: CubeFlipDirection;
  perspective?: number;
}

const CubeFlipPresentation: React.FC<
  TransitionPresentationComponentProps<CubeFlipProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { direction = 'horizontal', perspective = 1500 } = passedProps;
  const progress = presentationProgress;
  const isEntering = presentationDirection === 'entering';
  const isHorizontal = direction === 'horizontal';

  if (isEntering) {
    // Incoming: rotate from the side
    const rotation = interpolate(
      progress,
      [0, 1],
      [isHorizontal ? 90 : -90, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const translateZ = interpolate(
      progress,
      [0, 0.5, 1],
      [-400, -400, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = interpolate(
      progress,
      [0, 0.3],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ perspective }}>
        <AbsoluteFill
          style={{
            transform: `translateZ(${translateZ}px) ${
              isHorizontal ? 'rotateY' : 'rotateX'
            }(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            opacity,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    // Outgoing: rotate away
    const rotation = interpolate(
      progress,
      [0, 1],
      [0, isHorizontal ? -90 : 90],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const translateZ = interpolate(
      progress,
      [0, 0.5, 1],
      [0, -400, -400],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = interpolate(
      progress,
      [0.7, 1],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <AbsoluteFill style={{ perspective }}>
        <AbsoluteFill
          style={{
            transform: `translateZ(${translateZ}px) ${
              isHorizontal ? 'rotateY' : 'rotateX'
            }(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            opacity,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
};

export const cubeFlip = (props: CubeFlipProps = {}): TransitionPresentation<CubeFlipProps> => {
  return {
    component: CubeFlipPresentation,
    props,
  };
};
