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

const Generated_DockerContainerLifecycle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase markers
  const TITLE      = 0;
  const PANEL_IN   = 22;
  const FROM_HL    = 42;
  const COPY_HL    = 115;
  const RUN_HL     = 185;
  const CACHE_DEMO = 258;
  const IMAGE_LBL  = 320;
  const DOCKER_RUN = 358;
  const CONT_IN    = 390;
  const CONT_INFO  = 425;
  const EPHEMERAL  = 492;
  const CONT_DIE   = 538;
  const VOLUME_IN  = 578;
  const FINAL_LBL  = 648;

  // ── Helper
  const fi = (start: number, dur = 20, easing = Easing.out(Easing.cubic)) =>
    interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing,
    });
  const slideY = (start: number, fromPx = 20, dur = 20) =>
    interpolate(frame, [start, start + dur], [fromPx, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  // ── Dockerfile line highlights
  const fromHL = interpolate(
    frame, [FROM_HL, FROM_HL + 15, COPY_HL - 5, COPY_HL + 10], [0, 1, 1, 0.25],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const copyHL = interpolate(
    frame, [COPY_HL, COPY_HL + 15, RUN_HL - 5, RUN_HL + 10], [0, 1, 1, 0.25],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const runHL = interpolate(
    frame, [RUN_HL, RUN_HL + 15], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Layer entrance animations
  const fromOp = fi(FROM_HL);
  const fromTy = slideY(FROM_HL, -20);
  const copyOp = fi(COPY_HL);
  const copyTy = slideY(COPY_HL, -20);
  const runOp  = fi(RUN_HL);
  const runTy  = slideY(RUN_HL, -20);

  // ── Cache demo: COPY pulses, RUN rebuilds
  const inCache = frame >= CACHE_DEMO && frame < CACHE_DEMO + 65;
  const cachePulse = inCache
    ? interpolate(frame,
        [CACHE_DEMO, CACHE_DEMO + 20, CACHE_DEMO + 42, CACHE_DEMO + 62],
        [0, 1, 0.4, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const runRebuildOp = frame >= CACHE_DEMO && frame < CACHE_DEMO + 68
    ? interpolate(frame,
        [CACHE_DEMO, CACHE_DEMO + 15, CACHE_DEMO + 50, CACHE_DEMO + 68],
        [1, 0.18, 0.18, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const cacheLblOp = fi(CACHE_DEMO, 18);

  // ── Image total label
  const imgLblOp = fi(IMAGE_LBL, 22);

  // ── docker run command
  const dRunOp = fi(DOCKER_RUN, 20);

  // ── Container box entrance
  const contBoxOp = fi(CONT_IN, 25);
  const contScale = spring({ frame: frame - CONT_IN, fps, config: { damping: 22, stiffness: 200 } });

  // ── Container info badges
  const contInfoOp = fi(CONT_INFO, 25);

  // ── Ephemeral warning
  const ephemeralOp = fi(EPHEMERAL, 20);

  // ── Container die → revive
  const contWrapOp = frame >= CONT_DIE
    ? interpolate(frame,
        [CONT_DIE, CONT_DIE + 28, VOLUME_IN + 38, VOLUME_IN + 65],
        [1, 0.18, 0.18, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // ── Volume
  const volOp = fi(VOLUME_IN, 25);
  const volTy = slideY(VOLUME_IN, 22, 25);

  // ── Final label
  const finalOp = fi(FINAL_LBL, 20);

  // hex alpha helper
  const ha = (n: number) => Math.round(Math.max(0, Math.min(n, 255))).toString(16).padStart(2, "0");

  // ── Icons
  const FileCode   = getIcon("FileCode");
  const HardDrives = getIcon("HardDrives");
  const Warning    = getIcon("Warning");
  const BoxArrowDown = getIcon("ArrowSquareDown");

  // ── Layer size bar % (200MB = 82%, min 9%)
  const sizePct = (mb: number) => Math.max(9, (mb / 200) * 82);

  return (
    <div style={{
      width: 1920, height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      padding: "44px 80px 52px",
      gap: 24,
    }}>

      {/* ── Header ── */}
      <div style={{
        opacity: fi(TITLE),
        transform: `translateY(${slideY(TITLE)}px)`,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: "#22c55e", textTransform: "uppercase", marginBottom: 6,
        }}>
          Containerization
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#e2e8f0" }}>
          How a Docker Container is Born
        </div>
      </div>

      {/* ── Context Panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: 32,
        opacity: fi(PANEL_IN, 25),
        alignItems: "flex-start",
        overflow: "hidden",
      }}>

        {/* ══ LEFT: Dockerfile ══ */}
        <div style={{
          width: 540,
          flexShrink: 0,
          background: "#0a0a18",
          border: "1px solid #1a1a2e",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Panel header */}
          <div style={{
            background: "#12121f",
            borderBottom: "1px solid #1a1a2e",
            padding: "11px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <FileCode size={15} color="#64748b" weight="duotone" />
            <span style={{
              fontSize: 13, color: "#64748b",
              fontFamily: "'SF Mono', monospace", fontWeight: 600,
            }}>
              Dockerfile
            </span>
          </div>

          {/* Lines */}
          <div style={{ padding: "14px 0", display: "flex", flexDirection: "column" }}>

            {/* Placeholder rows */}
            {[160, 100].map((w, i) => (
              <div key={i} style={{ padding: "5px 20px 5px 56px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#1e1e30", fontFamily: "'SF Mono', monospace", width: 20, textAlign: "right" }}>{i + 1}</span>
                <div style={{ height: 9, width: w, background: "#1a1a2e20", borderRadius: 3 }} />
              </div>
            ))}

            {/* FROM line */}
            <div style={{
              padding: "9px 20px",
              background: `#3b82f6${ha(fromHL * 22)}`,
              borderLeft: `3px solid #3b82f6${ha(fromHL * 200)}`,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#2a2a3e", fontFamily: "'SF Mono', monospace", width: 20, textAlign: "right" }}>3</span>
              <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", fontWeight: 600, color: fromHL > 0.1 ? "#e2e8f0" : "#4a4a5e" }}>
                <span style={{ color: `#3b82f6${ha(Math.max(fromHL, 0.3) * 200)}` }}>FROM </span>
                node:18
              </span>
            </div>

            {/* Placeholder */}
            <div style={{ padding: "5px 20px 5px 56px", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#1e1e30", fontFamily: "'SF Mono', monospace", width: 20 }}>4</span>
              <div style={{ height: 9, width: 80, background: "#1a1a2e15", borderRadius: 3 }} />
            </div>

            {/* COPY line */}
            <div style={{
              padding: "9px 20px",
              background: `#f59e0b${ha(copyHL * 22)}`,
              borderLeft: `3px solid #f59e0b${ha(copyHL * 200)}`,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#2a2a3e", fontFamily: "'SF Mono', monospace", width: 20, textAlign: "right" }}>5</span>
              <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", fontWeight: 600, color: copyHL > 0.1 ? "#e2e8f0" : "#4a4a5e" }}>
                <span style={{ color: `#f59e0b${ha(Math.max(copyHL, 0.3) * 200)}` }}>COPY </span>
                ./src /app
              </span>
            </div>

            {/* Placeholder */}
            <div style={{ padding: "5px 20px 5px 56px", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#1e1e30", fontFamily: "'SF Mono', monospace", width: 20 }}>6</span>
              <div style={{ height: 9, width: 200, background: "#1a1a2e15", borderRadius: 3 }} />
            </div>

            {/* RUN line */}
            <div style={{
              padding: "9px 20px",
              background: `#a855f7${ha(runHL * 22)}`,
              borderLeft: `3px solid #a855f7${ha(runHL * 200)}`,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#2a2a3e", fontFamily: "'SF Mono', monospace", width: 20, textAlign: "right" }}>7</span>
              <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", fontWeight: 600, color: runHL > 0.1 ? "#e2e8f0" : "#4a4a5e" }}>
                <span style={{ color: `#a855f7${ha(Math.max(runHL, 0.3) * 200)}` }}>RUN </span>
                npm install
              </span>
            </div>

            {/* Remaining placeholders */}
            {[110, 60, 140, 70].map((w, i) => (
              <div key={i} style={{ padding: "5px 20px 5px 56px", display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#1e1e30", fontFamily: "'SF Mono', monospace", width: 20, textAlign: "right" }}>{8 + i}</span>
                <div style={{ height: 9, width: w, background: "#1a1a2e12", borderRadius: 3 }} />
              </div>
            ))}
          </div>

          {/* docker run command */}
          <div style={{
            opacity: dRunOp,
            margin: "0 14px 14px",
            background: "#0b1a0b",
            border: "1px solid #22c55e25",
            borderRadius: 8,
            padding: "10px 16px",
            fontFamily: "'SF Mono', monospace",
            fontSize: 13,
            marginTop: "auto",
          }}>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>$ </span>
            <span style={{ color: "#64748b" }}>docker run </span>
            <span style={{ color: "#e2e8f0" }}>myapp:latest</span>
          </div>
        </div>

        {/* ══ RIGHT: Layer stack + container ══ */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minWidth: 0,
        }}>

          {/* Section label */}
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "#64748b", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <BoxArrowDown size={14} color="#64748b" weight="duotone" />
            Image Layers
          </div>

          {/* Container wrapper (border/bg appear at CONT_IN) */}
          <div style={{
            border: frame >= CONT_IN
              ? `1.5px solid #22c55e${ha(Math.min(contScale, 1) * 55)}`
              : "1.5px solid transparent",
            borderRadius: 16,
            padding: frame >= CONT_IN ? 16 : 0,
            background: frame >= CONT_IN ? "#22c55e07" : "transparent",
            boxShadow: frame >= CONT_IN ? `0 0 40px #22c55e${ha(Math.min(contScale, 1) * 16)}` : "none",
            opacity: contWrapOp,
          }}>

            {/* Container label + badges */}
            {frame >= CONT_IN && (
              <div style={{
                opacity: contBoxOp,
                transform: `scale(${Math.min(contScale, 1)})`,
                transformOrigin: "top left",
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 14, flexWrap: "wrap",
              }}>
                <div style={{
                  background: "#22c55e18", border: "1px solid #22c55e35",
                  borderRadius: 8, padding: "4px 14px",
                  fontSize: 12, fontWeight: 700, color: "#22c55e", letterSpacing: 1.5,
                }}>
                  CONTAINER
                </div>
                {frame >= CONT_INFO && (
                  <div style={{ opacity: contInfoOp, display: "flex", gap: 8 }}>
                    {["isolated filesystem", "own network", "own PID space"].map((badge, i) => (
                      <div key={badge} style={{
                        opacity: interpolate(frame, [CONT_INFO + i * 14, CONT_INFO + i * 14 + 16], [0, 1], {
                          extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        }),
                        background: "#3b82f608",
                        border: "1px solid #3b82f622",
                        borderRadius: 7, padding: "3px 11px",
                        fontSize: 12, color: "#3b82f6", fontWeight: 600,
                      }}>
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Layer rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* FROM layer */}
              <div style={{ opacity: fromOp, transform: `translateY(${fromTy}px)` }}>
                <div style={{
                  background: "#3b82f608", border: "1px solid #3b82f622",
                  borderRadius: 11, padding: "13px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f680", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#e2e8f0", fontWeight: 600 }}>FROM node:18</span>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#3b82f6", fontWeight: 700 }}>50MB</span>
                    </div>
                    <div style={{ height: 5, width: "100%", background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${sizePct(50)}%`, background: "linear-gradient(90deg, #3b82f680, #3b82f6)", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Base image</div>
                  </div>
                  {frame >= CACHE_DEMO && (
                    <div style={{
                      opacity: cacheLblOp, flexShrink: 0,
                      background: "#22c55e10", border: "1px solid #22c55e30",
                      borderRadius: 7, padding: "3px 10px",
                      fontSize: 11, color: "#22c55e", fontWeight: 700,
                    }}>
                      CACHED
                    </div>
                  )}
                </div>
              </div>

              {/* COPY layer */}
              <div style={{ opacity: copyOp, transform: `translateY(${copyTy}px)` }}>
                <div style={{
                  background: "#f59e0b08", border: "1px solid #f59e0b22",
                  borderRadius: 11, padding: "13px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: cachePulse > 0 ? `0 0 ${cachePulse * 28}px #f59e0b55` : "none",
                }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b80", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#e2e8f0", fontWeight: 600 }}>COPY ./src /app</span>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#f59e0b", fontWeight: 700 }}>5MB</span>
                    </div>
                    <div style={{ height: 5, width: "100%", background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${sizePct(5)}%`, background: "linear-gradient(90deg, #f59e0b80, #f59e0b)", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Source code</div>
                  </div>
                  {frame >= CACHE_DEMO && (
                    <div style={{
                      opacity: cacheLblOp, flexShrink: 0,
                      background: "#f59e0b10", border: "1px solid #f59e0b30",
                      borderRadius: 7, padding: "3px 10px",
                      fontSize: 11, color: "#f59e0b", fontWeight: 700,
                    }}>
                      CHANGED
                    </div>
                  )}
                </div>
              </div>

              {/* RUN layer */}
              <div style={{ opacity: runOp * runRebuildOp, transform: `translateY(${runTy}px)` }}>
                <div style={{
                  background: "#a855f708", border: "1px solid #a855f722",
                  borderRadius: 11, padding: "13px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f780", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#e2e8f0", fontWeight: 600 }}>RUN npm install</span>
                      <span style={{ fontSize: 13, fontFamily: "'SF Mono', monospace", color: "#a855f7", fontWeight: 700 }}>200MB</span>
                    </div>
                    <div style={{ height: 5, width: "100%", background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${sizePct(200)}%`, background: "linear-gradient(90deg, #a855f780, #a855f7)", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>node_modules — heaviest layer</div>
                  </div>
                  {frame >= CACHE_DEMO && (
                    <div style={{
                      opacity: cacheLblOp, flexShrink: 0,
                      background: "#a855f710", border: "1px solid #a855f730",
                      borderRadius: 7, padding: "3px 10px",
                      fontSize: 11, color: "#a855f7", fontWeight: 700,
                    }}>
                      REBUILD
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image total label */}
            {frame >= IMAGE_LBL && (
              <div style={{
                opacity: imgLblOp,
                marginTop: 12,
                display: "flex", alignItems: "center", gap: 10,
                justifyContent: "flex-end",
              }}>
                <div style={{ flex: 1, height: 1, background: "#22c55e18" }} />
                <div style={{
                  background: "#22c55e10", border: "1px solid #22c55e30",
                  borderRadius: 8, padding: "6px 16px",
                  fontSize: 13, color: "#22c55e", fontWeight: 700,
                  fontFamily: "'SF Mono', monospace",
                }}>
                  Total: 255MB → Image
                </div>
              </div>
            )}
          </div>

          {/* Ephemeral warning */}
          {frame >= EPHEMERAL && (
            <div style={{
              opacity: ephemeralOp,
              display: "flex", alignItems: "center", gap: 10,
              background: "#ef444410", border: "1px solid #ef444432",
              borderRadius: 10, padding: "10px 18px",
            }}>
              <Warning size={17} color="#ef4444" weight="duotone" />
              <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>Filesystem is ephemeral</span>
              <span style={{ color: "#64748b", fontSize: 14 }}>— data inside is gone when container stops</span>
            </div>
          )}

          {/* Volume */}
          {frame >= VOLUME_IN && (
            <div style={{
              opacity: volOp,
              transform: `translateY(${volTy}px)`,
              background: "#f9731609", border: "1.5px solid #f9731632",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "linear-gradient(135deg, #f9731622, #f9731608)",
                border: "1.5px solid #f9731630",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <HardDrives size={24} color="#f97316" weight="duotone" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>Volume Mount</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Persistent storage — data survives container restarts
                </div>
              </div>
              {frame >= FINAL_LBL && (
                <div style={{
                  opacity: finalOp, flexShrink: 0,
                  background: "#22c55e10", border: "1px solid #22c55e30",
                  borderRadius: 8, padding: "5px 13px",
                  fontSize: 12, color: "#22c55e", fontWeight: 700,
                }}>
                  PERSISTENT
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generated_DockerContainerLifecycle;
