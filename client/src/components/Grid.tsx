import * as THREE from "three";
import { useEffect } from "react";

interface GridProps {
  size?: number;
  divisions?: number;
  color?: string;
}

const Grid = ({ size = 10, divisions = 10, color = "#666666" }: GridProps) => {
  // Debug logging
  useEffect(() => {
    console.log("Rendering Grid component, size:", size, "divisions:", divisions);
  }, [size, divisions]);

  return (
    <>
      {/* XY Grid (horizontal) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* XZ Grid (vertical along X) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* YZ Grid (vertical along Y) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      
      {/* Extra visual grid for debugging */}
      <mesh 
        position={[0, -0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color="#222222" 
          transparent={true} 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default Grid;
