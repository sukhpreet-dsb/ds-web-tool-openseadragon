import { HandGrab, MousePointer2, Pencil, Plus, Slash, Type, Triangle, Circle, Square, ArrowUp } from 'lucide-react';
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
    id: 'arrow',
    name: 'Arrow',
    icon: ArrowUp,
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
    id: 'pits',
    name: 'pits',
    icon: Plus,
  },
  {
    id: 'triangle',
    name: 'Triangle - R1',
    icon: Triangle,
  },
  {
    id: 'gp',
    name: 'GP',
    icon: Circle,
  },
  {
    id: 'junction',
    name: 'Junction Point',
    icon: Square,
  }
];

export const DEFAULT_TOOL: ToolType = 'hand';