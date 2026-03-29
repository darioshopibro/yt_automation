import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../lib/fonts";

interface WordByWordCaptionProps {
  text: string;
  startFrame?: number;
  wordsPerBeat?: number;
  highlightColor?: string;
}

export const WordByWordCaption: React.FC<WordByWordCaptionProps> = ({
  text,
  startFrame = 0,
  wordsPerBeat = 4,
  highlightColor = "#7c3aed",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const adjustedFrame = frame - startFrame;

  if (adjustedFrame < 0) return null;

  // Each word appears every N frames
  const framesPerWord = wordsPerBeat;
  const currentWordIndex = Math.floor(adjustedFrame / framesPerWord);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 12px",
          maxWidth: 900,
          padding: "0 40px",
        }}
      >
        {words.map((word, i) => {
          const isVisible = i <= currentWordIndex;
          const isCurrent = i === currentWordIndex;
          const wordFrame = adjustedFrame - i * framesPerWord;

          const scale = isCurrent
            ? spring({
                frame: wordFrame,
                fps,
                config: { damping: 12, stiffness: 200 },
              })
            : isVisible
              ? 1
              : 0;

          const opacity = isVisible ? 1 : 0;

          return (
            <span
              key={i}
              style={{
                fontFamily: interFont,
                fontSize: 52,
                fontWeight: 900,
                color: isCurrent ? highlightColor : "#ffffff",
                textShadow: isCurrent
                  ? `0 0 30px ${highlightColor}80`
                  : "0 2px 8px rgba(0,0,0,0.8)",
                opacity,
                transform: `scale(${scale})`,
                display: "inline-block",
                letterSpacing: "-0.02em",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
