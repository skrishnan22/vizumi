import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Video, OffthreadVideo } from 'remotion';
import { DramaticBackground } from '../backgrounds';
import { FeatureCard3D } from '../shared/FeatureCard3D';
import { BrowserMockup } from '../shared/BrowserMockup';
import { AnimatedCallout } from '../shared/AnimatedCallout';

interface FeatureVideoSceneProps {
  icon: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  url: string;
  callouts?: Array<{
    x: number;
    y: number;
    label: string;
    delay: number;
    direction?: 'left' | 'right' | 'top' | 'bottom';
  }>;
  featureDuration?: number;
}

export const FeatureVideoScene: React.FC<FeatureVideoSceneProps> = ({
  icon,
  title,
  subtitle,
  videoSrc,
  url,
  callouts = [],
  featureDuration = 75,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Feature card is shown first, then video
  const showingFeature = frame < featureDuration;
  const showingVideo = frame >= featureDuration - 15; // Start fading in video slightly early

  // Feature card animation
  const cardProgress = spring({
    frame: frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
  const cardOpacity = showingFeature
    ? interpolate(cardProgress, [0, 1], [0, 1])
    : interpolate(frame - featureDuration, [0, 15], [1, 0], { extrapolateRight: 'clamp' });

  // Video animation
  const videoProgress = spring({
    frame: frame - featureDuration + 15,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const videoOpacity = interpolate(videoProgress, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const videoScale = interpolate(videoProgress, [0, 1], [0.95, 1], { extrapolateLeft: 'clamp' });

  // Ken Burns zoom
  const videoZoom = interpolate(
    frame - featureDuration,
    [0, durationInFrames - featureDuration],
    [1, 1.02],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <DramaticBackground intensity={0.9} showLightRays={showingFeature}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Feature Card */}
        {showingFeature && (
          <div
            style={{
              position: 'absolute',
              transform: `scale(${cardScale})`,
              opacity: cardOpacity,
              zIndex: 10,
            }}
          >
            <FeatureCard3D
              icon={icon}
              title={title}
              subtitle={subtitle}
              delay={5}
              floating={true}
            />
          </div>
        )}

        {/* Video */}
        {showingVideo && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: videoOpacity,
              transform: `scale(${videoScale})`,
              padding: 40,
              zIndex: showingFeature ? 5 : 10,
            }}
          >
            <BrowserMockup url={url} delay={0} animate={frame >= featureDuration - 10}>
              <div
                style={{
                  transform: `scale(${videoZoom})`,
                  transformOrigin: 'center center',
                  position: 'relative',
                }}
              >
                <OffthreadVideo
                  src={videoSrc}
                  muted
                  startFrom={Math.max(0, frame - featureDuration)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />

                {/* Callouts overlay */}
                {callouts.map((callout, i) => (
                  <AnimatedCallout
                    key={i}
                    x={callout.x}
                    y={callout.y}
                    label={callout.label}
                    delay={featureDuration + callout.delay}
                    direction={callout.direction}
                  />
                ))}
              </div>
            </BrowserMockup>
          </div>
        )}
      </AbsoluteFill>
    </DramaticBackground>
  );
};
