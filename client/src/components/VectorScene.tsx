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
    
    // Handle non-square matrices
    const [rows, cols] = matrix.dimension.split('x').map(Number);
    
    // For non-square matrices, the rank is at most min(rows, cols)
    // and we need a specific approach
    if (rows !== cols) {
      console.log(`Non-square matrix detected: ${rows}x${cols}`);
      
      // A 3x2 matrix can at most have rank 2 (maps to a plane)
      // A 2x3 matrix can at most have rank 2 (maps from a plane)
      return Math.min(calculateMatrixRank(matrix.values), Math.min(rows, cols));
    }
    
    return calculateMatrixRank(matrix.values);
  }, [matrix.values, matrix.dimension, showDimensionVisualization]);
  
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
    
    // Get matrix dimensions
    const [rows, cols] = matrix.dimension.split('x').map(Number);
    console.log(`Processing matrix with dimensions ${rows}x${cols}`);
    
    // For 3x3 matrices and non-square matrices
    if (m.length > 0 && m[0].length > 0) {
      // Create the column vectors of the matrix (these define the transformation)
      // Handle different matrix dimensions
      let colVec1, colVec2, colVec3;
      
      // Fill column vectors based on matrix dimensions, with zeros for missing values
      if (rows === 3) {
        colVec1 = new THREE.Vector3(
          cols > 0 ? m[0][0] : 0, 
          cols > 0 ? m[1][0] : 0, 
          cols > 0 ? m[2][0] : 0
        );
        colVec2 = new THREE.Vector3(
          cols > 1 ? m[0][1] : 0, 
          cols > 1 ? m[1][1] : 0, 
          cols > 1 ? m[2][1] : 0
        );
        colVec3 = new THREE.Vector3(
          cols > 2 ? m[0][2] : 0, 
          cols > 2 ? m[1][2] : 0, 
          cols > 2 ? m[2][2] : 0
        );
      } else if (rows === 2) {
        // For 2-row matrices, we use z=0 for the third component
        colVec1 = new THREE.Vector3(
          cols > 0 ? m[0][0] : 0, 
          cols > 0 ? m[1][0] : 0, 
          0
        );
        colVec2 = new THREE.Vector3(
          cols > 1 ? m[0][1] : 0, 
          cols > 1 ? m[1][1] : 0, 
          0
        );
        colVec3 = new THREE.Vector3(
          cols > 2 ? m[0][2] : 0, 
          cols > 2 ? m[1][2] : 0, 
          0
        );
      } else {
        // Default case
        colVec1 = new THREE.Vector3(
          cols > 0 && m[0] ? m[0][0] : 0, 
          0, 
          0
        );
        colVec2 = new THREE.Vector3(
          cols > 1 && m[0] ? m[0][1] : 0, 
          0, 
          0
        );
        colVec3 = new THREE.Vector3(
          cols > 2 && m[0] ? m[0][2] : 0, 
          0, 
          0
        );
      }
      
      console.log("Column vectors:", { colVec1, colVec2, colVec3 });
      
      // For rank 1 matrices with specific patterns like [[1,0,0],[0,0,0],[0,0,0]], 
      // we need direct checking rather than just magnitudes
      
      // Special case check for specific axes-aligned matrices
      // Only apply these checks for 3x3 matrices
      if (rows === 3 && cols === 3) {
        if (m[0][0] !== 0 && m[1][0] === 0 && m[2][0] === 0 && 
            m[0][1] === 0 && m[1][1] === 0 && m[2][1] === 0 && 
            m[0][2] === 0 && m[1][2] === 0 && m[2][2] === 0) {
          // Case for X-axis aligned transformation [[x,0,0],[0,0,0],[0,0,0]]
          console.log("Special case: X-axis aligned matrix");
          // Force to exact axes for visualization purposes
          return {
            rank1Direction: new THREE.Vector3(1, 0, 0).normalize(),
            rank2Normal: new THREE.Vector3(0, 0, 1).normalize(),
            rank2Basis1: new THREE.Vector3(1, 0, 0).normalize(),
            rank2Basis2: new THREE.Vector3(0, 1, 0).normalize()
          };
        } else if (m[0][0] === 0 && m[1][0] !== 0 && m[2][0] === 0 && 
                  m[0][1] === 0 && m[1][1] === 0 && m[2][1] === 0 && 
                  m[0][2] === 0 && m[1][2] === 0 && m[2][2] === 0) {
          // Case for Y-axis aligned transformation [[0,0,0],[y,0,0],[0,0,0]]
          console.log("Special case: Y-axis aligned matrix");
          return {
            rank1Direction: new THREE.Vector3(0, 1, 0),
            rank2Normal: new THREE.Vector3(0, 0, 1),
            rank2Basis1: new THREE.Vector3(0, 1, 0),
            rank2Basis2: new THREE.Vector3(1, 0, 0)
          };
        } else if (m[0][0] === 0 && m[1][0] === 0 && m[2][0] !== 0 && 
                  m[0][1] === 0 && m[1][1] === 0 && m[2][1] === 0 && 
                  m[0][2] === 0 && m[1][2] === 0 && m[2][2] === 0) {
          // Case for Z-axis aligned transformation [[0,0,0],[0,0,0],[z,0,0]]
          console.log("Special case: Z-axis aligned matrix");
          return {
            rank1Direction: new THREE.Vector3(0, 0, 1),
            rank2Normal: new THREE.Vector3(1, 0, 0),
            rank2Basis1: new THREE.Vector3(0, 0, 1),
            rank2Basis2: new THREE.Vector3(0, 1, 0)
          };
        }
      }
      
      // Special case for 3x2 (matrix-vector) product which should map to a plane
      if (rows === 3 && cols === 2) {
        // Ensure we handle specifically the [[1,2],[3,4],[5,6]] case which maps to a plane in 3D
        console.log("Special case: 3x2 matrix (maps to a plane)");
        
        // Calculate the normal vector to the plane (cross product of the columns)
        const normal = new THREE.Vector3().crossVectors(colVec1, colVec2).normalize();
        
        return {
          rank1Direction: colVec1.clone().normalize(),
          rank2Normal: normal,
          rank2Basis1: colVec1.clone().normalize(),
          rank2Basis2: colVec2.clone().normalize()
        };
      }
      
      // For other cases, use the general approach with magnitudes
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
  }, [matrix.values, matrix.dimension, showDimensionVisualization]);
  
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
      console.log("Aligning rank 1 visualization with direction:", 
                 JSON.stringify(transformSpace.rank1Direction));
      
      // Cylinders by default are oriented along the Y axis in Three.js, not Z
      // So we need to align from Y to our target direction
      const startVec = new THREE.Vector3(0, 1, 0); // Default cylinder orientation (Y-axis)
      
      // Special case for axis-aligned matrices
      if (Math.abs(transformSpace.rank1Direction.x) > 0.9 && 
          Math.abs(transformSpace.rank1Direction.y) < 0.1 && 
          Math.abs(transformSpace.rank1Direction.z) < 0.1) {
        // X-axis case, use direct orientation
        console.log("Using direct X-axis orientation");
        // We'll rotate 90 degrees around Z to go from Y to X
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2);
      } else if (Math.abs(transformSpace.rank1Direction.y) > 0.9 && 
                Math.abs(transformSpace.rank1Direction.x) < 0.1 && 
                Math.abs(transformSpace.rank1Direction.z) < 0.1) {
        // Y-axis case, no rotation needed
        console.log("Using direct Y-axis orientation");
        quaternion.identity();
      } else if (Math.abs(transformSpace.rank1Direction.z) > 0.9 && 
                Math.abs(transformSpace.rank1Direction.x) < 0.1 && 
                Math.abs(transformSpace.rank1Direction.y) < 0.1) {
        // Z-axis case, use direct orientation
        console.log("Using direct Z-axis orientation");
        // We'll rotate 90 degrees around X to go from Y to Z
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2);
      } else {
        // General case
        quaternion.setFromUnitVectors(startVec, transformSpace.rank1Direction);
      }
    }
    
    if (matrixRank === 1) {
      // Rank 1: Line visualization (1D)
      return (
        <group quaternion={quaternion.toArray()}>
          {/* Show cylinder along the direction */}
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, size * 2, 16]} />
            <meshStandardMaterial color="#7F00FF" transparent opacity={0.3} />
          </mesh>
          
          {/* Add small spheres at each end to make direction more visible */}
          <mesh position={[0, size, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#7F00FF" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, -size, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#7F00FF" transparent opacity={0.5} />
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
