import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { ShieldCheck, Lightning, Warning, Drop, Timer, Database, ArrowRight, XCircle, CheckCircle, Funnel } from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0f0f1a";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * TIMELINE (30fps)
 * ═══════════════════════════════════════════════════════════
 * SCENE 1: THE PROBLEM (0-300)
 *   0-30:    Title fade in
 *   30-90:   Requests flooding animation
 *   90-150:  "10,000 req/s" — server overwhelmed
 *   150-210: Server crashes / goes red
 *   210-270: "Rate Limiting = Your Bouncer"
 *   270-300: Fade out
 *
 * SCENE 2: TOKEN BUCKET (300-930)
 *   300-360: "Token Bucket Algorithm" title
 *   360-420: Bucket appears with fill gauge
 *   420-480: Fill to 100 tokens (liquid rises)
 *   480-540: "10 tokens/sec drip in" — drip animation
 *   540-600: Request → token consumed (99)
 *   600-660: More requests → drops to 90, 80...
 *   660-720: Bucket empty → 429 Too Many Requests
 *   720-810: Burst: 100 instant, then 10/s refill
 *   810-870: Stripe: 100/s test, 10,000/s live
 *   870-930: Retry-After header
 *
 * SCENE 3: SLIDING WINDOW + REDIS (930-1350)
 *   930-990:  "Sliding Window" title
 *   990-1080: Window visualization — 60s window
 *   1080-1140: Counter hits 600 → blocked
 *   1140-1200: "No bursting, but predictable"
 *   1200-1260: Redis appears
 *   1260-1350: INCR + EXPIRE commands
 */

// ═══════════════════════════════════════════════════════════
// SCENE 1: THE PROBLEM
// ═══════════════════════════════════════════════════════════
const Scene1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleOp = fadeIn(frame, 0);
  const titleY = slideUp(frame, 0);

  // Server appears
  const serverOp = fadeIn(frame, 30);
  const serverY = slideUp(frame, 30);
  const serverScale = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 20, stiffness: 200 } });

  // Flooding requests (animated dots)
  const floodStart = 50;
  const numRequests = Math.min(12, Math.floor(Math.max(0, frame - floodStart) / 4));

  // Server turns red when overwhelmed
  const overwhelmProgress = interpolate(frame, [100, 150], [0, 1], { ...clamp });
  const serverBorderColor = interpolate(overwhelmProgress, [0, 1], [0, 1], { ...clamp });
  const serverGlow = `0 0 ${20 + overwhelmProgress * 30}px ${overwhelmProgress > 0.5 ? RED : BLUE}${Math.round(20 + overwhelmProgress * 30).toString(16).padStart(2, "0")}`;

  // "10,000 req/s" counter
  const counterOp = fadeIn(frame, 90);
  const counterY = slideUp(frame, 90);
  const reqCount = Math.round(interpolate(frame, [90, 130], [0, 10000], { ...clamp }));

  // Crash effect
  const crashOp = fadeIn(frame, 150);
  const crashShake = frame > 150 && frame < 170 ? Math.sin(frame * 2.5) * 4 : 0;

  // Bouncer section
  const bouncerOp = fadeIn(frame, 210);
  const bouncerY = slideUp(frame, 210);
  const bouncerScale = spring({ frame: Math.max(0, frame - 215), fps, config: { damping: 20, stiffness: 180 } });

  return (
    <div style={{ opacity: frame > 270 ? fadeOut(frame, 270) : 1, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: -0.5 }}>
        API Rate Limiting
      </div>

      {/* Main area */}
      <div style={{ display: "flex", alignItems: "center", gap: 80, transform: `translateX(${crashShake}px)` }}>
        {/* Request flood */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 200 }}>
          <div style={{ opacity: counterOp, transform: `translateY(${counterY}px)`, fontFamily: "'SF Mono', monospace", fontSize: 22, fontWeight: 700, color: RED, textShadow: `0 0 20px ${RED}40` }}>
            {reqCount.toLocaleString()} req/s
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", width: 160 }}>
            {Array.from({ length: numRequests }).map((_, i) => {
              const dotOp = fadeIn(frame, floodStart + i * 4, 8);
              const dotX = interpolate(frame, [floodStart + i * 4, floodStart + i * 4 + 20], [60, 0], { ...clamp, easing: easeOutCubic });
              return (
                <div key={i} style={{
                  opacity: dotOp,
                  transform: `translateX(${dotX}px)`,
                  width: 14, height: 14, borderRadius: "50%",
                  background: i < 6 ? BLUE : RED,
                  boxShadow: `0 0 8px ${i < 6 ? BLUE : RED}50`,
                }} />
              );
            })}
          </div>
          {numRequests > 0 && (
            <div style={{ opacity: fadeIn(frame, 60), fontSize: 13, color: TEXT_DIM, fontFamily: "'Inter', system-ui, sans-serif" }}>
              Incoming Requests
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={{ opacity: fadeIn(frame, 45) }}>
          <ArrowRight size={32} color={TEXT_DIM} weight="bold" />
        </div>

        {/* Server */}
        <div style={{
          opacity: serverOp,
          transform: `translateY(${serverY}px) scale(${serverScale})`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: 20,
            background: `linear-gradient(135deg, ${serverBorderColor > 0.5 ? RED : BLUE}15, ${serverBorderColor > 0.5 ? RED : BLUE}05)`,
            border: `2px solid ${serverBorderColor > 0.5 ? RED : BLUE}40`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: serverGlow,
          }}>
            <Lightning size={40} color={serverBorderColor > 0.5 ? RED : BLUE} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${serverBorderColor > 0.5 ? RED : BLUE}60)` }} />
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, fontWeight: 600, color: serverBorderColor > 0.5 ? RED : TEXT_PRIMARY }}>
              YOUR API
            </span>
          </div>

          {/* Crash text */}
          {frame > 150 && (
            <div style={{ opacity: crashOp, display: "flex", alignItems: "center", gap: 8 }}>
              <Warning size={20} color={RED} weight="duotone" />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 600, color: RED }}>
                SERVICE DOWN
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bouncer section */}
      {frame > 210 && (
        <div style={{
          opacity: bouncerOp,
          transform: `translateY(${bouncerY}px) scale(${bouncerScale})`,
          display: "flex", alignItems: "center", gap: 16,
          padding: "20px 36px", borderRadius: 12,
          background: `${GREEN}08`, border: `1.5px solid ${GREEN}25`,
          boxShadow: `0 0 20px ${GREEN}10`,
        }}>
          <ShieldCheck size={36} color={GREEN} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${GREEN}60)` }} />
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 20, fontWeight: 600, color: TEXT_PRIMARY }}>
            Rate Limiting = Your Bouncer at the Door
          </span>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: TOKEN BUCKET
