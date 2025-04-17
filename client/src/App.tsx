import React, { useState, Suspense, useCallback, useRef, useLayoutEffect } from "react";
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

  // Using refs to prevent causing infinite update loops
  const matrixRef = useRef(matrix);
  const vectorsRef = useRef(vectors);
  const showTransformedRef = useRef(showTransformed);
  
  // Update refs when props change
  useLayoutEffect(() => {
    matrixRef.current = matrix;
    vectorsRef.current = vectors;
    showTransformedRef.current = showTransformed;
  }, [matrix, vectors, showTransformed]);
  
  // Memoized calculation function
  const calculateTransformations = useCallback(() => {
    // Get refs safely to avoid closures with stale values
    const currentMatrix = matrixRef.current;
    const currentVectors = vectorsRef.current;
    const shouldShowTransformed = showTransformedRef.current;
    
    if (!shouldShowTransformed) {
      clearTransformedVectors();
      return;
    }

    const originalVectors = currentVectors.filter(v => !v.isTransformed);
    if (originalVectors.length === 0) {
      return;
    }
    
    try {
      const transformed = originalVectors
        .map(vector => applyMatrixTransformation(currentMatrix, vector))
        .filter((v): v is NonNullable<typeof v> => v !== null);
        
      if (transformed.length > 0) {
        setTransformedVectors([], transformed);
      }
    } catch (error) {
      console.error("Error calculating transformations:", error);
    }
  }, [clearTransformedVectors, setTransformedVectors]);
  
  // Run the calculation only when the show/hide toggle changes
  useLayoutEffect(() => {
    calculateTransformations();
  }, [showTransformed, calculateTransformations]);
  
  // Also run calculation when matrix changes
  useLayoutEffect(() => {
    if (showTransformed) {
      calculateTransformations();
    }
  }, [matrix, calculateTransformations, showTransformed]);
  
  // Run calculation when vectors change (add/remove/update)
  useLayoutEffect(() => {
    if (showTransformed) {
      calculateTransformations();
    }
  }, [vectors, calculateTransformations, showTransformed]);

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
