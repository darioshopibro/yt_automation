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

// Brand colors from project
const brand = {
  bg: "#030305",
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};

// Row colors for each file entry
const rowColors = {
  indexJs: "#3b82f6",
  readme: "#22c55e",
  packageJson: "#f59e0b",
};

// ── Key frames from narrator timestamps (GLOBAL) ──
const F = {
  tree: 1221,
  directory: 1241,
  listing: 1257,
  maps: 1298,
  filenames: 1311,
  blobHashes: 1338,
  folder: 1412,
  threeFiles: 1425,
  treeObject: 1495,
  indexJs: 1533,
  blobAbc: 1583,
  readmeMd: 1654,
  blobDef: 1703,
  packageJson: 1778,
  blobGhi: 1825,
};

// ── File entries data ──
const fileEntries = [
  {
    filename: "index.js",
    hash: "abc123",
    color: rowColors.indexJs,
    icon: "FileJs",
    fileFrame: F.indexJs,
    hashFrame: F.blobAbc,
  },
  {
    filename: "readme.md",
    hash: "def456",
    color: rowColors.readme,
    icon: "FileText",
    fileFrame: F.readmeMd,
    hashFrame: F.blobDef,
  },
  {
    filename: "package.json",
    hash: "ghi789",
    color: rowColors.packageJson,
    icon: "FileCode",
    fileFrame: F.packageJson,
    hashFrame: F.blobGhi,
  },
];

