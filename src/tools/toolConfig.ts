import { ArrowUp, HandGrab, MousePointer2, Pencil, Slash, Type } from 'lucide-react';
import type { ToolType } from '../store/toolStore';
import { TriangleRI } from '@/icons/Triangle';
import { GP } from '@/icons/Gp';
import { Pits } from '@/icons/Pits';
import { JunctionPoint } from '@/icons/JunctionPoint';
import { Tower } from '@/icons/Tower';

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
  // {
  //   id: 'arrow',
  //   name: 'Arrow',
  //   icon: ArrowUp,
  // },
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
    name: 'Pits',
    icon: Pits,
  },
  {
    id: 'triangle',
    name: 'Triangle - R1',
    icon: TriangleRI,
  },
  {
    id: 'gp',
    name: 'GP',
    icon: GP,
  },
  {
    id: 'junction',
    name: 'Junction Point',
    icon: JunctionPoint,
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: Tower,
  }
];

export const DEFAULT_TOOL: ToolType = 'hand';