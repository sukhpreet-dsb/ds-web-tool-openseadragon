# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite web application that provides an interactive map visualization tool using OpenSeadragon for map tiles and Fabric.js for drawing overlays. The application visualizes GeoJSON data (fiber optic networks and infrastructure) on multiple map providers (OpenStreetMaps and Mapbox) with interactive drawing capabilities, satellite view switching, and advanced infrastructure annotation tools.

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
  - Interactive tool system (line drawing, selection, text, hand navigation, infrastructure icons)
  - Event handling for canvas interactions and map navigation
  - MapView component integration for satellite/street view switching

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
  - Persistent storage using Zustand's persist middleware with conditional storage (localStorage for dev, PGlite for production)
  - Smart history management (truncates future states after undo)
  - Keyboard shortcuts integration (Ctrl+Z/Cmd+Z for undo, Ctrl+Y/Cmd+Shift+Z for redo)
  - Environment-aware storage configuration

- **Key Store** (`src/store/keyStore.ts`): Keyboard shortcuts and copy-paste functionality
  - Manages previous tool state for temporary tool switching
  - Handles copied objects storage for paste operations
  - Supports copy-paste functionality for canvas objects

### Component System
- **Toolbar** (`src/components/Toolbar.tsx`): Tool selection interface
- **MapView** (`src/components/MapView.tsx`): Map view switching interface
  - Provides dropdown for switching between street and satellite views
  - Uses Mapbox API for both street and satellite tile sources
  - Maintains zoom and center position when switching views
  - Loading states and error handling for tile source switching
- **HelpModal** (`src/components/HelpModal.tsx`): Keyboard shortcuts and tool information
  - Displays comprehensive keyboard shortcuts list
  - Shows tool descriptions and icons
  - Responsive layout for different screen sizes
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
- **satellite-tile-sources.ts**: Mapbox tile source configuration for street and satellite views
- **customIcons.ts**: Custom icon components and utilities
- **arrowHelper.ts**: Arrow drawing utilities (currently commented out)

### Data Flow
1. MapProvider wraps the application and provides context instances
2. GeoJSON data is imported and cleaned (`fixGeoJsonCoordinateTypes`)
3. OpenSeadragon viewer is created with configurable tile sources (Mapbox/OpenStreetMaps)
4. Fabric.js overlay is initialized on top of the viewer
5. CanvasEventHandler is instantiated with context getter function
6. Canvas store initializes and loads persisted state from environment-appropriate storage
7. GeoJSON features are converted to Fabric objects and rendered
8. MapView component provides satellite/street view switching capability
9. User interactions are handled through enhanced tool selection system
10. Tool actions receive context from MapContext: `activateTool(ctx, tool)`
11. Canvas modifications automatically save to history for undo/redo functionality
12. Keyboard shortcuts trigger undo/redo, copy-paste, and tool switching operations

### Key Libraries Integration
- **OpenSeadragon**: Map viewer with tile-based zooming/panning
- **Fabric.js**: Canvas drawing system overlaying the map
- **openseadragon-fabric**: Bridge library connecting OpenSeadragon and Fabric.js
- **Zustand**: State management for tool selection and UI state
- **Mapbox API**: Tile source provider for street and satellite views
- **PGlite**: SQLite database running in IndexedDB for production storage
- **Shadcn UI**: Component library for dropdown, dialog, and button interfaces
- **Tailwind CSS**: Styling system
- **Lucide React**: Icon library for UI components

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
- **Line**: Drawing mode for straight lines
- **Freehand**: Drawing mode for freehand lines with configurable brush width
- **Text**: Text annotation tool
- **Pits**: Infrastructure icon tool for pit markers
- **Triangle**: Infrastructure icon tool for triangle markers (R1 type)
- **GP**: Infrastructure icon tool for GP markers
- **Junction Point**: Infrastructure icon tool for junction points
- **Tower**: Infrastructure icon tool for communication towers

**Infrastructure Icons**: Custom SVG components for telecom and infrastructure visualization:
- Located in `src/icons/` directory
- Each icon is a React component with configurable className
- Icons include Tower, Pits, Triangle, GP, and Junction Point markers

Each tool manages mouse navigation state and canvas interaction modes appropriately through the Zustand store with context injection. Infrastructure tools place predefined SVG icons at clicked locations.

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
- Automatic persistence using Zustand persist middleware with environment-aware storage
- Development: localStorage persistence
- Production: PGlite database (SQLite in IndexedDB) for robust storage
- Storage key: `'canvas-history'`
- Survives page refreshes and browser sessions
- Only persists history array and current index
- Environment-based storage configuration via VITE_ENV variable

**Keyboard Shortcuts:**
- **Undo**: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
- **Redo**: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
- **Copy**: Ctrl+C - Copies selected canvas objects
- **Paste**: Ctrl+V - Pastes copied objects to canvas
- **Select Tool**: Hold Space - Temporarily switches to select tool
- **Move Tool**: Hold Ctrl - Temporarily switches to hand/move tool
- **Delete**: Backspace or Delete - Removes selected objects
- Standard shortcuts that work across different platforms

**Advanced Shortcuts:**
- Temporary tool switching with space/ctrl modifiers
- Copy-paste functionality for canvas objects
- Previous tool restoration after temporary switches

**Integration Points:**
- Auto-save triggers on canvas object events (`object:added`, `object:modified`, `object:removed`)
- State loading and restoration through Fabric.js `loadFromJSON()` API
- Preserves non-interactive properties of GeoJSON background features
- Prevents history loops during state loading with initialization flags

## Environment Configuration

### Environment Variables
- **VITE_MAPBOX_KEY**: Mapbox access token for satellite and street view tiles
  - Required for Mapbox tile sources
  - Get from https://account.mapbox.com/
- **VITE_ENV**: Environment mode configuration
  - `dev`: Uses localStorage for canvas history persistence
  - `production`: Uses PGlite database for persistent storage

### Mapbox Integration
The application uses Mapbox API for tile sources:
- **Street View**: Mapbox Streets v12 style with comprehensive road networks, buildings, POIs
- **Satellite View**: Mapbox Satellite Streets v12 combining satellite imagery with vector overlays
- **Tile Source Configuration**: Located in `src/utils/satellite-tile-sources.ts`
- **Zoom Levels**: Supports zoom levels 0-22 for both street and satellite views

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
- **Environment-Aware Storage**: Conditional storage strategy based on deployment environment

### Storage Services
- **PGlite Service** (`src/services/pgliteKV.ts`): Production-grade persistence layer
  - SQLite database running in IndexedDB
  - Key-value store interface for Zustand integration
  - Automatic table creation and query optimization
  - Ideal for production deployments requiring robust data persistence

## TypeScript Configuration
- Uses path aliases: `@/*` maps to `./src/*`
- Strict TypeScript settings with separate configs for app and node environments
- Type definitions for Fabric.js and OpenSeadragon included

## Build System
- Vite for development server and production builds
- TypeScript compilation with `tsc -b` before Vite build
- React plugin for Vite with Fast Refresh support
- Use Context7 to check up-to-date docs when needed for implementing new libraries or frameworks, or adding features using them.