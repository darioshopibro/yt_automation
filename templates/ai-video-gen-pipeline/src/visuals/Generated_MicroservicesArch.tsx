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

const C = {
  gw: "#f59e0b",
  user: "#3b82f6",
  order: "#22c55e",
  pay: "#a855f7",
  queue: "#ef4444",
  mesh: "#06b6d4",
};

/* ── anim helpers ───────────────────────────────────────────── */

const fi = (frame: number, s: number, d = 15) => ({
  o: interpolate(frame, [s, s + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
  y: interpolate(frame, [s, s + d], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
});

const prog = (frame: number, s: number, d = 20) =>
  interpolate(frame, [s, s + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/* ── MAIN ───────────────────────────────────────────────────── */

const Generated_MicroservicesArch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /*
   * CONCEPT: Vertical layered architecture that builds top-down.
   * A glowing REQUEST DOT travels the path once built.
   *
   * TIMELINE (~300f = 10s):
   *   0-20    Title
   *   15-40   LAYER 1 — API Gateway (wide bar across top) + counter
   *   35-50   Vertical pipe draws down from gateway
   *   45-90   LAYER 2 — 3 services appear staggered + container borders
   *   80-110  LAYER 3 — Queue bus (horizontal bar between services)
   *   100-150 Vertical pipes draw from services to DBs
   *   110-155 LAYER 4 — 3 databases appear staggered
   *   145-170 Mesh border wraps layers 2-4
   *   160+    REQUEST DOT travels: gateway → service → queue → service → db
   */

  // Title
  const t = fi(frame, 0);

  // Gateway
  const gw = fi(frame, 15);
  const gwScale = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 20, stiffness: 180 } });
  const counterProg = prog(frame, 20, 40);

  // Pipe from gateway
  const pipe1 = prog(frame, 35, 15);

  // Services
  const svc = [fi(frame, 45), fi(frame, 55), fi(frame, 65)];
  const svcScale = [
    spring({ frame: Math.max(0, frame - 45), fps, config: { damping: 22, stiffness: 200 } }),
    spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 22, stiffness: 200 } }),
    spring({ frame: Math.max(0, frame - 65), fps, config: { damping: 22, stiffness: 200 } }),
  ];

  // Queue bus
  const qb = fi(frame, 80);
  const qbWidth = prog(frame, 82, 25);

  // Pipes from services to DBs
  const pipe2 = prog(frame, 100, 18);

  // Databases
  const db = [fi(frame, 110), fi(frame, 120), fi(frame, 130)];

  // Mesh
  const meshOp = prog(frame, 145, 20);
  const meshLbl = fi(frame, 150);

  // REQUEST DOT journey (starts at frame 165)
  const dotStart = 165;
  const dotPhase = interpolate(frame, [dotStart, dotStart + 120], [0, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Which component is "active" (glowing) based on dot position
  const isGwActive = dotPhase >= 0.2 && dotPhase < 1;
  const isSvc1Active = dotPhase >= 1 && dotPhase < 2;
  const isQueueActive = dotPhase >= 2 && dotPhase < 3;
  const isSvc2Active = dotPhase >= 3 && dotPhase < 4;
  const isDb2Active = dotPhase >= 4 && dotPhase <= 5;

  const activeGlow = (active: boolean, color: string) =>
    active ? `0 0 25px ${color}50, 0 0 50px ${color}20` : `0 0 12px ${color}10`;

  const activeBorder = (active: boolean, color: string) =>
    active ? `2px solid ${color}60` : `1px solid ${color}20`;

  // Icons
  const GwIcon = getIcon("ShieldCheck");
  const QueueIcon = getIcon("Queue");
  const MeshIcon = getIcon("Graph");

  const services = [
    { label: "User Service", icon: "User", color: C.user, sub: "PostgreSQL" },
    { label: "Order Service", icon: "ShoppingCart", color: C.order, sub: "MongoDB" },
    { label: "Payment Service", icon: "CreditCard", color: C.pay, sub: "Ledger DB" },
  ];

  const databases = [
    { label: "PostgreSQL", color: C.user },
    { label: "MongoDB", color: C.order },
    { label: "Ledger DB", color: C.pay },
  ];

  const DbIcon = getIcon("Database");

  // Dot Y position mapped to phases
  const dotY = interpolate(
    dotPhase,
    [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    [0,  60, 130, 180, 230, 260, 290, 340, 400, 450, 500],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Dot X position (shifts to follow path)
  const dotX = interpolate(
    dotPhase,
    [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5],
    [0, -280, -280, 0, 0, 280, 280, 280, 280],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const dotVisible = frame >= dotStart ? 1 : 0;
  const dotPulse = interpolate(
    frame % 10,
    [0, 5, 10],
    [0.8, 1, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        padding: "60px 100px",
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── TITLE ─────────────────────────────────── */}
      <div
        style={{
          opacity: t.o,
          transform: `translateY(${t.y}px)`,
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: -0.5,
          marginBottom: 36,
        }}
      >
        Modern Microservices Architecture
      </div>

      {/* ── LAYER 1: API GATEWAY (wide bar) ───────── */}
      <div
        style={{
          opacity: gw.o,
          transform: `translateY(${gw.y}px) scaleX(${gwScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "20px 60px",
          borderRadius: 12,
          background: `${C.gw}0c`,
          border: activeBorder(isGwActive, C.gw),
          boxShadow: activeGlow(isGwActive, C.gw),
          width: "85%",
          transition: "none",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${C.gw}25, ${C.gw}08)`,
            border: `1.5px solid ${C.gw}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${C.gw}20`,
            flexShrink: 0,
          }}
        >
          <GwIcon
            size={28}
            color={C.gw}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${C.gw}60)` }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "#e2e8f0", fontSize: 17, fontWeight: 700 }}>
            API Gateway
          </span>
          <span
            style={{
              color: "#94a3b8",
              fontSize: 11,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            Authentication · Rate Limiting
          </span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              color: C.gw,
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -1,
              textShadow: `0 0 20px ${C.gw}40`,
            }}
          >
            {Math.round(50000 * counterProg).toLocaleString()}
          </span>
          <span
            style={{
              color: `${C.gw}90`,
              fontSize: 13,
              fontFamily: "'SF Mono', monospace",
              marginLeft: 4,
            }}
          >
            req/s
          </span>
        </div>
      </div>

      {/* ── VERTICAL PIPE: gateway → services ──────── */}
      <div
        style={{
          width: 2,
          height: 40,
          background: `linear-gradient(${C.gw}60, ${C.user}30)`,
          opacity: pipe1,
          margin: "4px 0",
        }}
      />

      {/* ── LAYER 2: 3 SERVICES ───────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          width: "85%",
          position: "relative",
        }}
      >
        {/* Mesh border (wraps services + queue + dbs) */}
        <div
          style={{
            position: "absolute",
            inset: "-12px -20px -430px -20px",
            borderRadius: 16,
            border: `2px dashed ${C.mesh}${Math.round(meshOp * 45)
              .toString(16)
              .padStart(2, "0")}`,
            boxShadow: `0 0 30px ${C.mesh}${Math.round(meshOp * 12)
              .toString(16)
              .padStart(2, "0")}`,
            pointerEvents: "none" as const,
          }}
        />
        {/* Mesh label */}
        <div
          style={{
            position: "absolute",
            top: -32,
            right: 0,
            opacity: meshLbl.o,
            transform: `translateY(${meshLbl.y}px)`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 2,
          }}
        >
          <MeshIcon size={14} color={C.mesh} weight="duotone" />
          <span
            style={{
              color: C.mesh,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
            }}
          >
            Istio Service Mesh — retries · circuit breaking
          </span>
        </div>

        {services.map((s, i) => {
          const SvcIcon = getIcon(s.icon);
          const isActive = i === 0 ? isSvc1Active : i === 2 ? isSvc2Active : false;
          return (
            <div
              key={s.label}
              style={{
                opacity: svc[i].o,
                transform: `translateY(${svc[i].y}px) scale(${svcScale[i]})`,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "22px 16px",
                borderRadius: 12,
                background: `${s.color}0a`,
                border: activeBorder(isActive, s.color),
                boxShadow: activeGlow(isActive, s.color),
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`,
                  border: `1.5px solid ${s.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 15px ${s.color}15`,
                }}
              >
                <SvcIcon
                  size={24}
                  color={s.color}
                  weight="duotone"
                  style={{ filter: `drop-shadow(0 0 8px ${s.color}60)` }}
                />
              </div>
              <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>
                {s.label}
              </span>
              <span
                style={{
                  color: "#64748b",
                  fontSize: 10,
                  fontFamily: "'SF Mono', monospace",
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: `${s.color}08`,
                  border: `1px solid ${s.color}12`,
                }}
              >
                Container
              </span>
            </div>
          );
        })}
      </div>

      {/* ── LAYER 3: QUEUE BUS ────────────────────── */}
      <div
        style={{
          opacity: qb.o,
          transform: `translateY(${qb.y}px)`,
          width: `${85 * qbWidth}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "14px 32px",
          borderRadius: 10,
          background: `${C.queue}08`,
          border: activeBorder(isQueueActive, C.queue),
          boxShadow: activeGlow(isQueueActive, C.queue),
          margin: "16px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* animated flowing dots */}
        {[0, 1, 2, 3, 4].map((i) => {
          const elapsed = Math.max(0, frame - 90 - i * 8);
          const tx = (elapsed % 50) / 50;
          const vis = frame >= 90 + i * 8 ? 1 : 0;
          const pulse = interpolate(tx, [0, 0.5, 1], [0.2, 0.8, 0.2], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: C.queue,
                boxShadow: `0 0 6px ${C.queue}80`,
                opacity: vis * pulse,
                left: `${tx * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
        <QueueIcon size={20} color={C.queue} weight="duotone" />
        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
          RabbitMQ
        </span>
        <span
          style={{
            color: "#64748b",
            fontSize: 10,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          Async Message Queue
        </span>
      </div>

      {/* ── VERTICAL PIPES: services → databases ──── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          width: "85%",
        }}
      >
        {databases.map((d, i) => (
          <div
            key={d.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* pipe */}
            <div
              style={{
                width: 2,
                height: 32,
                background: `${d.color}40`,
                opacity: pipe2,
                marginBottom: 4,
              }}
            />
            {/* db chip */}
            <div
              style={{
                opacity: db[i].o,
                transform: `translateY(${db[i].y}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "16px 20px",
                borderRadius: 10,
                background: `${d.color}06`,
                border: activeBorder(i === 1 && isDb2Active, d.color),
                boxShadow: activeGlow(i === 1 && isDb2Active, d.color),
                width: "100%",
              }}
            >
              <DbIcon
                size={24}
                color={d.color}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 6px ${d.color}40)` }}
              />
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {d.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── REQUEST DOT (travels the system) ──────── */}
      {dotVisible > 0 && (
        <div
          style={{
            position: "absolute",
            top: 150,
            left: "50%",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: `0 0 20px #fff80, 0 0 40px ${C.gw}60`,
            opacity: dotPulse * dotVisible,
            transform: `translate(calc(-50% + ${dotX}px), ${dotY}px)`,
            zIndex: 10,
            pointerEvents: "none" as const,
          }}
        />
      )}
    </div>
  );
};

export default Generated_MicroservicesArch;
