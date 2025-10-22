import { Castle, HandGrab, Home, MousePointer2, Pencil, Plus, Slash, Type } from 'lucide-react';
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
  },
  {
    id: 'temple',
    name: 'Temple',
    icon: Home,
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: Castle,
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Plus,
  },
  {
    id: 'temple',
    name: 'Temple',
    icon: Home,
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: Castle,
  },
];

export const DEFAULT_TOOL: ToolType = 'hand';