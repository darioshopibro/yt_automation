import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Code } from "./scenes/Scene2Code";
import { Scene3Stats } from "./scenes/Scene3Stats";
import { Scene4Impact } from "./scenes/Scene4Impact";
import { Scene5Skills } from "./scenes/Scene5Skills";
import { Scene6CTA } from "./scenes/Scene6CTA";
import { WordByWordCaption } from "./components/WordByWordCaption";

const T = 10; // transition duration in frames

// Caption texts synced to each scene
const CAPTIONS = [
  { text: "AI agents are replacing junior developers right now", start: 0 },
  { text: "They write code ten times faster than humans can", start: 80 },
  {
    text: "Forty one percent of all code is now AI generated",
    start: 155,
  },
  { text: "Entry level jobs are disappearing fast", start: 230 },
  {
    text: "You need to learn system design and architecture",
    start: 305,
  },
  { text: "Adapt or get left behind follow for more", start: 375 },
];

export const TikTokVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scenes with transitions */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={88}>
          <Scene1Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={88}>
          <Scene2Code />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={88}>
          <Scene3Stats />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={88}>
          <Scene4Impact />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={88}>
          <Scene5Skills />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={80}>
          <Scene6CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Word-by-word captions overlay */}
      {CAPTIONS.map((caption, i) => (
        <Sequence
          key={i}
          from={caption.start}
          durationInFrames={75}
          layout="none"
          premountFor={10}
        >
          <WordByWordCaption
            text={caption.text}
            highlightColor={
              ["#7c3aed", "#06b6d4", "#ec4899", "#f97316", "#10b981", "#7c3aed"][
                i
              ]
            }
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
