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
 * Creates a Tower icon (tower structure with antenna) using Fabric.js objects
 */
export function createTowerIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 80,
    color = "#000000",
    strokeWidth = 1,
  } = options;

  const scale = size / 15; // SVG viewBox is 0 0 15 15

  // === Tower main path ===
  const towerPathData = `M11.8545,6.4336l-.4131-.2813a4.7623,4.7623,0,0,0,.2813-4.8779l-.0835-.1533L12.0747.875l.0908.167a5.2619,5.2619,0,0,1-.311,5.3916Zm1.1521,7.1316V14h-11v-.4348H4.4952L6.0439,6.4a.5.5,0,0,1,.4888-.3945h.7255V4.6014A1.14,1.14,0,0,1,6.3756,3.5a1.1568,1.1568,0,1,1,2.3136,0,1.14,1.14,0,0,1-.931,1.1112V6.0059h.7223A.5.5,0,0,1,8.9692,6.4l1.5478,7.1648ZM8.4543,8.751H6.5588L6.236,10.2441H8.777ZM6.1279,10.7441l-.3233,1.4952H9.2082l-.3231-1.4952ZM6.936,7.0059,6.6669,8.251H8.3463L8.0771,7.0059ZM5.5179,13.5652H9.4948l-.1786-.8259h-3.62ZM5.21,5.0137a2.7523,2.7523,0,0,1,.0161-3.0518L4.812,1.6826a3.25,3.25,0,0,0-.019,3.6065ZM10.7568,3.5a3.2433,3.2433,0,0,0-.5341-1.7861l-.418.2754a2.7517,2.7517,0,0,1-.0176,3.0488l.4141.2793A3.2341,3.2341,0,0,0,10.7568,3.5ZM3.5342,6.1182A4.7637,4.7637,0,0,1,3.3813,1.13L2.9478.88a5.2643,5.2643,0,0,0,.1694,5.5137Z`;

  const towerPath = new fabric.Path(towerPathData, {
    left: left,
    top: top,
    fill: color,
    // stroke: color,
    strokeWidth,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
    selectable: true,
    evented: true,
  });

  const group = new fabric.Group([towerPath], {
    left,
    top,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
  });

  (group as fabric.Group & { customType?: string }).customType = "tower";

  return group;
}

/**
 * Factory function to create custom icons based on type
 */
export function createCustomIcon(
  type: 'pits' | 'triangle' | 'gp' | 'junction' | 'tower',
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
    case 'tower':
      return createTowerIcon(options);
    default:
      throw new Error(`Unknown icon type: ${type}`);
  }
}