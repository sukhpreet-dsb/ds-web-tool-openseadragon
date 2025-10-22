import { HandGrab, Minus, MousePointer2, Type, GitBranch, Plus, Home, Castle } from 'lucide-react';
import type { ToolType } from '../store/toolStore';

export interface ToolConfig {
  id: ToolType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  shortcut?: string;
}

export const TOOLS: ToolConfig[] = [
  {
    id: 'select',
    name: 'Select',
    icon: MousePointer2,
    description: 'Select and move objects',
    shortcut: 'V',
  },
  {
    id: 'hand',
    name: 'Hand',
    icon: HandGrab,
    description: 'Navigate the map',
    shortcut: 'H',
  },
  {
    id: 'line',
    name: 'Line',
    icon: GitBranch,
    description: 'Click to start, click again to finish',
    shortcut: 'L',
  },
  {
    id: 'freehand',
    name: 'Freehand',
    icon: Minus,
    description: 'Draw freehand lines',
    shortcut: 'F',
  },
  {
    id: 'text',
    name: 'Text',
    icon: Type,
    description: 'Add text annotations',
    shortcut: 'T',
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Plus,
    description: 'Add plus marker',
    shortcut: 'P',
  },
  {
    id: 'temple',
    name: 'Temple',
    icon: Home,
    description: 'Add temple marker',
    shortcut: 'M',
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: Castle,
    description: 'Add tower marker',
    shortcut: 'W',
  },
];

export const DEFAULT_TOOL: ToolType = 'hand';