import { Composition } from "remotion";
import { ShortVideo } from "./ShortVideo";
import { KlingFrames } from "./KlingFrames";
import { GregTest } from "./GregTest";
import { GregV2 } from "./GregV2";
import { CurvedTextTest } from "./CurvedTextTest";
import { StreakTest } from "./StreakTest";
import { ParticleSwarmTest } from "./ParticleSwarmTest";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortPOC"
        component={ShortVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="KlingFrames"
        component={KlingFrames}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="GregTest"
        component={GregTest}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="GregV2"
        component={GregV2}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ParticleSwarmTest"
        component={ParticleSwarmTest}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CurvedTextTest"
        component={CurvedTextTest}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="StreakTest"
        component={StreakTest}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
