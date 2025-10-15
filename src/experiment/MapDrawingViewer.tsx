import { useRef, useEffect, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import * as fabric  from 'fabric';
import { initOSDFabricJS } from 'openseadragon-fabric';



const MapDrawingViewer = ({ imageUrl = null }) => {
  const viewerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [fabricOverlay, setFabricOverlay] = useState(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');

  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize the fabric plugin before creating viewers
    initOSDFabricJS();

    // Create OpenSeadragon viewer with map tiles
    const osdViewer = OpenSeadragon({
      element: viewerRef.current,
      tileSources: imageUrl || {
        type: 'openstreetmaps',
        maxZoom: 49,
        minZoom: 0,
      },
      showNavigator: true,
      navigatorPosition: 'TOP_RIGHT',
      showRotationControl: true,
      gestureSettingsMouse: {
        flickEnabled: true,
        clickToZoom: true,
      },
      zoomInButton: 'zoom-in-btn',
      zoomOutButton: 'zoom-out-btn',
      homeButton: 'home-btn',
      fullPageButton: 'fullscreen-btn',
    });

    osdViewer.addHandler('open', () => {
      // Initialize fabric overlay after the viewer is opened
      const overlay = osdViewer.fabricOverlay({
        fabricCanvasOptions: { 
          selection: true,
          preserveObjectStacking: true,
        },
        scale: 1000, // Arbitrary scale for fabric canvas coordinates
      });

      const canvas = overlay.fabricCanvas();

      // Configure fabric canvas selection appearance
      fabric.Object.prototype.set({
        borderColor: '#22a2f8',
        borderScaleFactor: 2,
        cornerColor: 'white',
        cornerSize: 10,
        transparentCorners: false,
      });

      // Handle mouse events to control map navigation
      canvas.on('mouse:down', (e) => {
        if (selectedTool === 'select' || e.target) {
          // Disable map navigation when in select mode or clicking on an object
          osdViewer.setMouseNavEnabled(false);
        }
      });

      canvas.on('mouse:move', (e) => {
        if (selectedTool === 'select' && e.target) {
          // Keep map navigation disabled while dragging objects
          osdViewer.setMouseNavEnabled(false);
        }
      });

      canvas.on('mouse:up', (e) => {
        // Re-enable map navigation after object interaction
        if (selectedTool !== 'draw') {
          setTimeout(() => {
            osdViewer.setMouseNavEnabled(true);
          }, 100);
        }
      });

      canvas.on('selection:created', () => {
        osdViewer.setMouseNavEnabled(false);
      });

      canvas.on('selection:updated', () => {
        osdViewer.setMouseNavEnabled(false);
      });

      canvas.on('selection:cleared', () => {
        if (selectedTool !== 'draw') {
          osdViewer.setMouseNavEnabled(true);
        }
      });

      canvas.on('object:moving', () => {
        osdViewer.setMouseNavEnabled(false);
      });

      canvas.on('object:scaling', () => {
        osdViewer.setMouseNavEnabled(false);
      });

      canvas.on('object:rotating', () => {
        osdViewer.setMouseNavEnabled(false);
      });

      canvas.on('object:modified', () => {
        setTimeout(() => {
          if (selectedTool !== 'draw') {
            osdViewer.setMouseNavEnabled(true);
          }
        }, 100);
      });

      setViewer(osdViewer);
      setFabricOverlay(overlay);
      setFabricCanvas(canvas);
    });

    // Handle viewer resize
    const handleResize = () => {
      if (fabricOverlay) {
        fabricOverlay.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (osdViewer) {
        osdViewer.destroy();
      }
    };
  }, [imageUrl]);

  // Tool handlers
  const handleToolChange = (tool) => {
    if (!fabricCanvas || !viewer) return;

    setSelectedTool(tool);

    // Reset drawing mode and enable map navigation by default
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;
    viewer.setMouseNavEnabled(true);

    switch (tool) {
      case 'select':
        fabricCanvas.selection = true;
        // Disable map navigation when in select mode
        viewer.setMouseNavEnabled(false);
        break;

      case 'draw':
        setIsDrawingMode(true);
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 5;
        fabricCanvas.freeDrawingBrush.color = '#ff0000';
        // Disable OpenSeadragon mouse navigation for drawing
        viewer.setMouseNavEnabled(false);
        break;

      case 'rectangle':
        addRectangle();
        break;

      case 'circle':
        addCircle();
        break;

      case 'text':
        addText();
        break;

      default:
        break;
    }
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: '#ff0000',
      strokeWidth: 2,
    });
    
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvas) return;
    
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 75,
      fill: 'rgba(0, 255, 0, 0.3)',
      stroke: '#00ff00',
      strokeWidth: 2,
    });
    
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
  };

  const addText = () => {
    if (!fabricCanvas) return;
    
    const text = new fabric.Textbox('Click to edit text', {
      left: 100,
      top: 200,
      width: 200,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      textAlign: 'center',
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      fabricCanvas.remove(...activeObjects);
      fabricCanvas.discardActiveObject();
    }
  };

  const clearAll = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
  };

  const exportData = () => {
    if (!fabricCanvas) return;
    
    const data = {
      objects: fabricCanvas.toJSON(),
      viewerState: viewer ? {
        zoom: viewer.viewport.getZoom(),
        center: viewer.viewport.getCenter(),
        rotation: viewer.viewport.getRotation()
      } : null
    };
    
    console.log('Exported data:', data);
    return data;
  };

  return (
    <div className="map-drawing-container" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Toolbar */}
      <div className="toolbar" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px'
      }}>
        <button 
          onClick={() => handleToolChange('select')}
          className={selectedTool === 'select' ? 'active' : ''}
        >
          Select
        </button>
        <button 
          onClick={() => handleToolChange('draw')}
          className={selectedTool === 'draw' ? 'active' : ''}
        >
          Draw
        </button>
        <button onClick={() => handleToolChange('rectangle')}>
          Rectangle
        </button>
        <button onClick={() => handleToolChange('circle')}>
          Circle
        </button>
        <button onClick={() => handleToolChange('text')}>
          Text
        </button>
        <button onClick={deleteSelected} style={{ backgroundColor: '#ff4444', color: 'white' }}>
          Delete Selected
        </button>
        <button onClick={clearAll} style={{ backgroundColor: '#ff6666', color: 'white' }}>
          Clear All
        </button>
        <button onClick={exportData} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
          Export
        </button>
      </div>

      {/* OpenSeadragon Navigation Controls */}
      <div className="osd-controls" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button id="zoom-in-btn">+</button>
        <button id="zoom-out-btn">-</button>
        <button id="home-btn">🏠</button>
        <button id="fullscreen-btn">⛶</button>
      </div>

      {/* Viewer Container */}
      <div ref={viewerRef} style={{ width: '100%', height: '100%', background: '#000' }} />

      {/* Status Info */}
      {fabricCanvas && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px'
        }}>
          Objects: {fabricCanvas.getObjects().length} | 
          Mode: {isDrawingMode ? 'Drawing' : 'Selection'} |
          Tool: {selectedTool}
        </div>
      )}
    </div>
  );
};

export default MapDrawingViewer;
