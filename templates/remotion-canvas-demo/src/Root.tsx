import { Composition } from "remotion";
import { InfiniteCanvas } from "./InfiniteCanvas";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InfiniteCanvas"
        component={InfiniteCanvas}
        durationInFrames={1650} // ~55 seconds (synced with Rachel voiceover)
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
