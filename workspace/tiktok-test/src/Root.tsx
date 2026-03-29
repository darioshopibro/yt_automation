import { Composition } from "remotion";
import { TikTokVideo } from "./TikTokVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TikTokVideo"
      component={TikTokVideo}
      durationInFrames={450} // 15 seconds at 30fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
