import { Composition } from "remotion";
import { DynamicPipeline } from "./DynamicPipeline";
import { ExplainerTestScene } from "./ExplainerTest";
import { TestInteractiveDiagramFullScreen, TestInteractiveDiagramNode, TestK8sScheduler } from "./test-interactive-diagram";
import Generated_SQLvsNoSQL from "./visuals/Generated_SQLvsNoSQL";
import Generated_MicroservicesArch from "./visuals/Generated_MicroservicesArch";
import Generated_RaceConditions from "./visuals/Generated_RaceConditions";
import Generated_StripePaymentFlow from "./visuals/Generated_StripePaymentFlow";
import Generated_NetflixPlayClick from "./visuals/Generated_NetflixPlayClick";
import Generated_GoogleSearchRanking from "./visuals/Generated_GoogleSearchRanking";
import Generated_GoogleAutocomplete from "./visuals/Generated_GoogleAutocomplete";
import Generated_GoogleDocsKeystroke from "./visuals/Generated_GoogleDocsKeystroke";
import Generated_WhatsAppMessageFlow from "./visuals/Generated_WhatsAppMessageFlow";
import Generated_GarbageCollection from "./visuals/Generated_GarbageCollection";
import Generated_CDNLatency from "./visuals/Generated_CDNLatency";
import Generated_YouTubeAdaptiveStreaming from "./visuals/Generated_YouTubeAdaptiveStreaming";
import Generated_TLSHandshake from "./visuals/Generated_TLSHandshake";
import Generated_TokenBucketRateLimiting from "./visuals/Generated_TokenBucketRateLimiting";
import Generated_DockerContainerLifecycle from "./visuals/Generated_DockerContainerLifecycle";
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
    {/* Interactive Diagram test — Full Screen */}
    <Composition
      id="TestInteractiveDiagramFS"
      component={TestInteractiveDiagramFullScreen}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Interactive Diagram test — Node mode (in sticky) */}
    <Composition
      id="TestInteractiveDiagramNode"
      component={TestInteractiveDiagramNode}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* K8s Scheduler — complex test (7 elements, 4 cols, filtering/scoring) */}
    <Composition
      id="TestK8sScheduler"
      component={TestK8sScheduler}
      durationInFrames={250}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* SQL vs NoSQL Comparison */}
    <Composition
      id="SQLvsNoSQL"
      component={Generated_SQLvsNoSQL}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Microservices Architecture */}
    <Composition
      id="MicroservicesArch"
      component={Generated_MicroservicesArch}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Race Conditions — concurrent programming visual */}
    <Composition
      id="RaceConditions"
      component={Generated_RaceConditions}
      durationInFrames={1600}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Stripe Payment Flow — pipeline trace visual */}
    <Composition
      id="StripePaymentFlow"
      component={Generated_StripePaymentFlow}
      durationInFrames={700}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Netflix Play Click — fan-out/fan-in architecture */}
    <Composition
      id="NetflixPlayClick"
      component={Generated_NetflixPlayClick}
      durationInFrames={420}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Docker Container Lifecycle — layers → image → container → volumes */}

    {/* Google Autocomplete — search bar + predictions + re-ranking */}
    <Composition
      id="GoogleAutocomplete"
      component={Generated_GoogleAutocomplete}
      durationInFrames={510}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Google Search Ranking — funnel → signals → results CTR */}
    <Composition
      id="GoogleSearchRanking"
      component={Generated_GoogleSearchRanking}
      durationInFrames={540}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Google Docs Keystroke — 7 simultaneous ops from one character */}
    <Composition
      id="GoogleDocsKeystroke"
      component={Generated_GoogleDocsKeystroke}
      durationInFrames={540}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* V8 Engine Pipeline — Source → AST → Bytecode → Machine Code → Deopt cycle */}

    {/* Git Push Journey — compression → SSH → hooks → atomic update */}

    {/* WhatsApp Message Flow — encrypt → relay → deliver/queue → receipts → scale */}
    <Composition
      id="WhatsAppMessageFlow"
      component={Generated_WhatsAppMessageFlow}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Garbage Collection — mark & sweep → stop-the-world → concurrent GC */}
    <Composition
      id="GarbageCollection"
      component={Generated_GarbageCollection}
      durationInFrames={660}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* HTTP vs WebSocket — upgrade process, overhead comparison */}

    {/* CDN Latency — distance problem → edge caching → Netflix OCA */}
    <Composition
      id="CDNLatency"
      component={Generated_CDNLatency}
      durationInFrames={1200}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* OAuth2 Google Flow — redirect dance, token exchange, delegated auth */}
  
    {/* Load Balancing — Round Robin → Least Connections → Weighted RR → Health Checks */}
  
    {/* TLS Handshake — 5-step browser↔server key exchange before encryption */}
    <Composition
      id="TLSHandshake"
      component={Generated_TLSHandshake}
      durationInFrames={1200}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* YouTube Adaptive Bitrate Streaming — transcoding → ABR → encoding compression */}
    <Composition
      id="YouTubeAdaptiveStreaming"
      component={Generated_YouTubeAdaptiveStreaming}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Token Bucket Rate Limiting — bucket fill/drain, sliding window, Redis */}
    <Composition
      id="TokenBucketRateLimiting"
      component={Generated_TokenBucketRateLimiting}
      durationInFrames={1280}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Docker Container Lifecycle — Dockerfile layers → image → container → volumes */}
    <Composition
      id="DockerContainerLifecycle"
      component={Generated_DockerContainerLifecycle}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
