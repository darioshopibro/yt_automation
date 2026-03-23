import { Composition } from "remotion";
import { NemoClawStack } from "./NemoClawStack";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NemoClawStack"
    component={NemoClawStack}
    durationInFrames={1300}  // ~43 sec @ 30fps (voiceover: 1246 + padding)
    fps={30}
    width={1920}
    height={1080}
  />
);
