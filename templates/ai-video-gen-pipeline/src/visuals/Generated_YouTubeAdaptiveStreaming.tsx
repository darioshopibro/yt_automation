import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Upload,
  PlayCircle,
  WifiHigh,
  FilmStrip,
  VideoCamera,
  Mountains,
  Lightning,
  Database,
} from "@phosphor-icons/react";

/* ─── DATA ─── */

const qualityLevels = [
  { label: "4K", bitrate: "20 Mbps", color: "#a855f7" },
  { label: "1440p", bitrate: "16 Mbps", color: "#7c3aed" },
  { label: "1080p", bitrate: "8 Mbps", color: "#3b82f6" },
  { label: "720p", bitrate: "5 Mbps", color: "#06b6d4" },
  { label: "480p", bitrate: "2.5 Mbps", color: "#22c55e" },
  { label: "360p", bitrate: "1 Mbps", color: "#f59e0b" },
  { label: "240p", bitrate: "500 kbps", color: "#f97316" },
  { label: "144p", bitrate: "100 kbps", color: "#64748b" },
];

/* ─── HELPERS ─── */

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fadeSlideIn = (frame: number, start: number, dur = 15, dist = 25) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }),
  translateY: interpolate(frame, [start, start + dur], [dist, 0], { ...clamp, easing: Easing.out(Easing.cubic) }),
});

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

/* ─── SCENE 1: UPLOAD & TRANSCODING (0–540) ─── */

