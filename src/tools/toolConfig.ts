import { HandGrab, MousePointer2, Pencil, Slash, Type } from 'lucide-react';
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
];

export const DEFAULT_TOOL: ToolType = 'hand';