import { Composition } from "remotion";
import { BranchFlow } from "./BranchFlow";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BranchFlow"
    component={BranchFlow}
    durationInFrames={1500}  // Will update after voiceover
    fps={30}
    width={1920}
    height={1080}
  />
);
