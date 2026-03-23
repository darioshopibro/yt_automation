import { Composition } from "remotion";
import { RAGPipeline } from "./RAGPipeline";
// Flat verzija backup: import { RAGPipelineFlat as RAGPipeline } from "./RAGPipeline-flat";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RAGPipeline"
      component={RAGPipeline}
      durationInFrames={1310}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
