/**
 * SHARED DIMENSIONS - koriste se u ExplainerLayout i SectionBox
 *
 * SINGLE NODE:
 * ┌────────────┐
 * │  ICON_SIZE │ 56px
 * ├────────────┤ NODE_GAP = 8px
 * │   LABEL    │ 14px
 * └────────────┘
 *   NODE_HEIGHT = 78px
 *
 * STACKED (za IF/ELSE, MERGE):
 * ┌────────────┐ ← TOP_CENTER = 28px
 * │   NODE 1   │ 78px
 * └────────────┘
 *      gap       STACK_GAP = 20px
 * ┌────────────┐ ← BOTTOM_CENTER = 126px
 * │   NODE 2   │ 78px
 * └────────────┘
 *   STACKED_HEIGHT = 176px
 */

// === NODE DIMENSIONS ===
export const ICON_SIZE = 56;
export const ICON_CENTER = ICON_SIZE / 2; // 28px
export const NODE_GAP = 8;
export const LABEL_HEIGHT = 14;
export const NODE_HEIGHT = ICON_SIZE + NODE_GAP + LABEL_HEIGHT; // 78px
export const NODE_WIDTH = 70; // Approximate width of node with label

// === STACKED NODE DIMENSIONS ===
export const STACK_GAP = 20;
export const STACKED_HEIGHT = NODE_HEIGHT * 2 + STACK_GAP; // 176px
export const STACKED_TOP_CENTER = ICON_CENTER; // 28px
export const STACKED_BOTTOM_CENTER = NODE_HEIGHT + STACK_GAP + ICON_CENTER; // 126px
export const STACKED_MIDDLE = (STACKED_TOP_CENTER + STACKED_BOTTOM_CENTER) / 2; // 77px

// === CONNECTOR DIMENSIONS ===
export const CONNECTOR_GAP = 20; // Gap between node and arrow
export const ARROW_WIDTH = 40; // Width of arrow connector
export const VS_WIDTH = 50; // Width of "vs" symbol
export const PLUS_WIDTH = 30; // Width of "+" symbol
export const EQUALS_WIDTH = 30; // Width of "=" symbol

// === LAYOUT SIZES (width, height) ===
// Used by getSectionBoxSize to calculate container size

export const getLayoutSize = (layout: string, nodeCount: number): { width: number; height: number } => {
  switch (layout) {
    case "flow":
      // A → B → C (horizontal)
      // width = nodes + arrows between
      const flowWidth = (nodeCount * NODE_WIDTH) + ((nodeCount - 1) * (CONNECTOR_GAP * 2 + ARROW_WIDTH));
      return { width: flowWidth, height: NODE_HEIGHT };

    case "arrow":
      // A → B (simple)
      return { width: NODE_WIDTH * 2 + CONNECTOR_GAP * 2 + ARROW_WIDTH, height: NODE_HEIGHT };

    case "vs":
      // A vs B
      return { width: NODE_WIDTH * 2 + VS_WIDTH + CONNECTOR_GAP * 2, height: NODE_HEIGHT };

    case "combine":
      // A + B = C
      return { width: NODE_WIDTH * 3 + PLUS_WIDTH + EQUALS_WIDTH + CONNECTOR_GAP * 4, height: NODE_HEIGHT };

    case "negation":
      // ✗A → B
      return { width: NODE_WIDTH * 2 + CONNECTOR_GAP * 2 + ARROW_WIDTH, height: NODE_HEIGHT };

    case "if-else":
      // A → [B, C] (split)
      // Input node + arrow + stacked output
      return { width: NODE_WIDTH + CONNECTOR_GAP * 2 + ARROW_WIDTH + NODE_WIDTH, height: STACKED_HEIGHT };

    case "merge":
      // [A, B] → C (join)
      // Stacked input + arrow + output node
      return { width: NODE_WIDTH + CONNECTOR_GAP * 2 + ARROW_WIDTH + NODE_WIDTH, height: STACKED_HEIGHT };

    case "bidirectional":
      // A ↔ B
      return { width: NODE_WIDTH * 2 + CONNECTOR_GAP * 2 + ARROW_WIDTH, height: NODE_HEIGHT };

    case "filter":
      // A ▷ B
      return { width: NODE_WIDTH * 2 + CONNECTOR_GAP * 2 + ARROW_WIDTH, height: NODE_HEIGHT };

    default:
      // grid fallback - use old logic
      return { width: 0, height: 0 }; // 0 means use grid sizing
  }
};

// === COLORS ===
export const layoutColors = {
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  line: "#475569",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};

export type LayoutColorKey = keyof typeof layoutColors;
