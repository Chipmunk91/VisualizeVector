import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useVectorStore, Vector as VectorType } from "../lib/stores/useVectorStore";
import Grid from "./Grid";
import Axis from "./Axis";
import Vector from "./Vector";

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

const VectorScene = () => {
  const { vectors } = useVectorStore();
  const { camera } = useThree();
  const [allVectors, setAllVectors] = useState<VectorType[]>([...defaultVectors]);
  
  // Combine user vectors with default vectors
  useEffect(() => {
    console.log("Rendering VectorScene with vectors:", vectors);
    setAllVectors([...defaultVectors, ...vectors]);
  }, [vectors]);
  
  // Adjust camera to show all vectors
  useEffect(() => {
    if (vectors.length === 0) {
      // Reset to default view if no vectors
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Only recalculate camera position for significant changes
    // Find the furthest vector to ensure all are visible
    let maxDistance = 0;
    
    vectors.forEach(vector => {
      if (!vector.visible) return;
      
      const distance = Math.sqrt(
        vector.components.reduce((sum, component) => sum + component * component, 0)
      );
      
      maxDistance = Math.max(maxDistance, distance);
    });
    
    // Ensure camera is far enough to show all vectors
    // with a minimum distance and some extra space
    const minDistance = 5;
    const padding = 2;
    const optimalDistance = Math.max(minDistance, maxDistance + padding);
    
    // Maintain camera angle but adjust distance
    const direction = camera.position.clone().normalize();
    camera.position.copy(direction.multiplyScalar(optimalDistance));
    camera.lookAt(0, 0, 0);
    
  }, [vectors, camera]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      
      {/* Coordinate system */}
      <Grid size={10} divisions={10} />
      <Axis />
      
      {/* Debug sphere at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Render all visible vectors (including defaults) */}
      {allVectors.filter(v => v.visible).map((vector) => (
        <Vector 
          key={vector.id} 
          vector={vector} 
        />
      ))}
    </>
  );
};

export default VectorScene;