const Generated_Trees: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── SCENE 1: Title + concept intro (f1221 — f1490) ──
  // 🔊 SOUND: scene_start @ frame 1221 — "tree" title fades in
  const titleOp = interpolate(frame, [F.tree, F.tree + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [F.tree, F.tree + 15], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 1241 — subtitle "directory listing" fades in
  const subtitleOp = interpolate(frame, [F.directory, F.directory + 15], [0, 1], clamp);
  const subtitleY = interpolate(frame, [F.directory, F.directory + 15], [12, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Column headers: "FILENAME" and "BLOB HASH" ──
  // 🔊 SOUND: element_appear @ frame 1298 — column headers appear
  const headersOp = interpolate(frame, [F.maps, F.maps + 15], [0, 1], clamp);
  const headersY = interpolate(frame, [F.maps, F.maps + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Tree object container ──
  // 🔊 SOUND: element_appear @ frame 1412 — tree object container appears
  const containerOp = interpolate(frame, [F.folder, F.folder + 20], [0, 1], clamp);
  const containerScale = spring({
    frame: Math.max(0, frame - F.folder),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // 🔊 SOUND: reveal @ frame 1495 — tree object label glows
  const treeObjGlow = interpolate(frame, [F.treeObject, F.treeObject + 20], [0, 30], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const treeObjLabelOp = interpolate(frame, [F.treeObject, F.treeObject + 15], [0, 1], clamp);

  // ── Arrow connector between filename and hash (drawn per row) ──
  const getArrowProgress = (startFrame: number) =>
    interpolate(frame, [startFrame + 8, startFrame + 22], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });

  const TreeIcon = getIcon("TreeStructure");
  const FolderIcon = getIcon("FolderOpen");
  const ArrowIcon = getIcon("ArrowRight");

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: brand.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${brand.primary}06 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      {/* ═══ TITLE AREA ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 50,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tree icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${brand.primary}20, ${brand.primary}08)`,
            border: `1.5px solid ${brand.primary}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${brand.primary}15`,
          }}
        >
          <TreeIcon size={32} color={brand.primary} weight="duotone" />
        </div>

        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: brand.text,
            fontFamily: "'SF Mono', monospace",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Git Tree Object
        </span>

        {/* Subtitle — "A directory listing" */}
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: brand.textMuted,
            opacity: subtitleOp,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          A directory listing that maps filenames to blob hashes
        </span>

        {/* Accent underline */}
        <div
          style={{
            width: 60,
            height: 3,
            background: brand.primary,
            borderRadius: 2,
            boxShadow: `0 0 12px ${brand.primary}60`,
            opacity: subtitleOp,
          }}
        />
      </div>

      {/* ═══ TREE OBJECT CONTAINER ═══ */}
      <div
        style={{
          width: 900,
          borderRadius: 12,
          background: `${brand.primary}06`,
          border: `1px solid ${brand.primary}15`,
          backdropFilter: "blur(16px)",
          boxShadow: `0 0 ${treeObjGlow}px ${brand.primary}20`,
          opacity: containerOp,
          transform: `scale(${containerScale})`,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Container header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 28px",
            borderBottom: `1px solid ${brand.primary}12`,
            background: `${brand.primary}04`,
          }}
        >
          <FolderIcon size={22} color={brand.accent} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: brand.textMuted,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 0.5,
            }}
          >
            tree
          </span>

          {/* "tree object" badge — appears at f1495 */}
          <div
            style={{
              marginLeft: "auto",
              padding: "4px 12px",
              borderRadius: 8,
              background: `${brand.accent}12`,
              border: `1px solid ${brand.accent}25`,
              opacity: treeObjLabelOp,
              boxShadow: treeObjGlow > 10 ? `0 0 12px ${brand.accent}20` : "none",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: brand.accent,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: 0.5,
              }}
            >
              TREE OBJECT
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 28px",
            borderBottom: `1px solid #ffffff08`,
            opacity: headersOp,
            transform: `translateY(${headersY}px)`,
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Filename
          </span>
          <div style={{ width: 80 }} />
          <span
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              textAlign: "right",
            }}
          >
            Blob Hash
          </span>
        </div>

        {/* ═══ FILE ENTRIES — appear one by one ═══ */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {fileEntries.map((entry, idx) => {
            const FileIcon = getIcon(entry.icon);

            // 🔊 SOUND: element_appear @ frame {entry.fileFrame} — {entry.filename} row slides in
            const rowOp = interpolate(
              frame,
              [entry.fileFrame, entry.fileFrame + 15],
              [0, 1],
              clamp
            );
            const rowX = interpolate(
              frame,
              [entry.fileFrame, entry.fileFrame + 15],
              [-30, 0],
              { ...clamp, easing: Easing.out(Easing.cubic) }
            );

            // 🔊 SOUND: element_appear @ frame {entry.hashFrame} — blob hash {entry.hash} reveals
            const hashOp = interpolate(
              frame,
              [entry.hashFrame, entry.hashFrame + 15],
              [0, 1],
              clamp
            );
            const hashX = interpolate(
              frame,
              [entry.hashFrame, entry.hashFrame + 15],
              [20, 0],
              { ...clamp, easing: Easing.out(Easing.cubic) }
            );

            // Arrow draws from filename to hash
            const arrowProgress = getArrowProgress(entry.hashFrame);

            // Hash glow on reveal
            const hashGlow = interpolate(
              frame,
              [entry.hashFrame, entry.hashFrame + 25],
              [0, 15],
              clamp
            );

            const isLast = idx === fileEntries.length - 1;

            return (
              <div
                key={entry.filename}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "18px 28px",
                  borderBottom: isLast ? "none" : `1px solid #ffffff06`,
                  opacity: rowOp,
                  background: frame >= entry.fileFrame ? `${entry.color}04` : "transparent",
                }}
              >
                {/* Filename side */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transform: `translateX(${rowX}px)`,
                  }}
                >
                  {/* File icon box */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${entry.color}20, ${entry.color}08)`,
                      border: `1.5px solid ${entry.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 12px ${entry.color}12`,
                    }}
                  >
                    <FileIcon size={22} color={entry.color} weight="duotone" />
                  </div>

                  {/* Filename text */}
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: brand.text,
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                      letterSpacing: -0.5,
                    }}
                  >
                    {entry.filename}
                  </span>
                </div>

                {/* Arrow connector */}
                <div
                  style={{
                    width: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: arrowProgress,
                  }}
                >
                  <div
                    style={{
                      width: `${arrowProgress * 40}px`,
                      height: 2,
                      background: `${entry.color}40`,
                      borderRadius: 1,
                    }}
                  />
                  <ArrowIcon
                    size={18}
                    color={`${entry.color}`}
                    weight="bold"
                    style={{
                      opacity: arrowProgress,
                      filter: `drop-shadow(0 0 6px ${entry.color}40)`,
                    }}
                  />
                </div>

                {/* Blob hash side */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 10,
                    opacity: hashOp,
                    transform: `translateX(${hashX}px)`,
                  }}
                >
                  {/* Hash badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: `${entry.color}10`,
                      border: `1px solid ${entry.color}25`,
                      boxShadow: `0 0 ${hashGlow}px ${entry.color}25`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: brand.textMuted,
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      blob
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: entry.color,
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                        letterSpacing: 0.5,
                        textShadow: hashGlow > 8 ? `0 0 12px ${entry.color}40` : "none",
                      }}
                    >
                      {entry.hash}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom summary — all three mapped */}
        <div
          style={{
            padding: "14px 28px",
            borderTop: `1px solid #ffffff06`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: interpolate(
              frame,
              [F.blobGhi + 20, F.blobGhi + 35],
              [0, 1],
              clamp
            ),
          }}
        >
          {/* 🔊 SOUND: reveal @ frame 1860 — summary "3 files mapped" fades in */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: brand.textMuted,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            3 files
          </span>
          <ArrowIcon size={14} color={brand.textMuted} weight="bold" />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: brand.textMuted,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            3 blob hashes
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_Trees;
