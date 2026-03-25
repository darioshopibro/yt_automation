import { Composition } from "remotion";
import { DynamicPipeline } from "./DynamicPipeline";
import { ExplainerTestScene } from "./ExplainerTest";
import config from "./dynamic-config.json";

// Old hardcoded version:
// import { RAGPipeline } from "./RAGPipeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DynamicPipeline"
      component={DynamicPipeline}
      durationInFrames={config.totalFrames}
      fps={config.fps}
      width={1920}
      height={1080}
    />
    {/* Test kompozicija za Explainer layouts */}
    <Composition
      id="ExplainerTest"
      component={ExplainerTestScene}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
