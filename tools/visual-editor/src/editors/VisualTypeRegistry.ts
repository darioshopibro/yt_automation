// Central registry mapping visualType -> metadata + default data

export const VISUAL_TYPES = [
  'code-block',
  'terminal',
  'list',
  'table',
  'bar-chart',
  'pie-chart',
  'stats',
  'timeline',
  'process-steps',
  'logo-grid',
  'hierarchy',
  'split-screen',
  'kinetic',
  'service-mesh',
] as const;

export type VisualType = typeof VISUAL_TYPES[number];

// ── Data interfaces per visual type ──

export interface CodeBlockData {
  language: string;
  filename?: string;
  code: string;
  highlightLines?: number[];
}

export interface TerminalCommand {
  prompt?: string;
  command: string;
  output?: string;
}
export interface TerminalData {
  title?: string;
  commands: TerminalCommand[];
}

export interface ListData {
  items: string[];
  style?: 'bullet' | 'numbered' | 'checklist';
}

export interface TableData {
  headers: string[];
  rows: string[][];
  highlightCol?: number;
}

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}
export interface BarChartData {
  items: BarChartItem[];
  unit?: string;
  maxValue?: number;
}

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
}
export interface PieChartData {
  items: PieChartItem[];
  donut?: boolean;
}

export interface StatItem {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}
export interface StatsData {
  items: StatItem[];
}

export interface TimelineItem {
  label: string;
  description?: string;
  color?: string;
}
export interface TimelineData {
  items: TimelineItem[];
  direction?: 'horizontal' | 'vertical';
}

export interface ProcessStep {
  label: string;
  description?: string;
  color?: string;
}
export interface ProcessStepsData {
  steps: ProcessStep[];
}

export interface LogoGridItem {
  icon: string;
  label: string;
  color?: string;
}
export interface LogoGridData {
  items: LogoGridItem[];
  cols?: number;
}

export interface TreeNode {
  label: string;
  color?: string;
  children?: TreeNode[];
}
export interface HierarchyData {
  root: TreeNode;
}

export interface PanelSide {
  title: string;
  items: string[];
}
export interface SplitScreenData {
  left: PanelSide;
  right: PanelSide;
  leftColor?: string;
  rightColor?: string;
  dividerLabel?: string;
}

export interface KineticData {
  text: string;
  highlight?: string[];
  style?: 'impact' | 'reveal' | 'stack';
}

export interface MeshNode {
  label: string;
  icon?: string;
  color?: string;
  role?: 'gateway' | 'service' | 'database' | 'queue';
}
export interface MeshConnection {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}
export interface ServiceMeshData {
  nodes: MeshNode[];
  connections: MeshConnection[];
}

// ── Union type ──
export type VisualDataMap = {
  'code-block': CodeBlockData;
  'terminal': TerminalData;
  'list': ListData;
  'table': TableData;
  'bar-chart': BarChartData;
  'pie-chart': PieChartData;
  'stats': StatsData;
  'timeline': TimelineData;
  'process-steps': ProcessStepsData;
  'logo-grid': LogoGridData;
  'hierarchy': HierarchyData;
  'split-screen': SplitScreenData;
  'kinetic': KineticData;
  'service-mesh': ServiceMeshData;
};

// ── Registry entry ──
export interface VisualTypeInfo {
  key: VisualType;
  label: string;
  symbol: string;
  defaultData: VisualDataMap[VisualType];
}

