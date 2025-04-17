import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// This component adds orbit controls to the scene without resetting camera position
const Controls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Set up global event listeners to disable orbit controls during drag
  useEffect(() => {
    // Listen for a custom event that can disable/enable controls during vector dragging
    const disableControls = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    };
    
    const enableControls = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };
    
    // Listen for mousedown/mouseup on the whole document
    document.addEventListener('vectorDragStart', disableControls);
    document.addEventListener('vectorDragEnd', enableControls);
    
    return () => {
      document.removeEventListener('vectorDragStart', disableControls);
      document.removeEventListener('vectorDragEnd', enableControls);
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
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