// ═══════════════════════════════════════════════════════════
const Bucket: React.FC<{
  fillPercent: number;
  color: string;
  tokenCount: number;
  showDrip: boolean;
  rejected: boolean;
  frame: number;
}> = ({ fillPercent, color, tokenCount, showDrip, rejected, frame }) => {
  const bucketWidth = 260;
  const bucketHeight = 340;
  const fillHeight = (bucketHeight - 40) * Math.min(1, Math.max(0, fillPercent / 100));

  // Drip animation
  const dripY = showDrip ? interpolate(frame % 30, [0, 29], [0, 40], { ...clamp }) : 0;
  const dripOp = showDrip ? interpolate(frame % 30, [0, 20, 29], [1, 1, 0], { ...clamp }) : 0;

  // Wave effect on fill
  const waveOffset = Math.sin(frame * 0.08) * 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative" }}>
      {/* Drip indicator */}
      {showDrip && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: 50 }}>
          <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, color: CYAN, fontWeight: 600, letterSpacing: 0.5 }}>
            +10 tokens/sec
          </div>
          <div style={{
            opacity: dripOp,
            transform: `translateY(${dripY}px)`,
            width: 8, height: 8, borderRadius: "50%",
            background: CYAN,
            boxShadow: `0 0 10px ${CYAN}60`,
          }} />
        </div>
      )}
      {!showDrip && <div style={{ height: 50 }} />}

      {/* Bucket container */}
      <div style={{
        width: bucketWidth, height: bucketHeight,
        borderRadius: "12px 12px 24px 24px",
        border: `2px solid ${rejected ? RED : color}40`,
        background: `${rejected ? RED : color}06`,
        overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        boxShadow: `0 0 20px ${rejected ? RED : color}15`,
      }}>
        {/* Fill level */}
        <div style={{
          width: "100%",
          height: fillHeight + waveOffset,
          background: `linear-gradient(180deg, ${rejected ? RED : color}35, ${rejected ? RED : color}18)`,
          borderRadius: "0 0 22px 22px",
          transition: "none",
        }} />
      </div>

      {/* Token counter */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: 6,
      }}>
        <span style={{
          fontFamily: "'SF Mono', monospace", fontSize: 36, fontWeight: 700,
          color: rejected ? RED : tokenCount > 50 ? GREEN : tokenCount > 20 ? AMBER : RED,
          textShadow: `0 0 20px ${rejected ? RED : tokenCount > 50 ? GREEN : tokenCount > 20 ? AMBER : RED}30`,
          letterSpacing: -1,
        }}>
          {tokenCount}
        </span>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, color: TEXT_DIM, fontWeight: 600 }}>
          / 100 tokens
        </span>
      </div>
    </div>
  );
};

