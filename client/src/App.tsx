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
  
  // Track the previous state to avoid unnecessary updates
  const [prevMatrix, setPrevMatrix] = useState("");
  const [prevVectors, setPrevVectors] = useState("");
  
  // Process matrix transformations (separate from render cycle to avoid infinite loops)
  useEffect(() => {
    // Skip if transformations are disabled
    if (!showTransformed) {
      clearTransformedVectors();
      return;
    }
    
    // Extract only the original vectors (non-transformed)
    const originalVectors = vectors.filter(v => !v.isTransformed);
    
    // Skip if no original vectors
    if (originalVectors.length === 0) {
      return;
    }
    
    // Create serialized representations for comparison
    const matrixString = JSON.stringify(matrix);
    const vectorString = JSON.stringify(
      originalVectors.map(v => ({ id: v.id, components: v.components, visible: v.visible }))
    );
    
    // Only process if something has changed
    if (matrixString === prevMatrix && vectorString === prevVectors) {
      return;
    }
    
    // Update previous state references
    setPrevMatrix(matrixString);
    setPrevVectors(vectorString);
    
    // Calculate transformed vectors
    try {
      const transformedVectors = originalVectors
        .map(vector => applyMatrixTransformation(matrix, vector))
        .filter(Boolean); // Remove null results
        
      if (transformedVectors.length > 0) {
        setTransformedVectors([], transformedVectors);
      }
    } catch (error) {
      console.error("Error applying transformations:", error);
    }
  }, [
    matrix, 
    vectors, 
    showTransformed, 
    setTransformedVectors, 
    clearTransformedVectors,
    prevMatrix,
    prevVectors
  ]);

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
