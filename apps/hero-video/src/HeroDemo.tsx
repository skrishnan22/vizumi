import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Audio,
  OffthreadVideo,
} from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { loadFont as loadPatrickHand } from '@remotion/google-fonts/PatrickHand';

// Assets
import urlInputVideo from './assets/url-input.mp4';
import canvasStreamingVideo from './assets/canvas-streaming.mp4';
import blueprintStreamingVideo from './assets/blueprint-streaming.mp4';
import backgroundMusic from './assets/music.mp3';

// Enhanced components
import { DramaticBackground } from './components/backgrounds';
import { ImpactTitle, GlowingText, GlowingGradientText } from './components/text';
import { FeatureCard3D, AnimatedCallout } from './components/shared';

const { fontFamily: outfitFont } = loadOutfit('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

const { fontFamily: patrickHandFont } = loadPatrickHand('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

const COLORS = {
  bg: '#F5F2EB',
  bgPaper: '#FFFFFF',
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  text: '#1c1a17',
  textMuted: '#64748b',
  accentGreen: '#10B981',
  border: '#E5E0D5',
};

// Background Music
const BackgroundMusic: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeInEnd = 1.5 * fps;
  const fadeOutStart = durationInFrames - 2 * fps;

  const volume = (f: number) => {
    if (f < fadeInEnd)
      return interpolate(f, [0, fadeInEnd], [0, 0.4], { extrapolateRight: 'clamp' });
    if (f > fadeOutStart)
      return interpolate(f, [fadeOutStart, durationInFrames], [0.4, 0], {
        extrapolateLeft: 'clamp',
      });
    return 0.4;
  };

  return <Audio src={src} volume={volume} />;
};

// Typewriter tagline (keeping this - it works well)
const TypewriterTagline: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsToShow = Math.min(text.length, Math.max(0, Math.floor((frame - delay) / 1.2)));
  const displayText = frame > delay ? text.slice(0, charsToShow) : '';
  const cursorOpacity = interpolate((frame - delay) % 16, [0, 8, 16], [1, 0, 1]);

  const containerOpacity = spring({ frame: frame - delay, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        fontSize: 32,
        fontWeight: 500,
        fontFamily: outfitFont,
        color: '#4a5e2e',
        opacity: containerOpacity,
        marginTop: 24,
      }}
    >
      {displayText}
      <span style={{ opacity: cursorOpacity, color: COLORS.primary }}>|</span>
    </div>
  );
};

