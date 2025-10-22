import { HandGrab, Minus, MousePointer2, Type, GitBranch, Plus, Home, Castle } from 'lucide-react';
import type { ToolType } from '../store/toolStore';

export interface ToolConfig {
  id: ToolType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TOOLS: ToolConfig[] = [
  {
    id: 'select',
    name: 'Select',
    icon: MousePointer2,
  },
  {
    id: 'hand',
    name: 'Hand',
    icon: HandGrab,
  },
  {
    id: 'line',
    name: 'Line',
    icon: Slash,
  },
  {
    id: 'freehand',
    name: 'Freehand Line',
    icon: Pencil,
  },
  {
    id: 'text',
    name: 'Text',
    icon: Type,
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