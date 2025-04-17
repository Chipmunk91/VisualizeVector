import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

// This component adds orbit controls to the scene
const Controls = () => {
  const { camera, gl } = useThree();
  
  // Set initial camera position on mount
  useEffect(() => {
    console.log("Setting initial camera position");
    
    // Position for good viewing angle of 3D space
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
    
    // Log camera position for debugging
    console.log("Camera position:", camera.position);
  }, [camera]);

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      panSpeed={0.8}
      minDistance={1}
      maxDistance={50}
      makeDefault
    />
  );
};

export default Controls;
