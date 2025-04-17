import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// This component adds orbit controls to the scene without resetting camera position
const Controls = () => {
  const { camera, gl } = useThree();

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