const Scene2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Normalize frame to scene-local (scene starts at 300)
  const f = frame - 300;

  const titleOp = fadeIn(f, 0, 0);
  const titleY = slideUp(f, 0, 0);

  // Bucket appears
  const bucketOp = fadeIn(f, 60);
  const bucketScale = spring({ frame: Math.max(0, f - 60), fps, config: { damping: 22, stiffness: 180 } });

  // Fill to 100 tokens (120-180)
  const initialFill = interpolate(f, [120, 180], [0, 100], { ...clamp, easing: easeOutCubic });

  // Drip starts at 180
  const showDrip = f > 180;

  // Requests consume tokens (240-360)
  const consumePhase = interpolate(f, [240, 360], [0, 100], { ...clamp, easing: easeOutCubic });

  // 429 rejection zone (360-420)
  const isRejected = f > 360 && f < 450;

  // Refill / burst demo (420-540)
  const burstRefill = f > 420 ? interpolate(f, [420, 450, 510], [0, 100, 30], { ...clamp }) : 0;

  // Calculate token count
  let tokenCount: number;
  let fillPercent: number;
  if (f < 120) {
    tokenCount = 0; fillPercent = 0;
  } else if (f < 240) {
    tokenCount = Math.round(initialFill); fillPercent = initialFill;
  } else if (f < 420) {
    const consumed = consumePhase;
    tokenCount = Math.max(0, Math.round(100 - consumed));
    fillPercent = Math.max(0, 100 - consumed);
  } else {
    tokenCount = Math.round(burstRefill);
    fillPercent = burstRefill;
  }

  // Request indicators
  const reqPhases = [
    { start: 240, label: "GET /api/users", status: "ok" as const },
    { start: 270, label: "POST /api/data", status: "ok" as const },
    { start: 300, label: "GET /api/items", status: "ok" as const },
    { start: 330, label: "PUT /api/update", status: "ok" as const },
    { start: 370, label: "GET /api/users", status: "rejected" as const },
    { start: 390, label: "POST /api/data", status: "rejected" as const },
  ];

  // Stripe example (510-570)
  const stripeOp = fadeIn(f, 510);
  const stripeY = slideUp(f, 510);

  // Retry-After (570-630)
  const retryOp = fadeIn(f, 570);
  const retryY = slideUp(f, 570);

  return (
    <div style={{
      opacity: f < 0 ? 0 : f > 600 ? fadeOut(f, 600) : 1,
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      {/* Title */}
      <div style={{
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        fontSize: 26, fontWeight: 700, color: TEXT_PRIMARY,
        fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: -0.5,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Funnel size={28} color={BLUE} weight="duotone" />
        Token Bucket Algorithm
      </div>

      {/* Main content: Requests | Bucket | Status */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 60,
        opacity: bucketOp, transform: `scale(${bucketScale})`,
      }}>
        {/* Request list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 240, paddingTop: 80 }}>
          {reqPhases.map((req, i) => {
            const op = fadeIn(f, req.start, 12);
            const x = interpolate(f, [req.start, req.start + 12], [30, 0], { ...clamp, easing: easeOutCubic });
            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${x}px)`,
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10,
                background: req.status === "rejected" ? `${RED}10` : `${BLUE}08`,
                border: `1px solid ${req.status === "rejected" ? RED : BLUE}20`,
              }}>
                {req.status === "ok" ? (
                  <CheckCircle size={18} color={GREEN} weight="duotone" />
                ) : (
                  <XCircle size={18} color={RED} weight="duotone" />
                )}
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: req.status === "rejected" ? RED : TEXT_SECONDARY, fontWeight: 500 }}>
                  {req.label}
                </span>
                {req.status === "rejected" && (
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: RED, fontWeight: 700, marginLeft: "auto" }}>
                    429
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bucket */}
        <Bucket
          fillPercent={fillPercent}
          color={BLUE}
          tokenCount={tokenCount}
          showDrip={showDrip}
          rejected={isRejected}
          frame={frame}
        />

        {/* Right side info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 320, paddingTop: 80 }}>
          {/* How it works */}
          {f > 120 && (
            <div style={{
              opacity: fadeIn(f, 120), transform: `translateY(${slideUp(f, 120)}px)`,
              padding: "16px 20px", borderRadius: 12,
              background: `${BLUE}08`, border: `1px solid ${BLUE}15`,
            }}>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>
                How It Works
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { text: "Bucket holds 100 tokens", icon: "bucket", start: 120 },
                  { text: "10 new tokens drip in / sec", icon: "drip", start: 180 },
                  { text: "Each request costs 1 token", icon: "req", start: 240 },
                ].map((item, i) => (
                  <div key={i} style={{
                    opacity: fadeIn(f, item.start),
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: TEXT_SECONDARY }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Burst OK */}
          {f > 420 && (
            <div style={{
              opacity: fadeIn(f, 420), transform: `translateY(${slideUp(f, 420)}px)`,
              padding: "16px 20px", borderRadius: 12,
              background: `${GREEN}08`, border: `1px solid ${GREEN}15`,
            }}>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: GREEN, marginBottom: 8 }}>
                Burst Traffic? No Problem.
              </div>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: TEXT_SECONDARY }}>
                Send 100 requests instantly — empties the bucket. Then limited to 10/sec as tokens refill.
              </span>
            </div>
          )}

          {/* Stripe example */}
          {f > 510 && (
            <div style={{
              opacity: stripeOp, transform: `translateY(${stripeY}px)`,
              padding: "16px 20px", borderRadius: 12,
              background: `${PURPLE}08`, border: `1px solid ${PURPLE}15`,
            }}>
              <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, fontWeight: 600, color: PURPLE, marginBottom: 10, letterSpacing: 0.5 }}>
                Stripe's Rate Limits
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 1 }}>Test Mode</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 20, fontWeight: 700, color: AMBER }}>100/s</span>
                </div>
                <div style={{ width: 1, background: `${BORDER}` }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 1 }}>Live Mode</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 20, fontWeight: 700, color: GREEN }}>10,000/s</span>
                </div>
              </div>
            </div>
          )}

          {/* Retry-After */}
          {f > 570 && (
            <div style={{
              opacity: retryOp, transform: `translateY(${retryY}px)`,
              padding: "12px 16px", borderRadius: 10,
              background: `${AMBER}08`, border: `1px solid ${AMBER}15`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Timer size={20} color={AMBER} weight="duotone" />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, color: AMBER, fontWeight: 600 }}>
                Retry-After: 2
              </span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: TEXT_DIM }}>
                seconds to wait
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: SLIDING WINDOW + REDIS
// ═══════════════════════════════════════════════════════════
const Scene3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = frame - 930;

  const titleOp = fadeIn(f, 0);
  const titleY = slideUp(f, 0);

  // Window visualization
  const windowOp = fadeIn(f, 60);
  const windowScale = spring({ frame: Math.max(0, f - 60), fps, config: { damping: 22, stiffness: 180 } });

  // Timeline bar with 60 second marks
  const timelineWidth = 800;
  const windowWidth = timelineWidth * 0.4; // 60s out of ~150s visible

  // Window slides right
  const windowSlide = interpolate(f, [90, 200], [0, timelineWidth - windowWidth], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // Request count fills up
  const reqInWindow = Math.round(interpolate(f, [90, 180], [0, 600], { ...clamp }));
  const isBlocked = reqInWindow >= 600;

  // Blocked flash
  const blockedOp = isBlocked ? fadeIn(f, 180) : 0;

  // Comparison panel
  const compOp = fadeIn(f, 210);
  const compY = slideUp(f, 210);

  // Redis section
  const redisOp = fadeIn(f, 270);
  const redisY = slideUp(f, 270);

  // Redis commands appear one by one
  const cmd1Op = fadeIn(f, 300);
  const cmd2Op = fadeIn(f, 330);
  const cmd3Op = fadeIn(f, 360);

  return (
    <div style={{
      opacity: f < 0 ? 0 : 1,
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40,
    }}>
      {/* Title */}
      <div style={{
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        fontSize: 26, fontWeight: 700, color: TEXT_PRIMARY,
        fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: -0.5,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Timer size={28} color={CYAN} weight="duotone" />
        Sliding Window Approach
      </div>

      {/* Window visualization */}
      <div style={{
        opacity: windowOp, transform: `scale(${windowScale})`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        {/* Timeline bar */}
        <div style={{ position: "relative", width: timelineWidth, height: 80 }}>
          {/* Background bar */}
          <div style={{
            position: "absolute", top: 20, left: 0, right: 0, height: 40,
            background: `${BORDER}`, borderRadius: 10, overflow: "hidden",
          }}>
            {/* Filled portion showing requests */}
            <div style={{
              position: "absolute", top: 0, left: windowSlide, width: windowWidth, height: "100%",
              background: isBlocked ? `${RED}30` : `${CYAN}20`,
              borderRadius: 10,
              border: `2px solid ${isBlocked ? RED : CYAN}40`,
              boxShadow: `0 0 15px ${isBlocked ? RED : CYAN}20`,
            }} />
          </div>

          {/* Time labels */}
          {[0, 15, 30, 45, 60, 75, 90].map((sec, i) => (
            <div key={i} style={{
              position: "absolute", top: 66, left: `${(i / 6) * 100}%`,
              transform: "translateX(-50%)",
              fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, fontWeight: 500,
            }}>
              {sec}s
            </div>
          ))}

          {/* Window label */}
          <div style={{
            position: "absolute", top: -8,
            left: windowSlide + windowWidth / 2,
            transform: "translateX(-50%)",
            fontFamily: "'SF Mono', monospace", fontSize: 12, color: CYAN, fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            60-second window
          </div>
        </div>

        {/* Request counter */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: "'SF Mono', monospace", fontSize: 40, fontWeight: 700,
            color: isBlocked ? RED : CYAN,
            textShadow: `0 0 20px ${isBlocked ? RED : CYAN}30`,
            letterSpacing: -1,
          }}>
            {reqInWindow}
          </span>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, color: TEXT_DIM, fontWeight: 600 }}>
            / 600 requests in window
          </span>
          {isBlocked && (
            <div style={{
              opacity: blockedOp,
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 8,
              background: `${RED}15`, border: `1px solid ${RED}30`,
              marginLeft: 16,
            }}>
              <Warning size={18} color={RED} weight="duotone" />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, color: RED, fontWeight: 700 }}>
                BLOCKED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison: No bursting, but predictable */}
      <div style={{
        opacity: compOp, transform: `translateY(${compY}px)`,
        display: "flex", gap: 40, alignItems: "stretch",
      }}>
        <div style={{
          padding: "16px 24px", borderRadius: 12,
          background: `${BLUE}08`, border: `1px solid ${BLUE}15`,
          display: "flex", flexDirection: "column", gap: 6, width: 260,
        }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: BLUE }}>
            Token Bucket
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: TEXT_SECONDARY }}>
            Allows burst traffic, flexible
          </span>
        </div>
        <div style={{
          padding: "16px 24px", borderRadius: 12,
          background: `${CYAN}08`, border: `1px solid ${CYAN}15`,
          display: "flex", flexDirection: "column", gap: 6, width: 260,
        }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: CYAN }}>
            Sliding Window
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: TEXT_SECONDARY }}>
            No bursting, but predictable
          </span>
        </div>
      </div>

      {/* Redis section */}
      <div style={{
        opacity: redisOp, transform: `translateY(${redisY}px)`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Database size={24} color={RED} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${RED}60)` }} />
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>
            Redis — Perfect for This
          </span>
        </div>

        {/* Commands */}
        <div style={{
          display: "flex", gap: 20,
        }}>
          {[
            { cmd: "INCR", desc: "rate:user:123", op: cmd1Op, color: GREEN },
            { cmd: "EXPIRE", desc: "60 seconds", op: cmd2Op, color: AMBER },
          ].map((item, i) => (
            <div key={i} style={{
              opacity: item.op,
              padding: "14px 20px", borderRadius: 10,
              background: `${item.color}08`, border: `1px solid ${item.color}15`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: item.color }}>
                {item.cmd}
              </span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, color: TEXT_DIM }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Performance note */}
        <div style={{
          opacity: cmd3Op,
          display: "flex", gap: 24, alignItems: "center",
        }}>
          {[
            { label: "2 commands", color: CYAN },
            { label: "Sub-millisecond", color: GREEN },
            { label: "Millions of keys", color: PURPLE },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: TEXT_SECONDARY, fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TokenBucketRateLimiting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene visibility
  const scene1Visible = frame < 330;
  const scene2Visible = frame >= 270 && frame < 960;
  const scene3Visible = frame >= 900;

  return (
    <div style={{
      width: 1920, height: 1080,
      padding: 80,
      background: BG,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      overflow: "hidden",
    }}>
      {scene1Visible && <Scene1 frame={frame} fps={fps} />}
      {scene2Visible && !scene1Visible && <Scene2 frame={frame} fps={fps} />}
      {scene3Visible && !scene2Visible && <Scene3 frame={frame} fps={fps} />}
    </div>
  );
};

export default Generated_TokenBucketRateLimiting;
