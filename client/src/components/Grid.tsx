import * as THREE from "three";
import { useEffect } from "react";

interface GridProps {
  size?: number;
  divisions?: number;
  color?: string;
}

const Grid = ({ size = 10, divisions = 10, color = "#444444" }: GridProps) => {
  // Define the extended grid size
  const extendedSize = 100;
  
  // Adjust divisions to maintain the same grid density
  const extendedDivisions = Math.floor(divisions * (extendedSize / size));
  
  // Keep a small background plane of original size to avoid visual difference
  const backgroundPlaneSize = size;
  
  // Debug logging
  useEffect(() => {
    console.log("Rendering Grid component, size:", extendedSize, "divisions:", extendedDivisions);
  }, [extendedSize, extendedDivisions]);

  return (
    <>
      {/* XY Grid (horizontal) */}
      <gridHelper
        args={[extendedSize, extendedDivisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* XZ Grid (vertical along X) */}
      <gridHelper
        args={[extendedSize, extendedDivisions, color, color]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* YZ Grid (vertical along Y) */}
      <gridHelper
        args={[extendedSize, extendedDivisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      
      {/* Light gray background plane - keep at original size */}
      <mesh 
        position={[0, -0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[backgroundPlaneSize, backgroundPlaneSize]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          transparent={true} 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default Grid;
