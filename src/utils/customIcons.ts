import * as fabric from 'fabric';

export interface CustomIconOptions {
  left: number;
  top: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Creates a plus icon with rounded border circle using Fabric.js objects
 */
export function createPlusIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#FF0000',
    strokeWidth = 4
  } = options;

  const halfSize = size / 2;
  const circleRadius = size / 2.2;
  const lineLength = size * 0.6; // Make lines shorter for circle
  const halfLineLength = lineLength / 2;

  // Create background circle with white fill and red border
  const backgroundCircle = new fabric.Circle({
    radius: circleRadius,
    left: halfSize - circleRadius,
    top: halfSize - circleRadius,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 2,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create horizontal line with rounded ends
  const horizontalLine = new fabric.Line(
    [halfSize - halfLineLength, halfSize, halfSize + halfLineLength, halfSize],
    {
      stroke: color,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top',
      strokeLineCap: 'round' // Rounded line ends
    }
  );

  // Create vertical line with rounded ends
  const verticalLine = new fabric.Line(
    [halfSize, halfSize - halfLineLength, halfSize, halfSize + halfLineLength],
    {
      stroke: color,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top',
      strokeLineCap: 'round' // Rounded line ends
    }
  );

  // Group all objects to form the plus icon
  const plusGroup = new fabric.Group([backgroundCircle, horizontalLine, verticalLine], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (plusGroup as any).customType = 'plus';

  return plusGroup;
}

/**
 * Creates a temple icon using Fabric.js objects
 */
export function createTempleIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#8B4513',
    strokeWidth = 2
  } = options;

  const halfSize = size / 2;
  const roofHeight = size * 0.3;
  const buildingWidth = size * 0.6;
  const buildingHeight = size * 0.5;
  const halfBuildingWidth = buildingWidth / 2;

  // Create triangle roof
  const roof = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - roofHeight }, // Top point
      { x: halfSize - halfBuildingWidth, y: halfSize }, // Bottom left
      { x: halfSize + halfBuildingWidth, y: halfSize } // Bottom right
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

  // Create rectangle building
  const building = new fabric.Rect({
    left: halfSize - halfBuildingWidth,
    top: halfSize,
    width: buildingWidth,
    height: buildingHeight,
    fill: color,
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Group roof and building
  const templeGroup = new fabric.Group([roof, building], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (templeGroup as any).customType = 'temple';

  return templeGroup;
}

/**
 * Creates a tower icon using Fabric.js objects
 */
export function createTowerIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#696969',
    strokeWidth = 2
  } = options;

  const halfSize = size / 2;
  const towerWidth = size * 0.4;
  const towerHeight = size * 0.7;
  const halfTowerWidth = towerWidth / 2;
  const roofHeight = size * 0.2;

  // Create rectangle tower body
  const towerBody = new fabric.Rect({
    left: halfSize - halfTowerWidth,
    top: halfSize - towerHeight + roofHeight,
    width: towerWidth,
    height: towerHeight - roofHeight,
    fill: color,
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create triangle roof
  const roof = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - towerHeight }, // Top point
      { x: halfSize - halfTowerWidth * 0.8, y: halfSize - towerHeight + roofHeight }, // Bottom left
      { x: halfSize + halfTowerWidth * 0.8, y: halfSize - towerHeight + roofHeight } // Bottom right
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

  // Group tower body and roof
  const towerGroup = new fabric.Group([towerBody, roof], {
    left: left - halfSize,
    top: top - halfSize,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true
  });

  // Add custom type as a custom property
  (towerGroup as any).customType = 'tower';

  return towerGroup;
}

/**
 * Factory function to create custom icons based on type
 */
export function createCustomIcon(
  type: 'plus' | 'temple' | 'tower',
  options: CustomIconOptions
): fabric.Group {
  switch (type) {
    case 'plus':
      return createPlusIcon(options);
    case 'temple':
      return createTempleIcon(options);
    case 'tower':
      return createTowerIcon(options);
    default:
      throw new Error(`Unknown icon type: ${type}`);
  }
}