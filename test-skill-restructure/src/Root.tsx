import { Composition } from "remotion";
import { DynamicPipeline } from "./DynamicPipeline";
import config from "./dynamic-config.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DynamicPipeline"
    component={DynamicPipeline}
    durationInFrames={config.totalFrames}
    fps={config.fps}
    width={1920}
    height={1080}
  />
);
