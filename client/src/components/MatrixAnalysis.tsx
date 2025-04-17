import React from "react";
import { useMatrixStore } from "../lib/stores/useMatrixStore";
import { 
  calculateDeterminant,
  calculateTrace,
  calculateEigenvalues,
  calculateSingularValues,
  isMatrixInvertible
} from "../lib/math";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const MatrixAnalysis = () => {
  const { matrix } = useMatrixStore();
  const [rows, cols] = matrix.dimension.split('x').map(Number);
  
  // Check if the matrix is square (for eigenvalues, etc.)
  const isSquare = rows === cols;
  
  // Calculate matrix properties
  const determinant = isSquare ? calculateDeterminant(matrix) : null;
  const trace = isSquare ? calculateTrace(matrix) : null;
  const eigenvalues = isSquare ? calculateEigenvalues(matrix) : null;
  const singularValues = calculateSingularValues(matrix);
  const invertible = isSquare ? isMatrixInvertible(matrix) : null;

  return (
    <Card className="mb-4 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Matrix Analysis</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium">Dimension:</p>
            <p>{rows}×{cols}</p>
          </div>
          
          {isSquare && (
            <>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">Invertible:</p>
                <p>
                  {invertible === true && "Yes"}
                  {invertible === false && "No (singular)"}
                  {invertible === null && "Unknown"}
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">Determinant:</p>
                <p>{determinant !== null ? determinant.toFixed(4) : "N/A"}</p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">Trace:</p>
                <p>{trace !== null ? trace.toFixed(4) : "N/A"}</p>
              </div>
            </>
          )}
          
          {singularValues && singularValues.length > 0 && (
            <div className="bg-muted p-3 rounded-md col-span-2">
              <p className="font-medium">Singular Values:</p>
              <p>[{singularValues.map(v => v.toFixed(4)).join(", ")}]</p>
            </div>
          )}
          
          {eigenvalues && eigenvalues.length > 0 && (
            <div className="bg-muted p-3 rounded-md col-span-2">
              <p className="font-medium">Eigenvalues:</p>
              <p>[{eigenvalues.map(v => v.toFixed(4)).join(", ")}]</p>
            </div>
          )}
        </div>
        
        {/* Matrix Visualization */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Matrix Visualization</h3>
          <div className="bg-muted p-3 rounded-md flex justify-center">
            <div className="inline-block border-2 border-border rounded-md">
              {matrix.values.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((val, colIdx) => (
                    <div 
                      key={`${rowIdx}-${colIdx}`} 
                      className="p-2 text-center min-w-[60px]"
                      style={{
                        // Highlight diagonal elements
                        backgroundColor: rowIdx === colIdx ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        // Use color intensity to represent magnitude
                        color: `rgba(0, 0, 0, ${Math.min(0.9, Math.abs(val) * 0.2 + 0.5)})`
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Matrix Types */}
        {isSquare && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Matrix Classification</h3>
            <div className="bg-muted p-3 rounded-md">
              <ul className="space-y-1">
                {isDiagonal(matrix.values) && (
                  <li>✓ Diagonal matrix (only diagonal elements are non-zero)</li>
                )}
                {isIdentity(matrix.values) && (
                  <li>✓ Identity matrix (diagonal elements are 1, others are 0)</li>
                )}
                {isSymmetric(matrix.values) && (
                  <li>✓ Symmetric matrix (equal to its transpose)</li>
                )}
                {isUpperTriangular(matrix.values) && (
                  <li>✓ Upper triangular matrix (all elements below diagonal are 0)</li>
                )}
                {isLowerTriangular(matrix.values) && (
                  <li>✓ Lower triangular matrix (all elements above diagonal are 0)</li>
                )}
                {isOrthogonal(matrix.values) && (
                  <li>✓ Orthogonal matrix (inverse equals transpose)</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions to determine matrix types
function isDiagonal(matrix: number[][]): boolean {
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
  }
  
  return true;
}

function isIdentity(matrix: number[][]): boolean {
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Check diagonal elements are 1 and off-diagonal elements are 0
      if ((i === j && Math.abs(matrix[i][j] - 1) > 1e-10) || 
          (i !== j && Math.abs(matrix[i][j]) > 1e-10)) {
        return false;
      }
    }
  }
  
  return true;
}

function isSymmetric(matrix: number[][]): boolean {
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(matrix[i][j] - matrix[j][i]) > 1e-10) {
        return false;
      }
    }
  }
  
  return true;
}

function isUpperTriangular(matrix: number[][]): boolean {
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
  }
  
  return true;
}

function isLowerTriangular(matrix: number[][]): boolean {
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
  }
  
  return true;
}

function isOrthogonal(matrix: number[][]): boolean {
  const n = matrix.length;
  
  // For a matrix to be orthogonal, its columns (or rows) must be orthonormal
  // Check for orthogonality by computing dot products of columns
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Calculate dot product of columns i and j
      let dotProduct = 0;
      for (let k = 0; k < n; k++) {
        dotProduct += matrix[k][i] * matrix[k][j];
      }
      
      // Check if dot product is 1 for i=j and 0 for i≠j (allowing for small errors)
      const expected = i === j ? 1 : 0;
      if (Math.abs(dotProduct - expected) > 1e-8) {
        return false;
      }
    }
  }
  
  return true;
}

export default MatrixAnalysis;