import * as THREE from "three";

// Simplified Axis component without Text elements
const Axis = () => {
  // Define axis length
  const axisLength = 10;
  
  // Debug info
  console.log("Rendering Axis component, length:", axisLength);
  
  return (
    <group>
      {/* X Axis (Red) - Thick line */}
      <mesh position={[axisLength/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.05, 0.05, axisLength, 8]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Y Axis (Green) - Thick line */}
      <mesh position={[0, axisLength/2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, axisLength, 8]} />
        <meshStandardMaterial color="green" />
      </mesh>
      
      {/* Z Axis (Blue) - Thick line */}
      <mesh position={[0, 0, axisLength/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, axisLength, 8]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      
      {/* Large sphere at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Cone at the end of X axis */}
      <mesh position={[axisLength, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Cone at the end of Y axis */}
      <mesh position={[0, axisLength, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="green" />
      </mesh>
      
      {/* Cone at the end of Z axis */}
      <mesh position={[0, 0, axisLength]} rotation={[Math.PI/2, 0, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

export default Axis;
