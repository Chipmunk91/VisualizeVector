import { useThree } from "@react-three/fiber";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useVectorStore, Vector as VectorType } from "../lib/stores/useVectorStore";
import Grid from "./Grid";
import Axis from "./Axis";
import Vector from "./Vector";
import { useMatrixStore } from "../lib/stores/useMatrixStore";
import * as THREE from "three";

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

// Helper function to calculate matrix rank
const calculateMatrixRank = (matrix: number[][]): number => {
  // Simple implementation to estimate rank
  // For a more accurate version, we could use SVD or row reduction
  
  // Clone the matrix since we'll modify it
  const m = matrix.map(row => [...row]);
  const rows = m.length;
  const cols = m[0].length;
  
  // Use Gaussian elimination to find rank
  let rank = 0;
  const rowsProcessed = new Array(rows).fill(false);
  
  for (let col = 0; col < cols; col++) {
    let foundPivot = false;
    
    // Find pivot
    for (let row = 0; row < rows; row++) {
      if (!rowsProcessed[row] && Math.abs(m[row][col]) > 1e-10) {
        rowsProcessed[row] = true;
        rank++;
        foundPivot = true;
        
        // Normalize the pivot row
        const pivot = m[row][col];
        for (let c = col; c < cols; c++) {
          m[row][c] /= pivot;
        }
        
        // Eliminate this column from all other rows
        for (let r = 0; r < rows; r++) {
          if (r !== row && Math.abs(m[r][col]) > 1e-10) {
            const factor = m[r][col];
            for (let c = col; c < cols; c++) {
              m[r][c] -= factor * m[row][c];
            }
          }
        }
        
        break;
      }
    }
    
    if (!foundPivot) {
      // This column doesn't add to the rank
      continue;
    }
  }
  
  return rank;
};

const VectorScene = () => {
  const { vectors } = useVectorStore();
  const { matrix, showTransformed, showDimensionVisualization } = useMatrixStore();
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
  }, [vectors, gridSize, showTransformed, showDimensionVisualization]);
  
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
  
  // Calculate matrix rank and generate visualization components for dimension
  const matrixRank = useMemo(() => {
    if (!showDimensionVisualization) return 0;
    
    return calculateMatrixRank(matrix.values);
  }, [matrix.values, showDimensionVisualization]);
  
  // Determine principal direction of the matrix (simplified)
  const getPrincipalDirection = useMemo(() => {
    // Only compute if visualization is enabled
    if (!showDimensionVisualization) return new THREE.Vector3(1, 0, 0);
    
    // Get matrix values
    const m = matrix.values;
    
    // For a 3x3 matrix
    if (m.length === 3 && m[0].length === 3) {
      // For rank 1 matrices, find the principal direction (simplified approach)
      // We're looking for the direction with the largest component after transformation
      
      // Test vectors
      const testVectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
      ];
      
      // Transform each vector with the matrix
      const transformedVectors = testVectors.map(v => {
        const result = new THREE.Vector3();
        // Apply matrix transformation
        result.x = m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z;
        result.y = m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z;
        result.z = m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z;
        return { vector: v, transformed: result, magnitude: result.length() };
      });
      
      // Find the vector that results in the largest magnitude
      transformedVectors.sort((a, b) => b.magnitude - a.magnitude);
      
      // Return the principal direction (the input vector that resulted in the largest output)
      return transformedVectors[0].vector;
    }
    
    // Default fallback
    return new THREE.Vector3(1, 0, 0);
  }, [matrix.values, showDimensionVisualization]);
  
  // Create visualization elements based on rank
  const dimensionVisualization = useMemo(() => {
    if (!showDimensionVisualization) return null;
    
    console.log(`Visualizing matrix with rank ${matrixRank}`);
    
    // Size of visualization (adjusted to match grid)
    const size = 5;
    
    // Principal direction for alignment
    const principalDir = getPrincipalDirection;
    
    // Create quaternion to rotate to align with principal direction
    const quaternion = new THREE.Quaternion();
    if (matrixRank === 1) {
      // For rank 1, align cylinder with principal direction
      const startVec = new THREE.Vector3(0, 0, 1); // Default cylinder orientation
      quaternion.setFromUnitVectors(startVec, principalDir.normalize());
    }
    
    if (matrixRank === 1) {
      // Rank 1: Line visualization (1D)
      return (
        <group quaternion={quaternion.toArray()}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, size * 2, 16]} />
            <meshStandardMaterial color="#7F00FF" transparent opacity={0.3} />
          </mesh>
        </group>
      );
    } else if (matrixRank === 2) {
      // Rank 2: Plane visualization (2D)
      // For simplicity, we'll just use XY plane for now
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size * 2, size * 2]} />
          <meshStandardMaterial color="#00BFFF" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      );
    } else if (matrixRank === 3) {
      // Rank 3: Space visualization (3D)
      return (
        <mesh>
          <boxGeometry args={[size * 2, size * 2, size * 2]} />
          <meshStandardMaterial color="#FF6347" transparent opacity={0.1} />
        </mesh>
      );
    }
    
    return null;
  }, [matrixRank, showDimensionVisualization, getPrincipalDirection]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      
      {/* Coordinate system - adjust grid size dynamically but keep axis at 10 units */}
      <Grid size={gridSize} divisions={gridSize} />
      <Axis length={10} />
      
      {/* Matrix dimension visualization */}
      {dimensionVisualization}
      
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
