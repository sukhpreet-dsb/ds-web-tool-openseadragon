# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite web application that provides an interactive map visualization tool using OpenSeadragon for map tiles and Fabric.js for drawing overlays. The application visualizes GeoJSON data (fiber optic networks and infrastructure) on OpenStreetMaps with interactive drawing capabilities.

## Development Commands

- **Start development server**: `pnpm run dev`
- **Build for production**: `pnpm run build` (runs TypeScript compilation then Vite build)
- **Lint code**: `pnpm run lint`
- **Preview production build**: `pnpm run preview`

## Core Architecture

### Main Components
- **App.tsx**: Simple root component that renders MapWithFabric
- **MapWithFabric.tsx**: Main application component containing:
  - MapProvider wrapper for context management
  - OpenSeadragon viewer initialization and management
  - Fabric.js overlay setup for drawing tools
  - GeoJSON data visualization and rendering
  - Interactive tool system (line drawing, selection, text, hand navigation)
  - Event handling for canvas interactions and map navigation

### State Management Architecture
The application uses a clean separation between dependency injection and state management:

- **MapContext** (`src/contexts/MapContext.tsx`): React Context for dependency injection
  - Provides map instances (viewer, canvas) throughout the component tree
  - Uses stable references with `useCallback` to prevent infinite re-renders
  - Exposes `CTX` type: `{ fabricCanvas, viewer, viewerRef, canvasEventHandlerRef }`

- **Zustand Store** (`src/store/toolStore.ts`): State management for UI state
  - Manages tool selection and drawing modes
  - Store actions receive context as first parameter: `activateTool(ctx, tool)`
  - Clean separation between instances and UI state

- **Canvas Store** (`src/store/canvasStore.ts`): Undo/redo history management and persistence
  - Manages canvas state history with memento pattern
  - Stores up to 50 canvas states as JSON strings
  - Handles undo/redo navigation through history array
  - Persistent storage using Zustand's persist middleware with localStorage
  - Smart history management (truncates future states after undo)
  - Keyboard shortcuts integration (Ctrl+Z/Cmd+Z for undo, Ctrl+Y/Cmd+Shift+Z for redo)

### Component System
- **Toolbar** (`src/components/Toolbar.tsx`): Tool selection interface
- **CanvasEventHandler** (`src/tools/canvasEventHandler.ts`): Event handling logic
  - Receives context getter function: `constructor(getCtx: () => CTX)`
  - Dynamically accesses instances from context when needed
  - Handles all canvas mouse events and tool interactions
  - Integrates with undo/redo system for automatic state saving
  - Manages keyboard shortcuts for undo/redo operations
  - Handles state loading and restoration from localStorage
  - Auto-saves canvas state on object modifications (add, modify, remove)

### Tool Configuration
- **toolConfig.ts** (`src/tools/toolConfig.ts`): Centralized tool definitions
  - Tool metadata: icons, descriptions, shortcuts
  - Type-safe tool configuration system
  - Easy to extend with new tools

### Utility System
The application uses a modular utility architecture:

- **openseadragon-helpers.ts**: OpenSeadragon viewer creation, configuration, and resize handling
- **fabric-js-helpers.ts**: Fabric overlay initialization, GeoJSON feature rendering, canvas object creation
- **coordinate-conversion.ts**: Coordinate system conversions between longitude/latitude and OpenSeadragon coordinate systems
- **geojson-coordinate.ts**: GeoJSON data processing, center calculation, coordinate type fixing

### Data Flow
1. MapProvider wraps the application and provides context instances
2. GeoJSON data is imported and cleaned (`fixGeoJsonCoordinateTypes`)
3. OpenSeadragon viewer is created with OpenStreetMaps tiles
4. Fabric.js overlay is initialized on top of the viewer
5. CanvasEventHandler is instantiated with context getter function
6. Canvas store initializes and loads persisted state from localStorage if available
7. GeoJSON features are converted to Fabric objects and rendered
8. User interactions are handled through tool selection system
9. Tool actions receive context from MapContext: `activateTool(ctx, tool)`
10. Canvas modifications automatically save to history for undo/redo functionality
11. Keyboard shortcuts trigger undo/redo operations through canvas store

