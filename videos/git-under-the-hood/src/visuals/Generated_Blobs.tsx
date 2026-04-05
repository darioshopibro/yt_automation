import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const brand = {
  bg: "#030305",
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};

// ── Global frame timestamps from voiceover ──
const F_BLOB = 779;
const F_CONTENTS = 819;
const F_FILE = 842;
const F_FILENAME = 889;
const F_PATH = 918;
const F_RAW = 958;
const F_CONTENT = 969;
const F_GIT_TAKES = 1010;
const F_HASHES = 1059;
const F_SHA1 = 1083;
const F_STORES = 1139;
const F_COMPRESSED = 1160;
const F_OBJECT = 1177;

// ── Scene boundaries ──
const SCENE1_END = F_GIT_TAKES - 10;
const SCENE2_START = F_CONTENT;

// ── Fake file content lines ──
const fileContent = [
  "function resolve(hostname) {",
  "  const cache = lookupCache(hostname);",
  "  if (cache) return cache.ip;",
  "  return queryDNS(hostname);",
  "}",
];

const Generated_Blobs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene opacities (crossfade) ──
  const scene1Op = interpolate(frame, [SCENE1_END - 15, SCENE1_END], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 15], [0, 1], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: brand.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${brand.primary}06 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ════════════ SCENE 1: File Deconstruction ════════════ */}
      {frame < SCENE1_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            opacity: scene1Op,
          }}
        >
          <Scene1_Deconstruct frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Hashing Pipeline ════════════ */}
      {frame >= SCENE2_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene2Op,
          }}
        >
          <Scene2_Pipeline frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: File → Strip filename & path → Raw content remains
