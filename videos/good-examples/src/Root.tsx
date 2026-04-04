import { Composition } from "remotion";
import Generated_RaceConditions from "./visuals/Generated_RaceConditions";
import Generated_NetflixPlayClick from "./visuals/Generated_NetflixPlayClick";
import Generated_TokenBucketRateLimiting from "./visuals/Generated_TokenBucketRateLimiting";
import Generated_GoogleSearchRanking from "./visuals/Generated_GoogleSearchRanking";
import Generated_GoogleAutocomplete from "./visuals/Generated_GoogleAutocomplete";
import Generated_StripePaymentFlow from "./visuals/Generated_StripePaymentFlow";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RaceConditions" component={Generated_RaceConditions} durationInFrames={1600} fps={30} width={1920} height={1080} />
    <Composition id="NetflixPlayClick" component={Generated_NetflixPlayClick} durationInFrames={420} fps={30} width={1920} height={1080} />
    <Composition id="TokenBucketRateLimiting" component={Generated_TokenBucketRateLimiting} durationInFrames={1280} fps={30} width={1920} height={1080} />
    <Composition id="GoogleSearchRanking" component={Generated_GoogleSearchRanking} durationInFrames={540} fps={30} width={1920} height={1080} />
    <Composition id="GoogleAutocomplete" component={Generated_GoogleAutocomplete} durationInFrames={510} fps={30} width={1920} height={1080} />
    <Composition id="StripePaymentFlow" component={Generated_StripePaymentFlow} durationInFrames={700} fps={30} width={1920} height={1080} />
  </>
);
