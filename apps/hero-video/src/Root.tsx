import { Composition } from "remotion";
import { HeroDemo } from "./HeroDemo";

// Duration calculation at 30fps:
// Scenes: 5 + 4 + 3 + 6 + 3 + 7 + 3 + 7 + 5 = 43 seconds = 1290 frames
// Transitions: 8 total (~4s overlap) = ~120 frames
// Net: 1290 - 120 = ~1170 frames ≈ 39 seconds
// Using 1350 frames for ~45 second video with buffer

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroDemo"
        component={HeroDemo}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
