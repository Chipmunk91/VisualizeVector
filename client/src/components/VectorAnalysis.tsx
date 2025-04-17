import React, { useMemo } from 'react';
import { useVectorStore } from '../lib/stores/useVectorStore';
import { useMatrixStore } from '../lib/stores/useMatrixStore';
import { 
  calculateMagnitude, 
  dotProduct, 
  crossProduct, 
  vectorDistance, 
  applyMatrixTransformation 
} from '../lib/math';

// Format numbers to be more readable
const formatNumber = (num: number): string => {
  // Round to 2 decimal places
  return Number(num.toFixed(2)).toString();
};

const VectorAnalysis: React.FC = () => {
  const { vectors } = useVectorStore();
  const { matrix, showTransformed } = useMatrixStore();
  
  // Get only the original vectors (not transformed)
  const originalVectors = useMemo(() => 
    vectors.filter(v => !v.isTransformed && v.visible), 
    [vectors]
  );
  
  // Get transformed vectors
  const transformedVectors = useMemo(() => 
    vectors.filter(v => v.isTransformed && v.visible), 
    [vectors]
  );
  
  // Calculate dot products between vectors
  const dotProducts = useMemo(() => {
    const results = [];
    
    // Only calculate if there are at least 2 vectors
    if (originalVectors.length >= 2) {
      for (let i = 0; i < originalVectors.length; i++) {
        for (let j = i + 1; j < originalVectors.length; j++) {
          const v1 = originalVectors[i];
          const v2 = originalVectors[j];
          const dot = dotProduct(v1.components, v2.components);
          
          if (dot !== null) {
            results.push({
              label: `${v1.label} · ${v2.label}`,
              value: formatNumber(dot)
            });
          }
        }
      }
    }
    
    return results;
  }, [originalVectors]);
  
  // Calculate cross products (only for 3D vectors)
  const crossProducts = useMemo(() => {
    const results = [];
    
    // Only calculate if there are at least 2 vectors with 3 components
    if (originalVectors.length >= 2) {
      for (let i = 0; i < originalVectors.length; i++) {
        for (let j = i + 1; j < originalVectors.length; j++) {
          const v1 = originalVectors[i];
          const v2 = originalVectors[j];
          
          if (v1.components.length === 3 && v2.components.length === 3) {
            const cross = crossProduct(v1.components, v2.components);
            
            if (cross !== null) {
              results.push({
                label: `${v1.label} × ${v2.label}`,
                value: `[${cross.map(formatNumber).join(', ')}]`
              });
            }
          }
        }
      }
    }
    
    return results;
  }, [originalVectors]);
  
  // Calculate vector magnitudes
  const magnitudes = useMemo(() => {
    return originalVectors.map(v => ({
      label: `|${v.label}|`,
      value: formatNumber(calculateMagnitude(v.components))
    }));
  }, [originalVectors]);
  
  // Calculate transformation differences for transformed vectors
  const transformationDeltas = useMemo(() => {
    const results = [];
    
    if (showTransformed) {
      for (const transformedVector of transformedVectors) {
        const originalId = transformedVector.originalId;
        if (originalId) {
          const originalVector = originalVectors.find(v => v.id === originalId);
          
          if (originalVector) {
            // Calculate distance between original and transformed vector
            const distance = vectorDistance(
              originalVector.components, 
              transformedVector.components
            );
            
            if (distance !== null) {
              results.push({
                label: `Δ ${originalVector.label}`,
                value: formatNumber(distance)
              });
            }
            
            // Calculate angle change (future feature)
          }
        }
      }
    }
    
    return results;
  }, [originalVectors, transformedVectors, showTransformed]);
  
  // Determine if the current matrix is a special type
  const matrixProperties = useMemo(() => {
    const properties = [];
    const matrixValues = matrix.values;
    
    // Only check square matrices
    if (matrixValues.length === matrixValues[0].length) {
      const n = matrixValues.length;
      
      // Check if identity
      let isIdentity = true;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j && Math.abs(matrixValues[i][j] - 1) > 0.001) {
            isIdentity = false;
            break;
          } else if (i !== j && Math.abs(matrixValues[i][j]) > 0.001) {
            isIdentity = false;
            break;
          }
        }
      }
      
      if (isIdentity) {
        properties.push({
          label: 'Matrix Type',
          value: 'Identity'
        });
      }
      
      // Check if diagonal
      let isDiagonal = true;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j && Math.abs(matrixValues[i][j]) > 0.001) {
            isDiagonal = false;
            break;
          }
        }
      }
      
      if (isDiagonal && !isIdentity) {
        properties.push({
          label: 'Matrix Type',
          value: 'Diagonal'
        });
      }
      
      // Check if symmetric
      let isSymmetric = true;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (Math.abs(matrixValues[i][j] - matrixValues[j][i]) > 0.001) {
            isSymmetric = false;
            break;
          }
        }
      }
      
      if (isSymmetric && !isIdentity && !isDiagonal) {
        properties.push({
          label: 'Matrix Type',
          value: 'Symmetric'
        });
      }
    }
    
    return properties;
  }, [matrix]);
  
  // If no vectors are visible, show a message
  if (originalVectors.length === 0) {
    return (
      <div className="p-3 bg-muted rounded-md text-sm">
        <p>No vectors present. Add vectors to see their characteristics.</p>
      </div>
    );
  }
  
  return (
    <div className="p-3 bg-muted rounded-md text-sm max-h-[300px] overflow-y-auto">
      <p className="font-bold mb-2">Vector Analysis</p>
      
      {/* Magnitudes */}
      {magnitudes.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Magnitudes:</p>
          <ul className="ml-2">
            {magnitudes.map((item, index) => (
              <li key={`mag-${index}`} className="truncate">
                {item.label} = {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Dot Products */}
      {dotProducts.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Dot Products:</p>
          <ul className="ml-2">
            {dotProducts.map((item, index) => (
              <li key={`dot-${index}`} className="truncate">
                {item.label} = {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Cross Products */}
      {crossProducts.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Cross Products:</p>
          <ul className="ml-2">
            {crossProducts.map((item, index) => (
              <li key={`cross-${index}`} className="truncate">
                {item.label} = {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Transformation Deltas */}
      {transformationDeltas.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Transformation Distances:</p>
          <ul className="ml-2">
            {transformationDeltas.map((item, index) => (
              <li key={`delta-${index}`} className="truncate">
                {item.label} = {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Matrix Properties */}
      {matrixProperties.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Matrix Properties:</p>
          <ul className="ml-2">
            {matrixProperties.map((item, index) => (
              <li key={`prop-${index}`} className="truncate">
                {item.label}: {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VectorAnalysis;