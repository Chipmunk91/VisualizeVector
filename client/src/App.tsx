import React, { useState, Suspense, useCallback, useRef, useLayoutEffect, useMemo } from "react";
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

  // Use a simpler approach by creating stable hash values for comparison
  const nonTransformedVectorsHash = useMemo(() => {
    const originalVectors = vectors.filter(v => !v.isTransformed);
    return JSON.stringify(originalVectors.map(v => ({
      id: v.id,
      components: v.components,
      visible: v.visible
    })));
  }, [vectors]);
  
  const matrixHash = useMemo(() => JSON.stringify(matrix), [matrix]);
  
  // Process matrix transformations with better loop protection
  useLayoutEffect(() => {
    // Skip if transformations are disabled
    if (!showTransformed) {
      clearTransformedVectors();
      return;
    }
    
    // Get only original vectors
    const originalVectors = vectors.filter(v => !v.isTransformed);
    if (originalVectors.length === 0) {
      return;
    }

    // Protection against infinite loops - use a ref to track last transformation
    // and skip if inputs are identical
    const currentInputHash = `${nonTransformedVectorsHash}-${matrixHash}`;
    
    // Store the last transformation input hash as a data attribute on document body
    // This is a simple way to persist it between renders without useRef
    const lastTransformationHash = document.body.getAttribute('data-last-transform-hash');
    
    // Skip if this is the same input as last time
    if (lastTransformationHash === currentInputHash) {
      console.log("Skipping identical transformation");
      return;
    }
    
    // Calculate transformed vectors
    try {
      // Calculate transformations
      const transformedVectors = [];
      
      for (const vector of originalVectors) {
        const transformed = applyMatrixTransformation(matrix, vector);
        if (transformed) {
          transformedVectors.push(transformed);
        }
      }
      
      // Only update if we have transformations to add
      if (transformedVectors.length > 0) {
        // Important: Use originalVectors as first parameter
        setTransformedVectors(originalVectors, transformedVectors);
        
        // Store the current hash to prevent infinite loops
        document.body.setAttribute('data-last-transform-hash', currentInputHash);
      }
    } catch (error) {
      console.error("Error applying matrix transformations:", error);
    }
  }, [showTransformed, nonTransformedVectorsHash, matrixHash, clearTransformedVectors, setTransformedVectors, vectors, matrix]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-background text-foreground">
      {/* Left Panel - Matrix Input */}
      <div 
        className={`${showLeftPanel ? 'w-full h-1/3 md:h-full sm:w-1/3 md:w-1/4 min-w-0 sm:min-w-[250px]' : 'w-0 h-0 md:h-full'} transition-all duration-300 bg-card border-r border-border overflow-y-auto overflow-x-hidden`}
      >
        {showLeftPanel && (
          <Suspense fallback={<div className="p-4">Loading Matrix controls...</div>}>
            <MatrixInput />
          </Suspense>
        )}
      </div>

      {/* Center - 3D Visualization */}
      <div className="flex-1 flex flex-col md:h-full h-1/3 relative">
        {/* Top Controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs sm:text-sm"
          >
            {showLeftPanel ? '← Hide Matrix' : 'Show Matrix →'}
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs sm:text-sm"
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
            style={{ background: "#ffffff" }}
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
        className={`${showRightPanel ? 'w-full h-1/3 md:h-full sm:w-1/3 md:w-1/4 min-w-0 sm:min-w-[250px]' : 'w-0 h-0 md:h-full'} transition-all duration-300 bg-card border-l border-border overflow-y-auto overflow-x-hidden`}
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
