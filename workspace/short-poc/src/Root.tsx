import { Composition } from "remotion";
import { ShortVideo } from "./ShortVideo";
import { KlingFrames } from "./KlingFrames";
import { GregTest } from "./GregTest";
import { GregV2 } from "./GregV2";

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
    </>
  );
};
