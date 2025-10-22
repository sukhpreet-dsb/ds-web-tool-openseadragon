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
 * Creates a realistic temple icon using Fabric.js objects
 */
export function createTempleIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#8B4513',
    strokeWidth = 1
  } = options;

  const halfSize = size / 2;
  const baseWidth = size * 0.7;
  const baseHeight = size * 0.25;
  const buildingWidth = size * 0.5;
  const buildingHeight = size * 0.35;
  const roofHeight = size * 0.2;
  const domeHeight = size * 0.15;
  const halfBaseWidth = baseWidth / 2;
  const halfBuildingWidth = buildingWidth / 2;

  // Create base/foundation
  const base = new fabric.Rect({
    left: halfSize - halfBaseWidth,
    top: halfSize + buildingHeight - 5,
    width: baseWidth,
    height: baseHeight,
    fill: '#654321',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create main building structure
  const building = new fabric.Rect({
    left: halfSize - halfBuildingWidth,
    top: halfSize + roofHeight + domeHeight - 5,
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

  // Create dome (circle/ellipse)
  const dome = new fabric.Ellipse({
    left: halfSize - halfBuildingWidth + 5,
    top: halfSize + roofHeight - domeHeight,
    width: buildingWidth - 10,
    height: domeHeight * 2,
    fill: '#D2691E',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create decorative triangular roof top
  const roofTop = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - roofHeight }, // Top point
      { x: halfSize - halfBuildingWidth - 5, y: halfSize + roofHeight - domeHeight }, // Bottom left
      { x: halfSize + halfBuildingWidth + 5, y: halfSize + roofHeight - domeHeight } // Bottom right
    ],
    {
      fill: '#A0522D',
      stroke: '#000000',
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Create entrance door
  const door = new fabric.Rect({
    left: halfSize - 4,
    top: halfSize + buildingHeight + roofHeight + domeHeight - 15,
    width: 8,
    height: 12,
    fill: '#654321',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create small windows
  const leftWindow = new fabric.Rect({
    left: halfSize - halfBuildingWidth + 8,
    top: halfSize + roofHeight + domeHeight,
    width: 4,
    height: 4,
    fill: '#87CEEB',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  const rightWindow = new fabric.Rect({
    left: halfSize + halfBuildingWidth - 12,
    top: halfSize + roofHeight + domeHeight,
    width: 4,
    height: 4,
    fill: '#87CEEB',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Group all temple components
  const templeGroup = new fabric.Group([
    base, building, dome, roofTop, door, leftWindow, rightWindow
  ], {
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
 * Creates a realistic tower icon using Fabric.js objects
 */
export function createTowerIcon(options: CustomIconOptions): fabric.Group {
  const {
    left,
    top,
    size = 40,
    color = '#696969',
    strokeWidth = 1
  } = options;

  const halfSize = size / 2;
  const baseWidth = size * 0.6;
  const towerWidth = size * 0.35;
  const towerHeight = size * 0.5;
  const conicalRoofHeight = size * 0.25;
  const topPlatformHeight = size * 0.08;
  const halfBaseWidth = baseWidth / 2;
  const halfTowerWidth = towerWidth / 2;

  // Create stone base/foundation
  const base = new fabric.Rect({
    left: halfSize - halfBaseWidth,
    top: halfSize + towerHeight - 8,
    width: baseWidth,
    height: size * 0.15,
    fill: '#4A4A4A',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create main tower body
  const towerBody = new fabric.Rect({
    left: halfSize - halfTowerWidth,
    top: halfSize + topPlatformHeight,
    width: towerWidth,
    height: towerHeight,
    fill: color,
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create top platform
  const topPlatform = new fabric.Rect({
    left: halfSize - halfTowerWidth - 3,
    top: halfSize + topPlatformHeight - 3,
    width: towerWidth + 6,
    height: topPlatformHeight,
    fill: '#5A5A5A',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create conical roof (trapezoid shape)
  const conicalRoof = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - conicalRoofHeight + 5 }, // Top point
      { x: halfSize - halfTowerWidth - 2, y: halfSize + 5 }, // Bottom left
      { x: halfSize + halfTowerWidth + 2, y: halfSize + 5 } // Bottom right
    ],
    {
      fill: '#8B0000',
      stroke: '#000000',
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Create small flagpole at top
  const flagpole = new fabric.Line(
    [halfSize, halfSize - conicalRoofHeight, halfSize, halfSize - conicalRoofHeight + 8],
    {
      stroke: '#8B4513',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Create small flag
  const flag = new fabric.Polygon(
    [
      { x: halfSize, y: halfSize - conicalRoofHeight },
      { x: halfSize + 6, y: halfSize - conicalRoofHeight + 2 },
      { x: halfSize, y: halfSize - conicalRoofHeight + 4 }
    ],
    {
      fill: '#FF0000',
      stroke: '#000000',
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Create windows (small rectangles)
  const window1 = new fabric.Rect({
    left: halfSize - 3,
    top: halfSize + towerHeight * 0.3,
    width: 6,
    height: 4,
    fill: '#FFFFE0',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  const window2 = new fabric.Rect({
    left: halfSize - 3,
    top: halfSize + towerHeight * 0.6,
    width: 6,
    height: 4,
    fill: '#FFFFE0',
    stroke: '#000000',
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top'
  });

  // Create brick pattern lines on tower body
  const brickLine1 = new fabric.Line(
    [halfSize - halfTowerWidth + 1, halfSize + towerHeight * 0.4, halfSize + halfTowerWidth - 1, halfSize + towerHeight * 0.4],
    {
      stroke: '#3A3A3A',
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  const brickLine2 = new fabric.Line(
    [halfSize - halfTowerWidth + 1, halfSize + towerHeight * 0.8, halfSize + halfTowerWidth - 1, halfSize + towerHeight * 0.8],
    {
      stroke: '#3A3A3A',
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top'
    }
  );

  // Group all tower components
  const towerGroup = new fabric.Group([
    base, towerBody, topPlatform, conicalRoof, flagpole, flag,
    window1, window2, brickLine1, brickLine2
  ], {
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