### Key Libraries Integration
- **OpenSeadragon**: Map viewer with tile-based zooming/panning
- **Fabric.js**: Canvas drawing system overlaying the map
- **openseadragon-fabric**: Bridge library connecting OpenSeadragon and Fabric.js
- **Zustand**: State management for tool selection and UI state
- **Shadcn UI**: Component library for tool dropdown interface
- **Tailwind CSS**: Styling system

### Coordinate Systems
The application handles multiple coordinate systems:
- Geographic coordinates (longitude/latitude) from GeoJSON
- OpenSeadragon viewport coordinates for map positioning
- Image coordinates for Fabric.js object placement
- Pixel coordinates for high-precision calculations

### Tool System
Interactive tools available:
- **Select**: Object selection and manipulation
- **Hand**: Map navigation/panning mode (default)
- **Line**: Drawing mode for freehand lines
- **Text**: Text annotation tool

Each tool manages mouse navigation state and canvas interaction modes appropriately through the Zustand store with context injection.

### Undo/Redo System
The application includes a comprehensive undo/redo system with persistent storage:

**History Management:**
- Memento pattern implementation using Zustand store
- Stores up to 50 canvas states as JSON strings to prevent memory issues
- Smart history truncation when new actions are performed after undo
- Current position tracking for undo/redo navigation

**Supported Operations:**
- Object addition (text, lines, drawings)
- Object modification (move, scale, rotate)
- Object deletion
- Line drawing (both preview and final creation)
- Text creation and editing

**Persistence:**
- Automatic localStorage persistence using Zustand persist middleware
- Storage key: `'canvas-history'`
- Survives page refreshes and browser sessions
- Only persists history array and current index

**Keyboard Shortcuts:**
- Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
- Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
- Standard shortcuts that work across different platforms

**Integration Points:**
- Auto-save triggers on canvas object events (`object:added`, `object:modified`, `object:removed`)
- State loading and restoration through Fabric.js `loadFromJSON()` API
- Preserves non-interactive properties of GeoJSON background features
- Prevents history loops during state loading with initialization flags

## Architecture Patterns

### Dependency Injection Pattern
- **React Context** provides instances (viewer, canvas) throughout the app
- **Zustand stores** receive context as first parameter in actions
- **CanvasEventHandler** uses context getter function for dynamic access
- **Canvas store** operates independently but integrates with event handler for state management

### Component Organization
- **State Management**: Zustand for UI state and canvas history, React Context for dependency injection
- **Event Handling**: Dedicated CanvasEventHandler class with context access and undo/redo integration
- **Tool Configuration**: Centralized tool definitions with metadata
- **History Management**: Separate canvas store for undo/redo with persistent storage
- **Utility Functions**: Modular utility system for specific concerns

### Performance Optimizations
- **Stable Context References**: Uses `useCallback` to prevent infinite re-renders
- **Dynamic Instance Access**: Event handlers get current instances from context
- **Memory Management**: Proper cleanup of event handlers and subscriptions
- **History Limits**: Canvas history limited to 50 states to prevent memory bloat
- **Efficient State Storage**: JSON serialization of canvas states for compact storage
- **Smart History Truncation**: Automatically removes future states when new actions are performed after undo

## TypeScript Configuration
- Uses path aliases: `@/*` maps to `./src/*`
- Strict TypeScript settings with separate configs for app and node environments
- Type definitions for Fabric.js and OpenSeadragon included

## Build System
- Vite for development server and production builds
- TypeScript compilation with `tsc -b` before Vite build
- React plugin for Vite with Fast Refresh support