// Enhanced Browser mockup with entry animation
const EnhancedBrowserMockup: React.FC<{
  children: React.ReactNode;
  url?: string;
  delay?: number;
}> = ({ children, url = 'Vizumi.app', delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(entryProgress, [0, 1], [0.92, 1]);
  const y = interpolate(entryProgress, [0, 1], [60, 0]);
  const opacity = interpolate(entryProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // Subtle shadow pulse
  const shadowPulse = Math.sin(frame * 0.04) * 3 + 22;

  // Slow zoom during playback
  const zoomProgress = interpolate(frame - delay - 20, [0, 150], [1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '90%',
        maxWidth: 1400,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 ${shadowPulse}px 30px -5px rgba(0, 0, 0, 0.1)`,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bgPaper,
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#eab308' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: COLORS.bgPaper,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 14,
              fontFamily: outfitFont,
              color: COLORS.textMuted,
            }}
          >
            {url}
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>
      {/* Video content with zoom */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${zoomProgress})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Animated headline with emphasis
const AnimatedHeadline: React.FC<{
  line1: string;
  line2: string;
  emphasisWord?: string;
  delay?: number;
}> = ({ line1, line2, emphasisWord = "isn't", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 60 },
  });
  const line2Progress = spring({
    frame: frame - delay - 10,
    fps,
    config: { damping: 12, stiffness: 60 },
  });
  const emphasisPulse = spring({
    frame: frame - delay - 25,
    fps,
    config: { damping: 8, stiffness: 100 },
  });

  const line1Y = interpolate(line1Progress, [0, 1], [50, 0]);
  const line1Opacity = interpolate(line1Progress, [0, 1], [0, 1]);
  const line2Y = interpolate(line2Progress, [0, 1], [50, 0]);
  const line2Opacity = interpolate(line2Progress, [0, 1], [0, 1]);
  const emphasisScale = interpolate(emphasisPulse, [0, 0.5, 1], [1, 1.15, 1]);

  const parts = line2.split(emphasisWord);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          fontSize: 68,
          fontWeight: 700,
          fontFamily: outfitFont,
          color: COLORS.text,
          transform: `translateY(${line1Y}px)`,
          opacity: line1Opacity,
          letterSpacing: '-0.02em',
        }}
      >
        {line1}
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 500,
          fontFamily: outfitFont,
          color: COLORS.textMuted,
          transform: `translateY(${line2Y}px)`,
          opacity: line2Opacity,
          letterSpacing: '-0.02em',
        }}
      >
        {parts[0]}
        <GlowingText
          color={COLORS.primary}
          minGlow={10}
          maxGlow={30}
          style={{
            fontFamily: patrickHandFont,
            fontWeight: 400,
            color: COLORS.primary,
            transform: `scale(${emphasisScale})`,
            display: 'inline-block',
            fontSize: 64,
          }}
        >
          {emphasisWord}
        </GlowingText>
        {parts[1]}
      </div>
    </div>
  );
};

// Animated CTA button
const AnimatedCTAButton: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const scale = interpolate(entryProgress, [0, 0.5, 1], [0.8, 1.05, 1]);
  const opacity = interpolate(entryProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(entryProgress, [0, 1], [20, 0]);

  // Pulse glow
  const glowIntensity = 15 + Math.sin((frame - delay) * 0.08) * 8;

  return (
    <div
      style={{
        marginTop: 40,
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          padding: '16px 40px',
          borderRadius: 12,
          background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary}, ${COLORS.accentGreen})`,
          color: 'white',
          fontSize: 22,
          fontWeight: 600,
          fontFamily: outfitFont,
          boxShadow: `0 0 ${glowIntensity}px rgba(13, 148, 136, 0.5)`,
        }}
      >
        Get Started Free →
      </div>
    </div>
  );
};

// ============ SCENES ============

const IntroScene: React.FC = () => (
  <DramaticBackground showParticles showAurora showLightRays={false}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <GlowingGradientText
          minGlow={20}
          maxGlow={50}
          pulseSpeed={0.05}
          style={{ display: 'inline-block' }}
        >
          <ImpactTitle text="Vizumi" delay={15} fontSize={120} staggerFrames={3} />
        </GlowingGradientText>
        <TypewriterTagline text="From URL to mental model" delay={60} />
      </div>
    </AbsoluteFill>
  </DramaticBackground>
);

const ProblemScene: React.FC = () => (
  <DramaticBackground showParticles showAurora showLightRays={false}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AnimatedHeadline
        line1="Reading is linear."
        line2="Understanding isn't."
        emphasisWord="isn't"
        delay={5}
      />
    </AbsoluteFill>
  </DramaticBackground>
);

const FeatureScene: React.FC<{ icon: string; title: string; subtitle: string }> = (props) => (
  <DramaticBackground showParticles showAurora showLightRays={false}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <FeatureCard3D {...props} delay={5} floating />
    </AbsoluteFill>
  </DramaticBackground>
);

// Video scene with callouts
const VideoSceneWithCallouts: React.FC<{
  src: string;
  url?: string;
  callouts: Array<{
    x: number;
    y: number;
    label: string;
    direction: 'left' | 'right' | 'top' | 'bottom';
    delay: number;
  }>;
}> = ({ src, url, callouts }) => (
  <DramaticBackground showParticles showAurora showLightRays={false} intensity={0.5}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ position: 'relative' }}>
        <EnhancedBrowserMockup url={url} delay={5}>
          <OffthreadVideo
            src={src}
            muted
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </EnhancedBrowserMockup>
        {/* Callout overlays */}
        {callouts.map((callout, i) => (
          <AnimatedCallout
            key={i}
            x={callout.x}
            y={callout.y}
            label={callout.label}
            direction={callout.direction}
            delay={callout.delay}
          />
        ))}
      </div>
    </AbsoluteFill>
  </DramaticBackground>
);

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 100 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.7, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  const taglineProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [20, 0]);
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);

  return (
    <DramaticBackground showParticles showAurora showLightRays={false} intensity={1.2}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
            <GlowingGradientText
              minGlow={25}
              maxGlow={60}
              pulseSpeed={0.06}
              style={{ display: 'inline-block' }}
            >
              <ImpactTitle text="Vizumi" delay={0} fontSize={100} staggerFrames={2} />
            </GlowingGradientText>
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              fontFamily: outfitFont,
              color: COLORS.textMuted,
              marginTop: 20,
              transform: `translateY(${taglineY}px)`,
              opacity: taglineOpacity,
            }}
          >
            Transform how you learn
          </div>
          <AnimatedCTAButton delay={60} />
        </div>
      </AbsoluteFill>
    </DramaticBackground>
  );
};

