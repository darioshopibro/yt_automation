import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { 
  VideoCamera, Database, Cpu, Stack, Cube, Sparkle, GridFour, Eye,
  Brain, Lightning, CloudArrowUp, Terminal, Code, Gear, Shield, User
} from "@phosphor-icons/react";

const IconTest: React.FC = () => {
  const icons = [
    { Icon: VideoCamera, label: "Video" },
    { Icon: Database, label: "Database" },
    { Icon: Cpu, label: "CPU" },
    { Icon: Stack, label: "Layers" },
    { Icon: Cube, label: "Cube" },
    { Icon: Sparkle, label: "Sparkle" },
    { Icon: GridFour, label: "Grid" },
    { Icon: Eye, label: "Eye" },
    { Icon: Brain, label: "Brain" },
    { Icon: Lightning, label: "Zap" },
    { Icon: CloudArrowUp, label: "Cloud" },
    { Icon: Terminal, label: "Terminal" },
    { Icon: Code, label: "Code" },
    { Icon: Gear, label: "Settings" },
    { Icon: Shield, label: "Shield" },
    { Icon: User, label: "User" },
  ];

  return (
    <div style={{ 
      backgroundColor: "#0f0f1a", 
      width: "100%", 
      height: "100%", 
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: 30,
      padding: 60
    }}>
      {icons.map(({ Icon, label }) => (
        <div key={label} style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          backgroundColor: "#1a1a2e",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #333",
          minWidth: 90
        }}>
          <Icon size={48} color="#00ff88" weight="duotone" />
          <span style={{ color: "#888", marginTop: 10, fontSize: 12 }}>{label}</span>
        </div>
      ))}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="IconTest"
      component={IconTest}
      durationInFrames={60}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

registerRoot(RemotionRoot);
