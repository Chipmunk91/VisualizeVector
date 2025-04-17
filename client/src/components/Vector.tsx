import { useMemo } from "react";
import * as THREE from "three";
import { Vector as VectorType } from "../lib/stores/useVectorStore";
import { Text } from "@react-three/drei";

interface VectorProps {
  vector: VectorType;
}

const Vector = ({ vector }: VectorProps) => {
  const components = vector.components;
  const isTransformed = vector.isTransformed;
  
  // Origin is always (0,0,0)
  const start = new THREE.Vector3(0, 0, 0);
  
  // End point depends on vector dimensions
  const end = useMemo(() => {
    if (components.length === 2) {
      return new THREE.Vector3(components[0], components[1], 0);
    } else {
      return new THREE.Vector3(components[0], components[1], components[2]);
    }
  }, [components]);

  // Calculate midpoint for label placement
  const midPoint = useMemo(() => {
    return new THREE.Vector3(
      start.x + (end.x - start.x) * 0.5,
      start.y + (end.y - start.y) * 0.5,
      start.z + (end.z - start.z) * 0.5
    );
  }, [start, end]);

  // Arrow parameters
  const arrowLength = end.distanceTo(start);
  const arrowDirection = new THREE.Vector3().subVectors(end, start).normalize();
  
  // Convert color string to THREE.Color
  const threeColor = new THREE.Color(vector.color);
  
  // Adjust opacity and size for transformed vectors
  const opacity = isTransformed ? 0.6 : 1;
  const arrowHeadSize = isTransformed ? 0.15 : 0.2;
  const lineWidth = isTransformed ? 2 : 3;
  
  return (
    <group>
      {/* Arrow line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          attach="material" 
          color={threeColor} 
          linewidth={lineWidth} 
          opacity={opacity}
          transparent={isTransformed}
        />
      </line>
      
      {/* Arrow head (cone) */}
      <mesh 
        position={end}
        rotation={arrowDirection.x || arrowDirection.z ? new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), 
            arrowDirection
          )
        ) : undefined}
      >
        <coneGeometry args={[arrowHeadSize, arrowHeadSize * 2, 8]} />
        <meshStandardMaterial 
          color={threeColor} 
          opacity={opacity} 
          transparent={isTransformed}
        />
      </mesh>
      
      {/* Vector label */}
      <Text
        position={midPoint}
        fontSize={0.2}
        color={vector.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {isTransformed ? `T(${vector.label})` : vector.label}
      </Text>
      
      {/* Component values at the end point */}
      <Text
        position={[end.x + 0.2, end.y + 0.2, end.z + 0.2]}
        fontSize={0.15}
        color={vector.color}
        anchorX="left"
        anchorY="top"
        font="/fonts/inter.json"
      >
        {`(${components.join(', ')})`}
      </Text>
    </group>
  );
};

export default Vector;
