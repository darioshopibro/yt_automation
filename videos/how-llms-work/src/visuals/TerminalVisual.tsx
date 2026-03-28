import React from "react";

/**
 * TERMINAL VISUAL
 * Config: { commands: [{ prompt: "$", command: "npm install", output?: "added 150 packages" }] }
 */

interface TerminalCommand {
  prompt?: string;
  command: string;
  output?: string;
}

interface Props {
  commands: TerminalCommand[];
  title?: string;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const TerminalVisual: React.FC<Props> = ({
  commands, title = "Terminal", accentColor = "#22c55e", progress = 1, shapeMode = "square",
}) => {
  const isWide = shapeMode === "wide";
  const displayCommands = isWide ? commands.slice(0, 3) : commands;
  const totalItems = displayCommands.reduce((n, c) => n + 1 + (c.output ? 1 : 0), 0);
  const visibleItems = Math.ceil(totalItems * progress);

  let itemIdx = 0;
  const visibleCommands: { cmd: TerminalCommand; showCmd: boolean; showOutput: boolean }[] = [];
  for (const cmd of displayCommands) {
    const showCmd = itemIdx < visibleItems;
    itemIdx++;
    const showOutput = cmd.output ? itemIdx < visibleItems : false;
    if (cmd.output) itemIdx++;
    visibleCommands.push({ cmd, showCmd, showOutput });
  }

  return (
    <div style={{
      background: "#0a0a14", borderRadius: 12, overflow: "hidden",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: isWide ? 12 : 13, lineHeight: 1.7,
      width: "100%", minWidth: isWide ? 600 : undefined, border: "1px solid #1a1a2e",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        background: "#08080f", borderBottom: "1px solid #1a1a2e",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{title}</span>
      </div>
      {/* Commands — typing animation */}
      <div style={{ padding: "14px 18px" }}>
        {(() => {
          // Calculate total chars across all commands for typing
          const allText = displayCommands.map(c => c.command + (c.output ? "\n" + c.output : "")).join("\n");
          const totalChars = allText.length;
          const charsToShow = Math.floor(totalChars * progress);
          let charCount = 0;

          return displayCommands.map((cmd, i) => {
            const cmdStart = charCount;
            const cmdChars = Math.max(0, Math.min(cmd.command.length, charsToShow - cmdStart));
            charCount += cmd.command.length + 1;

            const outputStart = charCount;
            const outputChars = cmd.output ? Math.max(0, Math.min(cmd.output.length, charsToShow - outputStart)) : 0;
            if (cmd.output) charCount += cmd.output.length + 1;

            if (cmdChars <= 0 && charsToShow < cmdStart) return null;

            const isTypingCmd = cmdChars > 0 && cmdChars < cmd.command.length;
            const visibleCmd = cmd.command.substring(0, cmdChars);
            const visibleOutput = cmd.output ? cmd.output.substring(0, outputChars) : "";

            return (
              <React.Fragment key={i}>
                {cmdChars > 0 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: accentColor, fontWeight: 700 }}>{cmd.prompt || "$"}</span>
                    <span style={{ color: "#f8fafc" }}>
                      {visibleCmd}
                      {isTypingCmd && (
                        <span style={{ display: "inline-block", width: 7, height: 14, background: accentColor, opacity: 0.8, marginLeft: 1, verticalAlign: "middle" }} />
                      )}
                    </span>
                  </div>
                )}
                {outputChars > 0 && cmd.output && (
                  <div style={{ color: "#94a3b8", marginBottom: 12, paddingLeft: 20, fontSize: 12 }}>
                    {visibleOutput.split("\n").map((line, li) => (
                      <div key={li}>{line}</div>
                ))}
              </div>
            )}
          </React.Fragment>
            );
          });
        })()}
        {/* Blinking cursor */}
        {progress >= 1 && (
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: accentColor, fontWeight: 700 }}>$</span>
            <span style={{
              width: 8, height: 16, background: accentColor, opacity: 0.7,
              display: "inline-block",
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalVisual;
