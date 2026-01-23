import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

type ZoomThroughProps = Record<string, unknown>;

// Portal/tunnel zoom-through effect
const ZoomThroughPresentation: React.FC<TransitionPresentationComponentProps<ZoomThroughProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
}) => {
  const progress = presentationProgress;
  const isEntering = presentationDirection === 'entering';

  if (isEntering) {
    // Incoming scene: starts very small and zooms to normal
    const scale = interpolate(progress, [0, 1], [0.2, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(progress, [0.2, 0.6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const blur = interpolate(progress, [0, 0.5, 1], [20, 8, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  } else {
    // Outgoing scene: zooms out dramatically and fades
    const scale = interpolate(progress, [0, 1], [1, 3.5], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(progress, [0, 0.5], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const blur = interpolate(progress, [0.3, 0.7], [0, 15], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
};

export const zoomThrough = (): TransitionPresentation<ZoomThroughProps> => {
  return {
    component: ZoomThroughPresentation,
    props: {},
  };
};
