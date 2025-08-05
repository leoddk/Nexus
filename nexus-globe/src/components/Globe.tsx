import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NexusPoint } from '../types';

interface GlobeProps {
  points: NexusPoint[];
  onPointClick?: (point: NexusPoint) => void;
  selectedPoint?: NexusPoint | null;
}

const Globe: React.FC<GlobeProps> = ({ points, onPointClick, selectedPoint }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const cesiumViewerRef = useRef<any>(null);
  const [cesiumError, setCesiumError] = useState<string | null>(null);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);

  useEffect(() => {
    if (!process.env.REACT_APP_CESIUM_ACCESS_TOKEN) {
      setCesiumError('Cesium access token not found in environment variables');
      return;
    }

    if (typeof window === 'undefined' || !(window as any).Cesium) {
      setCesiumError('Cesium library not loaded. Please check your internet connection.');
      return;
    }

    const Cesium = (window as any).Cesium;

    try {
      console.log('Initializing Cesium with Bing Maps imagery...');
      
      Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_ACCESS_TOKEN;

      if (!viewerRef.current) {
        setCesiumError('Viewer container not ready');
        return;
      }

      // Create viewer with Bing Maps (most reliable alternative)
      const cesiumViewer = new Cesium.Viewer(viewerRef.current, {
        // Disable UI elements
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        
        // Use Bing Maps imagery (works without additional setup)
        imageryProvider: new Cesium.BingMapsImageryProvider({
          url: 'https://dev.virtualearth.net',
          key: '', // Bing allows limited use without key
          mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS_ON_DEMAND
        }),
        
        // Simple terrain
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        
        // Performance settings
        requestRenderMode: true,
        maximumRenderTimeChange: 1.0,
        targetFrameRate: 30,
        
        // Disable expensive features
        shadows: false,
        terrainShadows: Cesium.ShadowMode.DISABLED,
        
        // Context options
        contextOptions: {
          webgl: {
            powerPreference: 'high-performance',
            antialias: false,
            alpha: false,
            depth: true,
            stencil: false,
            preserveDrawingBuffer: false,
            premultipliedAlpha: true,
            requestWebgl1: false
          }
        }
      });

      // Performance optimizations
      cesiumViewer.scene.globe.enableLighting = false;
      cesiumViewer.scene.globe.dynamicAtmosphereLighting = false;
      cesiumViewer.scene.globe.showGroundAtmosphere = true;
      cesiumViewer.scene.skyBox.show = false;
      cesiumViewer.scene.sun.show = false;
      cesiumViewer.scene.moon.show = false;
      cesiumViewer.scene.skyAtmosphere.show = true;
      
      // Quality settings for performance
      cesiumViewer.scene.globe.maximumScreenSpaceError = 4;
      cesiumViewer.scene.globe.tileCacheSize = 100;
      cesiumViewer.resolutionScale = 0.8;

      console.log('Cesium viewer created with Bing Maps imagery');
      cesiumViewerRef.current = cesiumViewer;
      setCesiumLoaded(true);
      setCesiumError(null);

      // Set initial view over North America (where we can see land clearly)
      cesiumViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 8000000.0), // Lower altitude for more detail
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }
      });

      // Disable problematic interactions
      cesiumViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      // Force render
      cesiumViewer.scene.requestRender();

    } catch (error) {
      console.error('Error initializing Cesium:', error);
      setCesiumError(`Failed to initialize Cesium: ${error}`);
    }

    return () => {
      if (cesiumViewerRef.current && !cesiumViewerRef.current.isDestroyed()) {
        console.log('Cleaning up Cesium viewer');
        try {
          cesiumViewerRef.current.destroy();
          cesiumViewerRef.current = null;
        } catch (e) {
          console.error('Error destroying viewer:', e);
        }
      }
    };
  }, []);

  const handleRetry = useCallback(() => {
    setCesiumError(null);
    setCesiumLoaded(false);
  }, []);

  if (!process.env.REACT_APP_CESIUM_ACCESS_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Cesium Access Token Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please add your Cesium access token to .env.local
          </p>
          <p className="text-sm text-gray-500">
            Get one free at cesium.com
          </p>
        </div>
      </div>
    );
  }

  if (cesiumError) {
    return (
      <div className="w-full h-full bg-blue-900 relative overflow-hidden">
        <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded-lg shadow-lg z-10 max-w-sm">
          <h3 className="font-semibold">3D Globe Error</h3>
          <p className="text-sm mt-1">Using reliable 2D view</p>
          <p className="text-xs mt-1 opacity-75 break-words">{cesiumError}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 bg-white text-red-600 px-2 py-1 rounded text-xs hover:bg-gray-100"
          >
            Retry 3D
          </button>
        </div>

        {/* Enhanced 2D fallback */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-4xl h-80">
            {/* More detailed continent shapes */}
            <div className="absolute top-8 left-16 w-32 h-20 bg-green-600 opacity-60 rounded-lg shadow-lg" title="North America"></div>
            <div className="absolute top-12 left-48 w-24 h-16 bg-green-600 opacity-60 rounded shadow-lg" title="Europe"></div>
            <div className="absolute top-20 left-60 w-28 h-24 bg-green-600 opacity-60 rounded shadow-lg" title="Asia"></div>
            <div className="absolute top-32 left-24 w-20 h-12 bg-green-600 opacity-60 rounded shadow-lg" title="South America"></div>
            <div className="absolute top-28 left-52 w-16 h-18 bg-green-600 opacity-60 rounded shadow-lg" title="Africa"></div>
            <div className="absolute top-36 left-72 w-12 h-8 bg-green-600 opacity-60 rounded shadow-lg" title="Australia"></div>
            
            {/* Plot Air Force bases */}
            {points.map((point) => {
              const x = ((point.longitude + 180) / 360) * 100;
              const y = ((90 - point.latitude) / 180) * 100;
              const isSelected = selectedPoint?.id === point.id;
              
              return (
                <div
                  key={point.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'scale-150 z-20' : 'hover:scale-125 z-10'
                  }`}
                  style={{
                    left: `${Math.min(Math.max(x, 5), 95)}%`,
                    top: `${Math.min(Math.max(y, 10), 90)}%`,
                  }}
                  onClick={() => onPointClick?.(point)}
                  title={`${point.name} - ${point.status.toUpperCase()}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${
                      point.status === 'green'
                        ? 'bg-green-500'
                        : point.status === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    } ${isSelected ? 'animate-pulse' : ''}`}
                  />
                  {isSelected && (
                    <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                      <div className="font-medium">{point.name}</div>
                      <div className="text-xs opacity-75">{point.description}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-lg font-semibold">Global Air Force Network</h2>
          <p className="text-sm opacity-75">Enhanced 2D Strategic View</p>
          <p className="text-xs opacity-50 mt-1">Click markers for base details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {!cesiumLoaded && !cesiumError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <div>Loading 3D Globe...</div>
            <div className="text-sm opacity-75 mt-2">Loading satellite imagery...</div>
          </div>
        </div>
      )}

      {cesiumLoaded && !cesiumError && (
        <div className="absolute top-4 left-4 bg-green-600 text-white p-2 rounded shadow-lg z-10">
          <p className="text-sm">🛰️ 3D Globe with Satellite Imagery</p>
          <p className="text-xs opacity-75">Zoom and rotate to explore • Air Force bases ready</p>
        </div>
      )}

      <div 
        ref={viewerRef} 
        className="w-full h-full"
        style={{ 
          background: '#000',
          fontFamily: 'Arial, sans-serif' 
        }}
      />
    </div>
  );
};

export default Globe;