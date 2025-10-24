import * as fabric from 'fabric';

export interface ArrowOptions {
  stroke?: string;
  strokeWidth?: number;
  arrowSize?: number;
  fill?: string;
}

/**
 * Creates an arrow line using fabric.Path (better serialization)
 */
export function createArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: ArrowOptions = {}
): fabric.Path {
  const {
    stroke = 'black',
    strokeWidth = 8,
    arrowSize = 20,
  } = options;

  // Calculate the angle of the line
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Calculate arrow head triangle points for proper filled arrow
  const arrowTipX = x2;
  const arrowTipY = y2;
  const arrowBaseX1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowBaseY1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowBaseX2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowBaseY2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

  // Create the path string for the arrow with filled arrowhead
  // This creates a complete arrow shape that fills properly
  const pathString = `M ${x1} ${y1} L ${arrowTipX} ${arrowTipY} L ${arrowBaseX1} ${arrowBaseY1} M ${arrowTipX} ${arrowTipY} L ${arrowBaseX2} ${arrowBaseY2}`;

  const arrow = new fabric.Path(pathString, {
    stroke,
    strokeWidth,
    fill: '', // No fill for path stroke lines
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    selectable: true,
    evented: true,
  });

  return arrow;
}

/**
 * Creates an arrow with filled arrowhead using fabric.Polygon
 */
export function createFilledArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: ArrowOptions = {}
): fabric.Group {
  const {
    stroke = 'black',
    strokeWidth = 8,
    arrowSize = 20,
    fill = 'black'
  } = options;

  // Calculate the angle of the line
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Calculate arrow head triangle points
  const arrowTipX = x2;
  const arrowTipY = y2;
  const arrowBaseX1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowBaseY1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowBaseX2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowBaseY2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

  // Create the line
  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke,
    strokeWidth,
    strokeLineCap: 'round',
    selectable: false,
    evented: false,
  });

  // Create the arrowhead as a triangle
  const arrowhead = new fabric.Polygon([
    { x: arrowTipX, y: arrowTipY },
    { x: arrowBaseX1, y: arrowBaseY1 },
    { x: arrowBaseX2, y: arrowBaseY2 }
  ], {
    fill,
    stroke,
    strokeWidth,
    selectable: false,
    evented: false,
  });

  // Group line and arrowhead together
  const arrowGroup = new fabric.Group([line, arrowhead], {
    selectable: true,
    evented: true,
  });

  return arrowGroup;
}