const Scene1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Upload file appears (frame 0–30)
  const fileScale = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const fileOp = fadeIn(frame, 0, 20);

  // "10GB" label (frame 30)
  const sizeAnim = fadeSlideIn(frame, 30, 18);

  // Quality tiers appear (frame 100–280, stagger)
  const tiersStart = 100;
  const tierDelay = 18;

  // Segments appear (frame 320–480)
  const segStart = 320;
  const segmentsPerRow = 12;

  // Counter: "3,300 segments" (frame 440)
  const counterAnim = fadeSlideIn(frame, 440, 20);
  const counterVal = Math.round(
    interpolate(frame, [440, 500], [0, 3300], clamp)
  );

  // Scene fade out
  const sceneOp = interpolate(frame, [510, 540], [1, 0], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        opacity: sceneOp,
      }}
    >
      {/* Upload file block */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          marginBottom: 20,
        }}
      >
        {/* Original file */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: fileOp,
            transform: `scale(${fileScale})`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f620, #3b82f608)",
              border: "1.5px solid #3b82f630",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 25px #3b82f615",
            }}
          >
            <Upload size={48} color="#3b82f6" weight="duotone" />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: 1,
            }}
          >
            4K RAW UPLOAD
          </span>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#3b82f6",
              opacity: sizeAnim.opacity,
              transform: `translateY(${sizeAnim.translateY}px)`,
              textShadow: "0 0 20px #3b82f630",
            }}
          >
            10 GB
          </span>
        </div>

        {/* Arrow */}
        <div
          style={{
            opacity: fadeIn(frame, 80, 15),
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 2,
              background: "linear-gradient(90deg, #3b82f660, #a855f760)",
            }}
          />
          <span style={{ color: "#94a3b8", fontSize: 14, fontFamily: "'SF Mono', monospace" }}>
            transcode
          </span>
          <div
            style={{
              width: 60,
              height: 2,
              background: "linear-gradient(90deg, #a855f760, #22c55e60)",
            }}
          />
        </div>

        {/* Quality tiers column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {qualityLevels.map((q, i) => {
            const tierFrame = tiersStart + i * tierDelay;
            const tAnim = fadeSlideIn(frame, tierFrame, 12, 15);
            return (
              <div
                key={q.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: tAnim.opacity,
                  transform: `translateY(${tAnim.translateY}px)`,
                }}
              >
                <div
                  style={{
                    width: 70,
                    padding: "4px 0",
                    textAlign: "center",
                    borderRadius: 6,
                    background: `${q.color}15`,
                    border: `1px solid ${q.color}25`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: q.color,
                  }}
                >
                  {q.label}
                </div>
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: "#64748b",
                  }}
                >
                  {q.bitrate}
                </span>

                {/* Segment blocks per tier */}
                <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
                  {Array.from({ length: segmentsPerRow }).map((_, si) => {
                    const sFrame = segStart + i * 8 + si * 4;
                    const sOp = interpolate(frame, [sFrame, sFrame + 8], [0, 1], clamp);
                    return (
                      <div
                        key={si}
                        style={{
                          width: 28,
                          height: 14,
                          borderRadius: 3,
                          background: `${q.color}${Math.round(sOp * 40).toString(16).padStart(2, "0")}`,
                          border: `1px solid ${q.color}${Math.round(sOp * 30).toString(16).padStart(2, "0")}`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segment counter */}
      <div
        style={{
          opacity: counterAnim.opacity,
          transform: `translateY(${counterAnim.translateY}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 42,
            fontWeight: 700,
            color: "#22c55e",
            textShadow: "0 0 30px #22c55e30",
            letterSpacing: -1,
          }}
        >
          {counterVal.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 18,
            color: "#94a3b8",
          }}
        >
          total segments across all quality levels
        </span>
      </div>
    </div>
  );
};

/* ─── SCENE 2: ADAPTIVE BITRATE STREAMING (560–1190) ─── */

const Scene2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const local = frame - 560;
  if (local < 0) return null;

  // Scene fade in / out
  const sceneIn = interpolate(local, [0, 20], [0, 1], clamp);
  const sceneOut = interpolate(local, [600, 630], [1, 0], clamp);
  const sceneOp = Math.min(sceneIn, sceneOut);

  // "Manifest file" doc appears (frame 0–40 local)
  const manifestAnim = fadeSlideIn(frame, 570, 18);

  // Player UI (frame 60)
  const playerAnim = fadeSlideIn(frame, 620, 20);

  // Medium quality start (frame 120 local = 680 global)
  const medStartOp = fadeIn(frame, 680, 15);

  // Bandwidth meter — starts high, drops mid-scene
  // High bandwidth: 680–870 (15 Mbps → 1080p)
  // Drop bandwidth: 870–1000 (3 Mbps → 480p)
  const bandwidth = interpolate(frame, [680, 750, 870, 950, 1050, 1100], [5, 15, 15, 3, 3, 8], clamp);
  const bandwidthWidth = interpolate(bandwidth, [0, 20], [0, 400], clamp);
  const bandwidthColor = bandwidth > 10 ? "#3b82f6" : bandwidth > 5 ? "#22c55e" : bandwidth > 2 ? "#f59e0b" : "#ef4444";

  // Quality label
  const currentQuality =
    bandwidth > 10 ? "1080p" : bandwidth > 5 ? "720p" : bandwidth > 2 ? "480p" : "360p";
  const qualityColor =
    bandwidth > 10 ? "#3b82f6" : bandwidth > 5 ? "#22c55e" : bandwidth > 2 ? "#f59e0b" : "#f97316";

  // Bandwidth label visible after 680
  const bwLabelOp = fadeIn(frame, 830, 15);

  // Segment strip — simulates flowing segments with changing quality
  const stripStart = 770;
  const segCount = 16;

  // "Adaptive Bitrate Streaming" title (frame 1070)
  const absTitle = fadeSlideIn(frame, 1070, 20, 30);

  // "No buffering" (frame 1100)
  const noBuffAnim = fadeSlideIn(frame, 1100, 15);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
        opacity: sceneOp,
      }}
    >
      {/* Manifest File */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          opacity: manifestAnim.opacity,
          transform: `translateY(${manifestAnim.translateY}px)`,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "linear-gradient(135deg, #a855f720, #a855f708)",
            border: "1.5px solid #a855f730",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FilmStrip size={28} color="#a855f7" weight="duotone" />
        </div>
        <div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: "#a855f7",
              display: "block",
            }}
          >
            manifest.m3u8
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: "#64748b",
              display: "block",
              marginTop: 4,
            }}
          >
            All segments at all quality levels
          </span>
        </div>
      </div>

      {/* Player simulation */}
      <div
        style={{
          opacity: playerAnim.opacity,
          transform: `translateY(${playerAnim.translateY}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* Player bar */}
        <div
          style={{
            width: "100%",
            height: 60,
            borderRadius: 10,
            background: "#12121f",
            border: "1px solid #1a1a2e",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 16,
          }}
        >
          <PlayCircle size={32} color="#e2e8f0" weight="duotone" />
          {/* Progress bar */}
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1a1a2e", position: "relative" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: qualityColor,
                width: `${interpolate(local, [100, 600], [0, 100], clamp)}%`,
                boxShadow: `0 0 10px ${qualityColor}40`,
              }}
            />
          </div>
          {/* Quality badge */}
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              background: `${qualityColor}15`,
              border: `1px solid ${qualityColor}30`,
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: qualityColor,
              opacity: medStartOp,
              minWidth: 60,
              textAlign: "center",
            }}
          >
            {currentQuality}
          </div>
        </div>

        {/* Segment strip — shows flowing segments changing quality */}
        <div
          style={{
            display: "flex",
            gap: 3,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {Array.from({ length: segCount }).map((_, i) => {
            const sFrame = stripStart + i * 12;
            const sOp = fadeIn(frame, sFrame, 10);
            // Each segment has a quality color based on when it appears
            const segBandwidth = interpolate(
              sFrame,
              [770, 870, 950, 1050],
              [8, 15, 3, 5],
              clamp
            );
            const segColor =
              segBandwidth > 10 ? "#3b82f6" : segBandwidth > 5 ? "#22c55e" : segBandwidth > 2 ? "#f59e0b" : "#f97316";
            const segLabel =
              segBandwidth > 10 ? "1080p" : segBandwidth > 5 ? "720p" : segBandwidth > 2 ? "480p" : "360p";
            return (
              <div
                key={i}
                style={{
                  width: 50,
                  height: 34,
                  borderRadius: 6,
                  background: `${segColor}15`,
                  border: `1px solid ${segColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: sOp,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    color: segColor,
                  }}
                >
                  {segLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bandwidth meter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: bwLabelOp,
        }}
      >
        <WifiHigh size={28} color={bandwidthColor} weight="duotone" />
        <div style={{ width: 420, position: "relative" }}>
          <div
            style={{
              width: "100%",
              height: 12,
              borderRadius: 6,
              background: "#1a1a2e",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: bandwidthWidth,
              height: 12,
              borderRadius: 6,
              background: bandwidthColor,
              boxShadow: `0 0 15px ${bandwidthColor}40`,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: bandwidthColor,
            minWidth: 90,
          }}
        >
          {bandwidth.toFixed(0)} Mbps
        </span>
      </div>

      {/* ABS title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: absTitle.opacity,
          transform: `translateY(${absTitle.translateY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#e2e8f0",
            textShadow: "0 0 30px #3b82f620",
          }}
        >
          Adaptive Bitrate Streaming
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            color: "#22c55e",
            opacity: noBuffAnim.opacity,
            transform: `translateY(${noBuffAnim.translateY}px)`,
          }}
        >
          Zero buffering. Seamless quality switching.
        </span>
      </div>
    </div>
  );
};

/* ─── SCENE 3: ENCODING & COMPRESSION (1210–1800) ─── */

const Scene3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const local = frame - 1210;
  if (local < 0) return null;

  const sceneIn = interpolate(local, [0, 20], [0, 1], clamp);
  const sceneOp = sceneIn;

  // Codec label (frame 1220)
  const codecAnim = fadeSlideIn(frame, 1220, 18);

  // Talking head panel (frame 1310)
  const talkAnim = fadeSlideIn(frame, 1310, 18);

  // Nature panel (frame 1460)
  const natureAnim = fadeSlideIn(frame, 1460, 18);

  // Bit allocation bars (frame 1560)
  const bitsAnim = fadeSlideIn(frame, 1560, 18);
  const talkBits = interpolate(frame, [1560, 1620], [0, 15], clamp);
  const natureBits = interpolate(frame, [1560, 1620], [0, 85], clamp);

  // Compression counter (frame 1680)
  const compAnim = fadeSlideIn(frame, 1680, 20, 30);
  const compVal = interpolate(frame, [1680, 1760], [10, 2], clamp);

  // "2 billion devices" (frame 1740)
  const devicesAnim = fadeSlideIn(frame, 1740, 18);

  // Pixel grid helper
  const renderPixelGrid = (
    changePercent: number,
    color: string,
    startFrame: number,
    rows: number,
    cols: number
  ) => {
    const totalPixels = rows * cols;
    const changedCount = Math.round(totalPixels * changePercent);
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 2,
          width: cols * 18,
        }}
      >
        {Array.from({ length: totalPixels }).map((_, i) => {
          const isChanged = i < changedCount;
          const pixelDelay = startFrame + Math.floor(i / cols) * 3;
          const pOp = fadeIn(frame, pixelDelay, 8);
          return (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: isChanged ? `${color}40` : "#1a1a2e",
                border: isChanged ? `1px solid ${color}30` : "1px solid #1a1a2e",
                opacity: pOp,
                boxShadow: isChanged ? `0 0 6px ${color}20` : "none",
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        opacity: sceneOp,
      }}
    >
      {/* Codec labels */}
      <div
        style={{
          display: "flex",
          gap: 16,
          opacity: codecAnim.opacity,
          transform: `translateY(${codecAnim.translateY}px)`,
        }}
      >
        {["H.264", "VP9"].map((codec, i) => (
          <div
            key={codec}
            style={{
              padding: "8px 24px",
              borderRadius: 10,
              background: i === 0 ? "#3b82f615" : "#22c55e15",
              border: `1px solid ${i === 0 ? "#3b82f630" : "#22c55e30"}`,
              fontFamily: "'SF Mono', monospace",
              fontSize: 18,
              fontWeight: 700,
              color: i === 0 ? "#3b82f6" : "#22c55e",
            }}
          >
            {codec}
          </div>
        ))}
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            color: "#64748b",
            alignSelf: "center",
            marginLeft: 8,
          }}
        >
          Finding redundancy in every frame
        </span>
      </div>

      {/* Side-by-side comparison */}
      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "flex-start",
        }}
      >
        {/* Talking Head */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: talkAnim.opacity,
            transform: `translateY(${talkAnim.translateY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <VideoCamera size={28} color="#3b82f6" weight="duotone" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              Talking Head
            </span>
          </div>

          {/* Pixel grid — 10% change */}
          {renderPixelGrid(0.1, "#3b82f6", 1340, 8, 12)}

          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              color: "#3b82f6",
              marginTop: 4,
            }}
          >
            90% pixels unchanged
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Only encode the differences
          </span>

          {/* Bit allocation bar */}
          <div
            style={{
              width: 200,
              height: 10,
              borderRadius: 5,
              background: "#1a1a2e",
              marginTop: 8,
              opacity: bitsAnim.opacity,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${talkBits}%`,
                height: "100%",
                borderRadius: 5,
                background: "#3b82f6",
                boxShadow: "0 0 10px #3b82f640",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: "#64748b",
              opacity: bitsAnim.opacity,
            }}
          >
            Fewer bits needed
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 2,
            height: 280,
            background: "linear-gradient(180deg, transparent, #2a2a3e, transparent)",
            alignSelf: "center",
            opacity: natureAnim.opacity,
          }}
        />

        {/* Nature Documentary */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: natureAnim.opacity,
            transform: `translateY(${natureAnim.translateY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Mountains size={28} color="#f59e0b" weight="duotone" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              Nature Documentary
            </span>
          </div>

          {/* Pixel grid — 80% change */}
          {renderPixelGrid(0.8, "#f59e0b", 1490, 8, 12)}

          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              color: "#f59e0b",
              marginTop: 4,
            }}
          >
            Constant motion — every frame differs
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Every frame needs more data
          </span>

          {/* Bit allocation bar */}
          <div
            style={{
              width: 200,
              height: 10,
              borderRadius: 5,
              background: "#1a1a2e",
              marginTop: 8,
              opacity: bitsAnim.opacity,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${natureBits}%`,
                height: "100%",
                borderRadius: 5,
                background: "#f59e0b",
                boxShadow: "0 0 10px #f59e0b40",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: "#64748b",
              opacity: bitsAnim.opacity,
            }}
          >
            More bits allocated
          </span>
        </div>
      </div>

      {/* Compression result */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          marginTop: 20,
          opacity: compAnim.opacity,
          transform: `translateY(${compAnim.translateY}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 48,
              fontWeight: 700,
              color: "#ef4444",
              textShadow: "0 0 30px #ef444430",
              letterSpacing: -2,
              opacity: interpolate(
                frame,
                [1680, 1760],
                [1, 0.4],
                clamp
              ),
            }}
          >
            10 GB
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 24,
              color: "#64748b",
              margin: "0 8px",
            }}
          >
            {"\u2192"}
          </span>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 48,
              fontWeight: 700,
              color: "#22c55e",
              textShadow: "0 0 30px #22c55e30",
              letterSpacing: -2,
            }}
          >
            {compVal.toFixed(1)} GB
          </span>
        </div>
      </div>

      {/* 2 billion devices */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: devicesAnim.opacity,
          transform: `translateY(${devicesAnim.translateY}px)`,
        }}
      >
        <Database size={22} color="#06b6d4" weight="duotone" />
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16,
            color: "#94a3b8",
          }}
        >
          Streamed to{" "}
          <span style={{ color: "#06b6d4", fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
            2 billion
          </span>{" "}
          devices worldwide
        </span>
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */

const Generated_YouTubeAdaptiveStreaming: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scene 1: Upload & Transcoding (0–540) */}
      {frame < 560 && <Scene1 frame={frame} fps={fps} />}

      {/* Scene 2: Adaptive Streaming (560–1190) */}
      {frame >= 540 && frame < 1230 && <Scene2 frame={frame} fps={fps} />}

      {/* Scene 3: Encoding & Compression (1210–1800) */}
      {frame >= 1190 && <Scene3 frame={frame} fps={fps} />}
    </div>
  );
};

export default Generated_YouTubeAdaptiveStreaming;