// ============ MAIN COMPOSITION ============

export const HeroDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  // New timeline (~45 seconds)
  const SCENE = {
    intro: Math.round(5 * fps), // 5s - 150 frames
    problem: Math.round(4 * fps), // 4s - 120 frames
    feature1: Math.round(3 * fps), // 3s - 90 frames
    video1: Math.round(6 * fps), // 6s - 180 frames
    feature2: Math.round(3 * fps), // 3s - 90 frames
    video2: Math.round(7 * fps), // 7s - 210 frames
    feature3: Math.round(3 * fps), // 3s - 90 frames
    video3: Math.round(7 * fps), // 7s - 210 frames
    outro: Math.round(5 * fps), // 5s - 150 frames
  };

  const TRANS = Math.round(0.5 * fps);

  return (
    <>
      <BackgroundMusic src={backgroundMusic} />

      <TransitionSeries>
        {/* Intro */}
        <TransitionSeries.Sequence durationInFrames={SCENE.intro}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Problem */}
        <TransitionSeries.Sequence durationInFrames={SCENE.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })}
        />

        {/* Feature 1: Paste URL */}
        <TransitionSeries.Sequence durationInFrames={SCENE.feature1}>
          <FeatureScene icon="🔗" title="Paste any URL" subtitle="Articles, blogs, documentation" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-bottom' })}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Video 1: URL Input */}
        <TransitionSeries.Sequence durationInFrames={SCENE.video1}>
          <VideoSceneWithCallouts
            src={urlInputVideo}
            url="Vizumi.app"
            callouts={[
              { x: 50, y: 8, label: 'Paste any URL', direction: 'bottom', delay: 30 },
              { x: 85, y: 50, label: 'AI processing', direction: 'left', delay: 100 },
            ]}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Feature 2: Visual Notes */}
        <TransitionSeries.Sequence durationInFrames={SCENE.feature2}>
          <FeatureScene
            icon="🎨"
            title="AI creates visual notes"
            subtitle="Diagrams, mind maps, structured cards"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })}
        />

        {/* Video 2: Canvas */}
        <TransitionSeries.Sequence durationInFrames={SCENE.video2}>
          <VideoSceneWithCallouts
            src={canvasStreamingVideo}
            url="Vizumi.app/canvas"
            callouts={[
              { x: 50, y: 8, label: 'Visual notes appear', direction: 'bottom', delay: 40 },
              { x: 15, y: 50, label: 'Connections form', direction: 'right', delay: 120 },
            ]}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Feature 3: Connections */}
        <TransitionSeries.Sequence durationInFrames={SCENE.feature3}>
          <FeatureScene
            icon="🧠"
            title="See how ideas connect"
            subtitle="Interactive canvas for deep understanding"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Video 3: Blueprint */}
        <TransitionSeries.Sequence durationInFrames={SCENE.video3}>
          <VideoSceneWithCallouts
            src={blueprintStreamingVideo}
            url="Vizumi.app/blueprints"
            callouts={[
              { x: 50, y: 8, label: 'Interactive canvas', direction: 'bottom', delay: 40 },
              { x: 85, y: 60, label: 'Deep understanding', direction: 'left', delay: 130 },
            ]}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANS })}
        />

        {/* Outro */}
        <TransitionSeries.Sequence durationInFrames={SCENE.outro}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