export const VISUAL_REGISTRY: VisualTypeInfo[] = [
  {
    key: 'code-block',
    label: 'Code Block',
    symbol: '</>',
    defaultData: {
      language: 'typescript',
      filename: 'example.ts',
      code: 'const hello = "world";\nconsole.log(hello);',
      highlightLines: [1],
    } as CodeBlockData,
  },
  {
    key: 'terminal',
    label: 'Terminal',
    symbol: '>_',
    defaultData: {
      title: 'Terminal',
      commands: [{ prompt: '$', command: 'echo "Hello"', output: 'Hello' }],
    } as TerminalData,
  },
  {
    key: 'list',
    label: 'List',
    symbol: '\u2261',
    defaultData: {
      items: ['First item', 'Second item', 'Third item'],
      style: 'bullet',
    } as ListData,
  },
  {
    key: 'table',
    label: 'Table',
    symbol: '\u229E',
    defaultData: {
      headers: ['Name', 'Value'],
      rows: [['Row 1', '100'], ['Row 2', '200']],
    } as TableData,
  },
  {
    key: 'bar-chart',
    label: 'Bar Chart',
    symbol: '\u2581\u2583\u2585',
    defaultData: {
      items: [
        { label: 'A', value: 80 },
        { label: 'B', value: 60 },
        { label: 'C', value: 40 },
      ],
      unit: '%',
    } as BarChartData,
  },
  {
    key: 'pie-chart',
    label: 'Pie Chart',
    symbol: '\u25D4',
    defaultData: {
      items: [
        { label: 'Part A', value: 60 },
        { label: 'Part B', value: 40 },
      ],
      donut: true,
    } as PieChartData,
  },
  {
    key: 'stats',
    label: 'Stats',
    symbol: '#',
    defaultData: {
      items: [
        { label: 'Users', value: '10K', subtitle: 'active' },
        { label: 'Revenue', value: '$5M', subtitle: 'annual' },
      ],
    } as StatsData,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    symbol: '\u2500\u25CF\u2500',
    defaultData: {
      items: [
        { label: '2020', description: 'Started' },
        { label: '2023', description: 'Grew' },
        { label: '2025', description: 'Now' },
      ],
      direction: 'horizontal',
    } as TimelineData,
  },
  {
    key: 'process-steps',
    label: 'Process',
    symbol: '1\u21922\u21923',
    defaultData: {
      steps: [
        { label: 'Step 1', description: 'First' },
        { label: 'Step 2', description: 'Second' },
        { label: 'Step 3', description: 'Third' },
      ],
    } as ProcessStepsData,
  },
  {
    key: 'logo-grid',
    label: 'Logo Grid',
    symbol: '\u229A\u229A',
    defaultData: {
      items: [
        { icon: 'Globe', label: 'Web', color: '#3b82f6' },
        { icon: 'Database', label: 'DB', color: '#22c55e' },
      ],
    } as LogoGridData,
  },
  {
    key: 'hierarchy',
    label: 'Hierarchy',
    symbol: '\u2514\u252C',
    defaultData: {
      root: {
        label: 'Root',
        children: [
          { label: 'Child A' },
          { label: 'Child B' },
        ],
      },
    } as HierarchyData,
  },
  {
    key: 'split-screen',
    label: 'Split / VS',
    symbol: '|\u2016|',
    defaultData: {
      left: { title: 'Option A', items: ['Fast', 'Simple'] },
      right: { title: 'Option B', items: ['Powerful', 'Complex'] },
      dividerLabel: 'vs',
    } as SplitScreenData,
  },
  {
    key: 'kinetic',
    label: 'Kinetic Text',
    symbol: 'Aa',
    defaultData: {
      text: 'This is important',
      highlight: ['important'],
      style: 'impact',
    } as KineticData,
  },
  {
    key: 'service-mesh',
    label: 'Service Mesh',
    symbol: '\u25CB\u2500\u25CB',
    defaultData: {
      nodes: [
        { label: 'API', role: 'gateway' as const },
        { label: 'Service', role: 'service' as const },
      ],
      connections: [{ from: 'API', to: 'Service', label: 'REST' }],
    } as ServiceMeshData,
  },
];

export function getVisualInfo(type: string): VisualTypeInfo | undefined {
  return VISUAL_REGISTRY.find(v => v.key === type);
}

export function getDefaultData(type: VisualType): any {
  const info = VISUAL_REGISTRY.find(v => v.key === type);
  return info ? JSON.parse(JSON.stringify(info.defaultData)) : {};
}
