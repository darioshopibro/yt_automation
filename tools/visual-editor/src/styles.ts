import React from 'react';

// === Glass morphism style matching DynamicPipeline ===
export function glassStyle(borderColor: string, glowColor: string): React.CSSProperties {
  return {
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    border: `1.5px solid ${borderColor}60`,
    boxShadow: `
      0 0 60px ${glowColor},
      0 8px 40px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    borderRadius: 20,
  };
}

// === Sizing constants matching DynamicPipeline/dimensions.ts ===
export const ICON_SIZE = 56;
export const NODE_GAP = 8;
export const LABEL_HEIGHT = 14;
export const NODE_HEIGHT = ICON_SIZE + NODE_GAP + LABEL_HEIGHT; // 78
export const NODE_WIDTH = 70;

export const STACK_GAP = 20;
export const STACKED_HEIGHT = NODE_HEIGHT * 2 + STACK_GAP; // 176

export const ITEM_WIDTH = 85;
export const ITEM_HEIGHT = 100;
export const GAP = 20;
export const PADDING_X = 48;
export const PADDING_Y = 36;
export const HEADER_HEIGHT = 50;
export const MIN_WIDTH = 200;
export const MIN_HEIGHT = 150;
export const SECTION_GAP = 24;

// Grid column logic
export function getGridCols(count: number): number {
  if (count <= 2) return count;
  if (count === 3) return 3;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

// Container size for grid layout
export function getContainerSize(itemCount: number) {
  const cols = getGridCols(itemCount);
  const rows = Math.ceil(itemCount / cols);
  const contentWidth = (cols * ITEM_WIDTH) + ((cols - 1) * GAP);
  const contentHeight = (rows * ITEM_HEIGHT) + ((rows - 1) * GAP);
  const width = Math.max(MIN_WIDTH, PADDING_X + contentWidth);
  const height = Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + contentHeight);
  return { width, height };
}

// Section box size based on layout type
export function getSectionBoxSize(nodeCount: number, layout?: string) {
  if (layout && layout !== 'grid') {
    const size = getLayoutSize(layout, nodeCount);
    if (size.width > 0) {
      return {
        width: Math.max(MIN_WIDTH, PADDING_X + size.width),
        height: Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + size.height),
      };
    }
  }
  return getContainerSize(nodeCount);
}

// Layout size calculations (matching dimensions.ts)
function getLayoutSize(layout: string, nodeCount: number) {
  const ARROW_W = 40;
  const CONN_GAP = 20;

  const VS_W = 50;
  const PLUS_W = 30;
  const EQUALS_W = 30;

  switch (layout) {
    case 'flow':
    case 'arrow':
      return {
        width: (nodeCount * NODE_WIDTH) + ((nodeCount - 1) * (CONN_GAP * 2 + ARROW_W)),
        height: NODE_HEIGHT,
      };
    case 'vs':
      return {
        width: (nodeCount * NODE_WIDTH) + ((nodeCount - 1) * (CONN_GAP * 2 + VS_W)),
        height: NODE_HEIGHT,
      };
    case 'bidirectional':
      return {
        width: (nodeCount * NODE_WIDTH) + ((nodeCount - 1) * (CONN_GAP * 2 + ARROW_W)),
        height: NODE_HEIGHT,
      };
    case 'combine': {
      const inputs = Math.max(1, nodeCount - 1);
      return {
        width: (nodeCount * NODE_WIDTH) + ((inputs - 1) * (CONN_GAP * 2 + PLUS_W)) + (CONN_GAP * 2 + EQUALS_W),
        height: NODE_HEIGHT,
      };
    }
    case 'negation':
    case 'filter':
      return { width: NODE_WIDTH * 2 + CONN_GAP * 2 + ARROW_W, height: NODE_HEIGHT };
    case 'if-else':
    case 'merge':
      return { width: NODE_WIDTH + CONN_GAP * 2 + ARROW_W + NODE_WIDTH, height: STACKED_HEIGHT };
    default:
      return { width: 0, height: 0 };
  }
}

// Sticky dimensions from sections
export function getStickyDimensions(sections: { nodes: { length: number }; layout?: string }[]) {
  const sectionCount = sections.length;
  const cols = sectionCount <= 2 ? sectionCount : sectionCount <= 4 ? 2 : 3;
  const rows = Math.ceil(sectionCount / cols);
  const gap = SECTION_GAP;
  const paddingX = 48;
  const paddingY = 24;

  const boxSizes = sections.map(s => getSectionBoxSize(s.nodes.length, s.layout));
  const maxBoxW = Math.max(...boxSizes.map(s => s.width));
  const maxBoxH = Math.max(...boxSizes.map(s => s.height));

  const width = paddingX + (cols * maxBoxW) + ((cols - 1) * gap);
  const height = (paddingY * 2) + (rows * maxBoxH) + ((rows - 1) * gap);

  return { width, height, cols, rows, boxW: maxBoxW, boxH: maxBoxH };
}

// Clockwise grid positioning (matching DynamicPipeline)
export function getClockwiseGridPos(index: number, total: number, cols: number): { row: number; col: number } {
  if (total <= 2) return { row: 0, col: index };
  if (total === 3) {
    const positions = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }];
    return positions[index] || { row: 0, col: 0 };
  }
  if (total === 4) {
    const positions = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 0 }];
    return positions[index] || { row: 0, col: 0 };
  }
  return { row: Math.floor(index / cols), col: index % cols };
}
