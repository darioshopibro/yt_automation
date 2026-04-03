import { Composition } from "remotion";

import { ExplainerTestScene } from "./ExplainerTest";
import config from "./dynamic-config.json";

// Old hardcoded version:
// import { RAGPipeline } from "./RAGPipeline";

export const RemotionRoot: React.FC = () => (
  <>
   
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
