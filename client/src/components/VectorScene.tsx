import { useThree } from "@react-three/fiber";
import React, { useEffect, useState, useRef } from "react";
import { useVectorStore, Vector as VectorType } from "../lib/stores/useVectorStore";
import Grid from "./Grid";
import Axis from "./Axis";
import Vector from "./Vector";
import { useMatrixStore } from "../lib/stores/useMatrixStore";

// Default vectors that will always be shown for testing
const defaultVectors: VectorType[] = [
  {
    id: "default-x",
    components: [3, 0, 0],
    color: "#FF0000",
    label: "X",
    visible: true,
    isTransformed: false
  },
  {
    id: "default-y",
    components: [0, 3, 0],
    color: "#00FF00",
    label: "Y",
    visible: true,
    isTransformed: false
  },
  {
    id: "default-z",
    components: [0, 0, 3],
    color: "#0000FF",
    label: "Z",
    visible: true,
    isTransformed: false
  }
];

const VectorScene = () => {
  const { vectors } = useVectorStore();
  const { showTransformed } = useMatrixStore();
  const { camera } = useThree();
  const [allVectors, setAllVectors] = useState<VectorType[]>([...defaultVectors]);
  
  // Default grid size
  const defaultSize = 10;
  
  // Calculate the grid size based on vector coordinates
  const [gridSize, setGridSize] = useState(defaultSize);
  
  // Combine user vectors with default vectors and calculate grid size
  useEffect(() => {
    console.log("Rendering VectorScene with vectors:", vectors);
    const combinedVectors = [...defaultVectors, ...vectors];
    setAllVectors(combinedVectors);
    
    // Determine if we need a larger grid size based on vector coordinates
    let maxCoordinate = defaultSize;
    
    // Check all vectors including transformed ones
    combinedVectors.forEach(vector => {
      vector.components.forEach(component => {
        const absComponent = Math.abs(component);
        if (absComponent > maxCoordinate) {
          // Round up to the nearest multiple of 10
          maxCoordinate = Math.ceil(absComponent / 10) * 10;
        }
      });
    });
    
    // Set the new grid size if it's changed
    if (maxCoordinate !== gridSize) {
      console.log("Setting new grid size:", maxCoordinate);
      setGridSize(maxCoordinate);
    }
  }, [vectors, gridSize, showTransformed]);
  
  // Camera setup - ONLY runs once when the component mounts
  const cameraInitialized = useRef(false);
  
  useEffect(() => {
    // Only set initial camera position on first render
    if (!cameraInitialized.current) {
      console.log("Setting initial camera position in VectorScene");
      camera.position.set(8, 8, 8);
      camera.up.set(0, 0, 1); // Set Z-axis as up direction
      camera.lookAt(0, 0, 0);
      cameraInitialized.current = true;
    }
  }, []);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      
      {/* Coordinate system - adjust grid size dynamically but keep axis at 10 units */}
      <Grid size={gridSize} divisions={gridSize} />
      <Axis length={10} />
      
      {/* Debug sphere at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Debug vectors for testing */}
      {defaultVectors.map((vector) => (
        <Vector 
          key={vector.id} 
          vector={vector} 
        />
      ))}
      
      {/* Render user-added vectors */}
      {vectors.map((vector) => (
        vector.visible && (
          <Vector 
            key={vector.id} 
            vector={vector} 
          />
        )
      ))}
    </>
  );
};

export default VectorScene;
