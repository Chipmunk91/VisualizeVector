import { Vector } from "./stores/useVectorStore";
import { Matrix } from "./stores/useMatrixStore";
import { create, all } from "mathjs";

// Configure math.js for our needs
const math = create(all);

/**
 * Apply a matrix transformation to a vector
 * @param matrix The transformation matrix
 * @param vector The vector to transform
 * @returns A new transformed vector or null if incompatible dimensions
 */
export function applyMatrixTransformation(
  matrix: Matrix,
  vector: Vector
): Vector | null {
  const [mRows, mCols] = matrix.dimension.split('x').map(Number);
  const vDim = vector.components.length;
  
  // Check compatibility
  if (mCols !== vDim) {
    console.warn(`Matrix-vector dimension mismatch: ${mCols} columns ≠ ${vDim} vector dimensions`);
    return null;
  }
  
  try {
    // Convert to math.js matrix and vector
    const matrixArray = matrix.values;
    const vectorArray = vector.components;
    
    // Perform matrix multiplication
    const result = math.multiply(matrixArray, vectorArray);
    
    // Convert result back to array
    const resultArray = Array.isArray(result) ? result : [result];
    
    // Create a new vector with the transformed components
    return {
      id: `transformed-${vector.id}`,
      components: resultArray,
      color: vector.color,
      label: vector.label,
      visible: true,
      isTransformed: true,
      originalId: vector.id,
    };
  } catch (error) {
    console.error("Error applying transformation:", error);
    return null;
  }
}

/**
 * Calculate the magnitude (length) of a vector
 * @param components Vector components
 * @returns The magnitude of the vector
 */
export function calculateMagnitude(components: number[]): number {
  return Math.sqrt(components.reduce((sum, component) => sum + component * component, 0));
}

/**
 * Calculate the dot product of two vectors
 * @param v1 First vector components
 * @param v2 Second vector components
 * @returns The dot product or null if dimensions don't match
 */
export function dotProduct(v1: number[], v2: number[]): number | null {
  if (v1.length !== v2.length) {
    return null;
  }
  
  return v1.reduce((sum, component, index) => sum + component * v2[index], 0);
}

/**
 * Calculate the cross product of two 3D vectors
 * @param v1 First vector components
 * @param v2 Second vector components
 * @returns The cross product or null if both aren't 3D
 */
export function crossProduct(v1: number[], v2: number[]): number[] | null {
  if (v1.length !== 3 || v2.length !== 3) {
    return null;
  }
  
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
}
