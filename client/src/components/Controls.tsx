import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

// This component adds orbit controls to the scene
const Controls = () => {
  const { camera, gl } = useThree();
  
  // Adjust default control settings
  useEffect(() => {
    // Ensure camera stays focused on origin
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.5}
      panSpeed={0.5}
      minDistance={2}
      maxDistance={20}
      makeDefault
    />
  );
};

export default Controls;
