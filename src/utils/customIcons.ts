import * as fabric from 'fabric';

export interface CustomIconOptions {
  left: number;
  top: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Creates a pits icon for pits with high stroke width
 */
export function createPlusIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = 'red',
    strokeWidth = 6
  } = options;

  const halfSize = size / 2;
  const lineLength = size  - 30;
  const halfLineLength = lineLength / 2;

  // Create horizontal line with high stroke
  const horizontalLine = new fabric.Line(
    [halfSize - halfLineLength, halfSize, halfSize + halfLineLength, halfSize],
    {
      stroke: color,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Create vertical line with high stroke
  const verticalLine = new fabric.Line(
    [halfSize, halfSize - halfLineLength, halfSize, halfSize + halfLineLength],
    {
      stroke: color,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Group all objects to form the pits icon
  const plusGroup = new fabric.Group([horizontalLine, verticalLine], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (plusGroup as fabric.Group & { customType?: string }).customType = 'pits';

  return plusGroup;
}

/**
 * Creates a blue triangle icon (R1) using Fabric.js objects
 */
export function createTriangleIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = 'grey',
    strokeWidth = 2
  } = options;

  const halfSize = size / 2;
  const triangleSize = size * 0.8;

  // Create triangle pointing up
  const triangle = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - triangleSize / 2 }, // Top point
      { x: halfSize - triangleSize / 2, y: halfSize + triangleSize / 2 }, // Bottom left
      { x: halfSize + triangleSize / 2, y: halfSize + triangleSize / 2 } // Bottom right
    ],
    {
      fill: color,
      stroke: '#000000',
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Group all objects to form the triangle icon
  const triangleGroup = new fabric.Group([triangle], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (triangleGroup as fabric.Group & { customType?: string }).customType = 'triangle';

  return triangleGroup;
}

/**
 * Creates a GP icon (purple circle with black dot) using Fabric.js objects
 */
export function createGpIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#9333EA', // Purple color
    strokeWidth = 2
  } = options;

  const halfSize = size / 2;
  const circleRadius = size * 0.4;

  // Create purple circle
  const purpleCircle = new fabric.Circle({
    left: halfSize - circleRadius,
    top: halfSize - circleRadius,
    radius: circleRadius,
    fill: color,
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create black dot in center
  const blackDot = new fabric.Circle({
    left: halfSize - 3,
    top: halfSize - 3,
    radius: 3,
    fill: '#000000',
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Group all objects to form the GP icon
  const gpGroup = new fabric.Group([purpleCircle, blackDot], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (gpGroup as fabric.Group & { customType?: string }).customType = 'gp';

  return gpGroup;
}

/**
 * Creates a Junction Point icon (red box with black dot) using Fabric.js objects
 */
export function createJunctionIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#DC2626', // Red color
    strokeWidth = 2
  } = options;

  const halfSize = size / 2;
  const boxSize = size * 0.6;

  // Create red box
  const redBox = new fabric.Rect({
    left: halfSize - boxSize / 2,
    top: halfSize - boxSize / 2,
    width: boxSize,
    height: boxSize,
    fill: color,
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create black dot in center
  const blackDot = new fabric.Circle({
    left: halfSize - 3,
    top: halfSize - 3,
    radius: 3,
    fill: '#000000',
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Group all objects to form the junction point icon
  const junctionGroup = new fabric.Group([redBox, blackDot], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (junctionGroup as fabric.Group & { customType?: string }).customType = 'junction';

  return junctionGroup;
}


/**
 * Factory function to create custom icons based on type
 */
export function createCustomIcon(
  type: 'pits' | 'triangle' | 'gp' | 'junction',
  options: CustomIconOptions
): fabric.Group {
  switch (type) {
    case 'pits':
      return createPlusIcon(options);
    case 'triangle':
      return createTriangleIcon(options);
    case 'gp':
      return createGpIcon(options);
    case 'junction':
      return createJunctionIcon(options);
    default:
      throw new Error(`Unknown icon type: ${type}`);
  }
}