import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import "@fontsource/inter";
import Controls from "./components/Controls";
import VectorInput from "./components/VectorInput";
import MatrixInput from "./components/MatrixInput";
import VectorScene from "./components/VectorScene";
import { useMatrixStore } from "./lib/stores/useMatrixStore";
import { useVectorStore } from "./lib/stores/useVectorStore";
import { applyMatrixTransformation } from "./lib/math";

function App() {
  // State for controlling panel layout
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Get store data
  const { matrix, showTransformed } = useMatrixStore();
  const { vectors, setTransformedVectors, clearTransformedVectors } = useVectorStore();
  
  // Apply transformations in the parent component
  // Use a ref to track if we're performing an update to prevent loops
  const isUpdating = React.useRef(false);
  
  // This effect runs once on component mount to set up a timer for updates
  useEffect(() => {
    // Create an interval to check and apply transformations
    const interval = setInterval(() => {
      // Skip if already updating
      if (isUpdating.current) return;
      isUpdating.current = true;
      
      try {
        // Only apply transformations if transform display is enabled
        if (showTransformed && vectors.length > 0) {
          // Filter only original vectors
          const originalVectors = vectors.filter(v => !v.isTransformed);
          
          if (originalVectors.length > 0) {
            // Apply transformations
            const transformedVectors = [];
            
            for (const vector of originalVectors) {
              const transformed = applyMatrixTransformation(matrix, vector);
              if (transformed) {
                transformedVectors.push(transformed);
              }
            }
            
            if (transformedVectors.length > 0) {
              setTransformedVectors(originalVectors, transformedVectors);
            }
          }
        } else {
          // Clear transformed vectors if show transform is disabled
          clearTransformedVectors();
        }
      } finally {
        isUpdating.current = false;
      }
    }, 500); // Check every 500ms
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Left Panel - Matrix Input */}
      <div 
        className={`${showLeftPanel ? 'w-1/4 min-w-[250px]' : 'w-0'} transition-all duration-300 h-full bg-card border-r border-border overflow-y-auto overflow-x-hidden`}
      >
        {showLeftPanel && (
          <Suspense fallback={<div className="p-4">Loading Matrix controls...</div>}>
            <MatrixInput />
          </Suspense>
        )}
      </div>

      {/* Center - 3D Visualization */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Controls */}
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="bg-primary text-primary-foreground p-2 rounded-md text-sm"
          >
            {showLeftPanel ? '← Hide Matrix' : 'Show Matrix →'}
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="bg-primary text-primary-foreground p-2 rounded-md text-sm"
          >
            {showRightPanel ? 'Hide Vectors →' : '← Show Vectors'}
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 border-2 border-blue-500">
          <Canvas
            camera={{ position: [8, 8, 8], fov: 60 }}
            gl={{ antialias: true }}
            shadows
            style={{ background: "#111" }}
          >
            {/* Ambient and directional lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.8} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            
            {/* Scene contents */}
            <Suspense fallback={null}>
              <VectorScene />
            </Suspense>
            
            {/* Debug info */}
            <axesHelper args={[5]} />
            
            {/* Camera controls */}
            <Controls />
          </Canvas>
        </div>
      </div>

      {/* Right Panel - Vector Input */}
      <div 
        className={`${showRightPanel ? 'w-1/4 min-w-[250px]' : 'w-0'} transition-all duration-300 h-full bg-card border-l border-border overflow-y-auto overflow-x-hidden`}
      >
        {showRightPanel && (
          <Suspense fallback={<div className="p-4">Loading Vector controls...</div>}>
            <VectorInput />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default App;
