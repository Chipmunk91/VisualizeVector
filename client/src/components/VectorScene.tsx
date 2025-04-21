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
  
  // Determine transformation characteristics for visualization
  const getTransformationSpace = useMemo(() => {
    // Only compute if visualization is enabled
    if (!showDimensionVisualization) {
      return {
        rank1Direction: new THREE.Vector3(1, 0, 0),
        rank2Normal: new THREE.Vector3(0, 0, 1),
        rank2Basis1: new THREE.Vector3(1, 0, 0),
        rank2Basis2: new THREE.Vector3(0, 1, 0)
      };
    }
    
    // Get matrix values
    const m = matrix.values;
    console.log("Matrix for transformation space:", m);
    
    // For a 3x3 matrix
    if (m.length === 3 && m[0].length === 3) {
      // Create the column vectors of the matrix (these define the transformation)
      const colVec1 = new THREE.Vector3(m[0][0], m[1][0], m[2][0]);
      const colVec2 = new THREE.Vector3(m[0][1], m[1][1], m[2][1]);
      const colVec3 = new THREE.Vector3(m[0][2], m[1][2], m[2][2]);
      
      // For rank 1 (line): The column with largest magnitude determines the direction
      const magnitudes = [
        { vec: colVec1, mag: colVec1.length() },
        { vec: colVec2, mag: colVec2.length() },
        { vec: colVec3, mag: colVec3.length() }
      ];
      
      // Sort by magnitude
      magnitudes.sort((a, b) => b.mag - a.mag);
      
      // Get primary direction (largest column vector)
      let rank1Direction = magnitudes[0].vec.clone().normalize();
      
      // Handle zero vectors
      if (magnitudes[0].mag < 0.00001) {
        rank1Direction = new THREE.Vector3(1, 0, 0);
      }
      
      // For rank 2 (plane): Find two linearly independent column vectors
      let rank2Basis1 = rank1Direction.clone();
      let rank2Basis2 = new THREE.Vector3();
      
      // Try to find a second linearly independent vector
      if (magnitudes[1].mag > 0.00001) {
        // Get second vector
        const secondVec = magnitudes[1].vec.clone();
        
        // Make it orthogonal to the first
        secondVec.sub(rank1Direction.clone().multiplyScalar(
          secondVec.dot(rank1Direction)
        ));
        
        // Normalize
        if (secondVec.length() > 0.00001) {
          rank2Basis2 = secondVec.normalize();
        } else if (magnitudes[2].mag > 0.00001) {
          // Try the third vector if second is dependent
          const thirdVec = magnitudes[2].vec.clone();
          thirdVec.sub(rank1Direction.clone().multiplyScalar(
            thirdVec.dot(rank1Direction)
          ));
          
          if (thirdVec.length() > 0.00001) {
            rank2Basis2 = thirdVec.normalize();
          } else {
            // Fallback: construct an orthogonal vector
            if (Math.abs(rank1Direction.x) < 0.9) {
              rank2Basis2.set(1, 0, 0).sub(
                rank1Direction.clone().multiplyScalar(rank1Direction.x)
              ).normalize();
            } else {
              rank2Basis2.set(0, 1, 0).sub(
                rank1Direction.clone().multiplyScalar(rank1Direction.y)
              ).normalize();
            }
          }
        } else {
          // Fallback: construct an orthogonal vector
          if (Math.abs(rank1Direction.x) < 0.9) {
            rank2Basis2.set(1, 0, 0).sub(
              rank1Direction.clone().multiplyScalar(rank1Direction.x)
            ).normalize();
          } else {
            rank2Basis2.set(0, 1, 0).sub(
              rank1Direction.clone().multiplyScalar(rank1Direction.y)
            ).normalize();
          }
        }
      } else {
        // Fallback: construct an orthogonal vector
        if (Math.abs(rank1Direction.x) < 0.9) {
          rank2Basis2.set(1, 0, 0).sub(
            rank1Direction.clone().multiplyScalar(rank1Direction.x)
          ).normalize();
        } else {
          rank2Basis2.set(0, 1, 0).sub(
            rank1Direction.clone().multiplyScalar(rank1Direction.y)
          ).normalize();
        }
      }
      
      // Calculate normal vector to the plane
      const rank2Normal = new THREE.Vector3().crossVectors(rank1Direction, rank2Basis2).normalize();
      
      console.log("Transformation space computed:", {
        rank1Direction, 
        rank2Normal,
        rank2Basis1: rank1Direction,
        rank2Basis2
      });
      
      return {
        rank1Direction,
        rank2Normal,
        rank2Basis1: rank1Direction,
        rank2Basis2
      };
    }
    
    // Default fallback
    return {
      rank1Direction: new THREE.Vector3(1, 0, 0),
      rank2Normal: new THREE.Vector3(0, 0, 1),
      rank2Basis1: new THREE.Vector3(1, 0, 0),
      rank2Basis2: new THREE.Vector3(0, 1, 0)
    };
  }, [matrix.values, showDimensionVisualization]);
  
  // Create visualization elements based on rank
  const dimensionVisualization = useMemo(() => {
    if (!showDimensionVisualization) return null;
    
    console.log(`Visualizing matrix with rank ${matrixRank}`);
    
    // Size of visualization (adjusted to match grid)
    const size = 5;
    
    // Get transformation space info
    const transformSpace = getTransformationSpace;
    
    // Create quaternion to rotate to align with principal direction
    const quaternion = new THREE.Quaternion();
    if (matrixRank === 1) {
      // For rank 1, align cylinder with principal direction
      const startVec = new THREE.Vector3(0, 0, 1); // Default cylinder orientation
      quaternion.setFromUnitVectors(startVec, transformSpace.rank1Direction);
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
      // Get basis and normal vectors from transformation space
      
      // Create a quaternion to align the plane with the matrix's column vectors
      const planeQuaternion = new THREE.Quaternion();
      const defaultNormal = new THREE.Vector3(0, 0, 1); // Default plane normal
      
      // Rotate to match transformation space
      planeQuaternion.setFromUnitVectors(defaultNormal, transformSpace.rank2Normal);
      
      return (
        <group quaternion={planeQuaternion.toArray()}>
          <mesh>
            <planeGeometry args={[size * 2, size * 2]} />
            <meshStandardMaterial color="#00BFFF" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    } else if (matrixRank === 3) {
      // Rank 3: Space visualization (3D)
      // Using very low opacity to ensure vectors remain clearly visible
      return (
        <mesh>
          <boxGeometry args={[size * 2, size * 2, size * 2]} />
          <meshStandardMaterial color="#FF6347" transparent opacity={0.05} />
        </mesh>
      );
    }
    
    return null;
  }, [matrixRank, showDimensionVisualization, getTransformationSpace]);
  
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