// ═══════════════════════════════════════════════════════════
const Scene1_Deconstruct: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const FileIcon = getIcon("FileCode");
  const XIcon = getIcon("X");

  // 🔊 SOUND: scene_start @ frame 779 — "blob" title fades in
  const titleOp = interpolate(frame, [F_BLOB, F_BLOB + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [F_BLOB, F_BLOB + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 819 — file card slides in
  const cardOp = interpolate(frame, [F_CONTENTS, F_CONTENTS + 20], [0, 1], clamp);
  const cardScale = spring({
    frame: Math.max(0, frame - F_CONTENTS),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // 🔊 SOUND: element_appear @ frame 889 — filename gets crossed out
  const filenameStrike = interpolate(frame, [F_FILENAME, F_FILENAME + 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const filenameGray = interpolate(frame, [F_FILENAME, F_FILENAME + 20], [1, 0.3], clamp);

  // 🔊 SOUND: element_appear @ frame 918 — path gets crossed out
  const pathStrike = interpolate(frame, [F_PATH, F_PATH + 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pathGray = interpolate(frame, [F_PATH, F_PATH + 20], [1, 0.3], clamp);

  // 🔊 SOUND: reveal @ frame 958 — raw content highlights with glow
  const contentGlow = interpolate(frame, [F_RAW, F_RAW + 25], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const contentBorderColor = interpolate(frame, [F_RAW, F_RAW + 25], [0, 1], clamp);

  // X marks on filename and path
  const xFilenameOp = interpolate(frame, [F_FILENAME + 10, F_FILENAME + 20], [0, 1], clamp);
  const xPathOp = interpolate(frame, [F_PATH + 10, F_PATH + 20], [0, 1], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: brand.text,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          What is a Blob?
        </span>
      </div>

      {/* File Card */}
      <div
        style={{
          opacity: cardOp,
          transform: `scale(${cardScale})`,
          width: 700,
          borderRadius: 12,
          background: `${brand.primary}06`,
          border: `1px solid ${brand.primary}20`,
          backdropFilter: "blur(16px)",
          overflow: "hidden",
        }}
      >
        {/* File header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 20px",
            background: `${brand.primary}08`,
            borderBottom: `1px solid ${brand.primary}15`,
          }}
        >
          <FileIcon size={20} color={brand.primary} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: brand.textMuted,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            FILE
          </span>
        </div>

        {/* File metadata — filename and path */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filename row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: brand.textMuted,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                width: 90,
              }}
            >
              FILENAME
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: brand.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: filenameGray,
                }}
              >
                resolver.js
              </span>
              {/* Strikethrough line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: `${filenameStrike * 100}%`,
                  height: 2,
                  background: "#ef4444",
                  boxShadow: `0 0 8px #ef444460`,
                  borderRadius: 1,
                }}
              />
              {/* X mark */}
              <div style={{ opacity: xFilenameOp }}>
                <XIcon size={18} color="#ef4444" weight="bold" />
              </div>
            </div>
          </div>

          {/* Path row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: brand.textMuted,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                width: 90,
              }}
            >
              PATH
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: brand.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: pathGray,
                }}
              >
                src/dns/resolver.js
              </span>
              {/* Strikethrough line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: `${pathStrike * 100}%`,
                  height: 2,
                  background: "#ef4444",
                  boxShadow: `0 0 8px #ef444460`,
                  borderRadius: 1,
                }}
              />
              {/* X mark */}
              <div style={{ opacity: xPathOp }}>
                <XIcon size={18} color="#ef4444" weight="bold" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: "100%", height: 1, background: `${brand.primary}15`, margin: "4px 0" }} />

          {/* Content — this is what matters */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 10,
              background: contentBorderColor > 0
                ? `${brand.secondary}${Math.round(contentBorderColor * 12).toString(16).padStart(2, "0")}`
                : `${brand.primary}04`,
              border: `1.5px solid ${contentBorderColor > 0
                ? `${brand.secondary}${Math.round(contentBorderColor * 50).toString(16).padStart(2, "0")}`
                : `${brand.primary}10`}`,
              boxShadow: contentGlow > 0
                ? `0 0 ${contentGlow * 25}px ${brand.secondary}25, inset 0 0 ${contentGlow * 15}px ${brand.secondary}08`
                : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: contentGlow > 0.5 ? brand.secondary : brand.textMuted,
                  fontFamily: "'SF Mono', monospace",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  textShadow: contentGlow > 0.5 ? `0 0 12px ${brand.secondary}40` : "none",
                }}
              >
                RAW CONTENT
              </span>
            </div>
            {fileContent.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    fontFamily: "'JetBrains Mono', monospace",
                    width: 20,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: contentGlow > 0.5 ? brand.text : `${brand.text}a0`,
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: "pre",
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div
        style={{
          opacity: interpolate(frame, [F_RAW + 10, F_RAW + 25], [0, 1], clamp),
          transform: `translateY(${interpolate(frame, [F_RAW + 10, F_RAW + 25], [10, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          })}px)`,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: brand.secondary,
            fontFamily: "'SF Mono', monospace",
            textShadow: `0 0 20px ${brand.secondary}30`,
          }}
        >
          A blob = just the raw content
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Content → SHA-1 Hash → Compressed Blob Object
// ═══════════════════════════════════════════════════════════
const Scene2_Pipeline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const HashIcon = getIcon("Fingerprint");
  const PackageIcon = getIcon("Package");
  const FolderIcon = getIcon("FolderOpen");
  const ArrowRightIcon = getIcon("ArrowRight");
  const FileCodeIcon = getIcon("FileCode");

  // 🔊 SOUND: scene_start @ frame 1010 — pipeline title fades in
  const titleOp = interpolate(frame, [F_GIT_TAKES, F_GIT_TAKES + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [F_GIT_TAKES, F_GIT_TAKES + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 1010 — content box appears on left
  const contentBoxOp = interpolate(frame, [F_GIT_TAKES, F_GIT_TAKES + 20], [0, 1], clamp);
  const contentBoxX = interpolate(frame, [F_GIT_TAKES, F_GIT_TAKES + 20], [-30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 1045 — first arrow draws
  const arrow1Op = interpolate(frame, [F_GIT_TAKES + 35, F_GIT_TAKES + 50], [0, 1], clamp);

  // 🔊 SOUND: element_appear @ frame 1059 — hash function box appears
  const hashBoxOp = interpolate(frame, [F_HASHES, F_HASHES + 20], [0, 1], clamp);
  const hashBoxScale = spring({
    frame: Math.max(0, frame - F_HASHES),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // 🔊 SOUND: reveal @ frame 1083 — SHA-1 hash value reveals
  const sha1Op = interpolate(frame, [F_SHA1, F_SHA1 + 20], [0, 1], clamp);
  const sha1Glow = interpolate(frame, [F_SHA1, F_SHA1 + 30], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 1120 — second arrow draws
  const arrow2Op = interpolate(frame, [F_SHA1 + 37, F_SHA1 + 52], [0, 1], clamp);

  // 🔊 SOUND: element_appear @ frame 1139 — blob object container appears
  const storeBoxOp = interpolate(frame, [F_STORES, F_STORES + 20], [0, 1], clamp);
  const storeBoxX = interpolate(frame, [F_STORES, F_STORES + 20], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 1160 — compression indicator pulses
  const compressOp = interpolate(frame, [F_COMPRESSED, F_COMPRESSED + 15], [0, 1], clamp);
  const compressScale = spring({
    frame: Math.max(0, frame - F_COMPRESSED),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: reveal @ frame 1177 — .git/objects/ path lights up
  const objectPathOp = interpolate(frame, [F_OBJECT, F_OBJECT + 15], [0, 1], clamp);
  const objectPathGlow = interpolate(frame, [F_OBJECT, F_OBJECT + 25], [0, 1], clamp);

  // Traveling pulse along the pipeline
  const pulseProgress = interpolate(frame, [F_GIT_TAKES + 20, F_STORES + 10], [0, 1], clamp);
  const pulseOp = interpolate(frame, [F_GIT_TAKES + 20, F_GIT_TAKES + 30], [0, 0.8], clamp)
    * interpolate(frame, [F_STORES, F_STORES + 10], [1, 0], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: brand.text,
          fontFamily: "'SF Mono', monospace",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Git Hashing Pipeline
      </span>

      {/* Pipeline — horizontal flow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          width: "100%",
          position: "relative",
        }}
      >
        {/* ── STAGE 1: Raw Content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: contentBoxOp,
            transform: `translateX(${contentBoxX}px)`,
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: 280,
              padding: "20px 24px",
              borderRadius: 12,
              background: `${brand.secondary}08`,
              border: `1.5px solid ${brand.secondary}25`,
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 20px ${brand.secondary}10`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <FileCodeIcon size={20} color={brand.secondary} weight="duotone" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: brand.secondary,
                  fontFamily: "'SF Mono', monospace",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Content
              </span>
            </div>
            {/* Placeholder code lines */}
            {[0.85, 0.65, 0.55, 0.75, 0.3].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 8,
                  width: `${w * 100}%`,
                  background: `${brand.text}12`,
                  borderRadius: 4,
                  marginBottom: 5,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: brand.textMuted, fontFamily: "'SF Mono', monospace" }}>
            Raw file content
          </span>
        </div>

        {/* ── Arrow 1 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            opacity: arrow1Op,
            position: "relative",
          }}
        >
          <div style={{ width: "100%", height: 2, background: `${brand.primary}30` }} />
          <ArrowRightIcon
            size={20}
            color={brand.primary}
            weight="bold"
            style={{ position: "absolute", right: -2, filter: `drop-shadow(0 0 6px ${brand.primary}60)` }}
          />
          {/* Traveling pulse */}
          {pulseProgress < 0.4 && (
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: brand.primary,
                boxShadow: `0 0 12px ${brand.primary}80`,
                left: `${(pulseProgress / 0.4) * 100}%`,
                opacity: pulseOp,
                transform: "translateX(-50%)",
              }}
            />
          )}
        </div>

        {/* ── STAGE 2: SHA-1 Hash ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: hashBoxOp,
            transform: `scale(${hashBoxScale})`,
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: 260,
              padding: "24px",
              borderRadius: 12,
              background: `${brand.accent}08`,
              border: `1.5px solid ${brand.accent}30`,
              backdropFilter: "blur(16px)",
              boxShadow: sha1Glow > 0 ? `0 0 ${sha1Glow * 30}px ${brand.accent}20` : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HashIcon size={28} color={brand.accent} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${brand.accent}60)` }} />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: brand.accent,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                SHA-1
              </span>
            </div>
            {/* Hash output */}
            <div
              style={{
                opacity: sha1Op,
                padding: "10px 16px",
                borderRadius: 8,
                background: `${brand.accent}10`,
                border: `1px solid ${brand.accent}20`,
                boxShadow: sha1Glow > 0.5 ? `0 0 15px ${brand.accent}25` : "none",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: brand.accent,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 0.5,
                }}
              >
                2e65efe...a3f894
              </span>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: brand.textMuted, fontFamily: "'SF Mono', monospace" }}>
            Hash function
          </span>
        </div>

        {/* ── Arrow 2 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            opacity: arrow2Op,
            position: "relative",
          }}
        >
          <div style={{ width: "100%", height: 2, background: `${brand.primary}30` }} />
          <ArrowRightIcon
            size={20}
            color={brand.primary}
            weight="bold"
            style={{ position: "absolute", right: -2, filter: `drop-shadow(0 0 6px ${brand.primary}60)` }}
          />
          {/* Traveling pulse */}
          {pulseProgress >= 0.4 && pulseProgress < 0.75 && (
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: brand.primary,
                boxShadow: `0 0 12px ${brand.primary}80`,
                left: `${((pulseProgress - 0.4) / 0.35) * 100}%`,
                opacity: pulseOp,
                transform: "translateX(-50%)",
              }}
            />
          )}
        </div>

        {/* ── STAGE 3: Compressed Blob Object ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: storeBoxOp,
            transform: `translateX(${storeBoxX}px)`,
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: 300,
              padding: "24px",
              borderRadius: 12,
              background: `${brand.primary}08`,
              border: `1.5px solid ${brand.primary}25`,
              backdropFilter: "blur(16px)",
              boxShadow: objectPathGlow > 0 ? `0 0 ${objectPathGlow * 25}px ${brand.primary}20` : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Compressed indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: compressOp,
                transform: `scale(${compressScale})`,
              }}
            >
              <PackageIcon
                size={28}
                color={brand.primary}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 8px ${brand.primary}60)` }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: brand.primary,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Blob Object
              </span>
            </div>

            {/* Compressed visualization — smaller placeholder lines */}
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                background: `${brand.primary}06`,
                border: `1px solid ${brand.primary}12`,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {[0.6, 0.45, 0.35].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 6,
                    width: `${w * 100}%`,
                    background: `${brand.primary}18`,
                    borderRadius: 3,
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                zlib compressed
              </span>
            </div>

            {/* .git/objects/ path */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 8,
                background: objectPathGlow > 0
                  ? `${brand.primary}12`
                  : `${brand.primary}06`,
                border: `1px solid ${brand.primary}${objectPathGlow > 0 ? "30" : "15"}`,
                boxShadow: objectPathGlow > 0.5 ? `0 0 12px ${brand.primary}20` : "none",
                opacity: objectPathOp,
              }}
            >
              <FolderIcon size={16} color={brand.primary} weight="duotone" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: objectPathGlow > 0.5 ? brand.text : brand.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: objectPathGlow > 0.5 ? `0 0 10px ${brand.primary}30` : "none",
                }}
              >
                .git/objects/2e/65efe...
              </span>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: brand.textMuted, fontFamily: "'SF Mono', monospace" }}>
            Stored object
          </span>
        </div>
      </div>

      {/* Bottom summary */}
      <div
        style={{
          opacity: interpolate(frame, [F_OBJECT + 10, F_OBJECT + 25], [0, 1], clamp),
          transform: `translateY(${interpolate(frame, [F_OBJECT + 10, F_OBJECT + 25], [10, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          })}px)`,
          padding: "14px 28px",
          borderRadius: 10,
          background: `${brand.primary}06`,
          border: `1px solid ${brand.primary}15`,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: brand.textMuted,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          Content-addressable storage — same content = same hash = same blob
        </span>
      </div>
    </div>
  );
};

export default Generated_Blobs;
