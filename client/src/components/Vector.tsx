import { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Vector as VectorType } from "../lib/stores/useVectorStore";
import { useVectorStore } from "../lib/stores/useVectorStore";
import { useDrag } from "@use-gesture/react";
import { useThree } from "@react-three/fiber";

interface VectorProps {
  vector: VectorType;
}

const Vector = ({ vector }: VectorProps) => {
  const { updateVector } = useVectorStore();
  const { camera, raycaster, size } = useThree();
  const components = vector.components;
  const isTransformed = vector.isTransformed;
  const arrowHeadRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log("Rendering Vector component:", vector);
  }, [vector]);
  
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
  
  // Prevent dragging for transformed vectors
  const isDraggable = !isTransformed;
  
  // Implement drag functionality
  const dragBind = useDrag(
    ({ active, movement: [x, y], initial, event }) => {
      if (!isDraggable) return;
      
      if (event) event.stopPropagation();
      setIsDragging(active);
      
      if (active && arrowHeadRef.current) {
        // Create a plane perpendicular to the camera
        const plane = new THREE.Plane(
          new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
          0
        );
        
        // Create raycaster from initial mouse position
        const initialMouse = new THREE.Vector2(
          (initial[0] / size.width) * 2 - 1,
          -(initial[1] / size.height) * 2 + 1
        );
        raycaster.setFromCamera(initialMouse, camera);
        
        // Find intersection with the plane
        const initialIntersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, initialIntersection);
        
        // Get current mouse position
        const currentMouse = new THREE.Vector2(
          ((initial[0] + x) / size.width) * 2 - 1,
          -((initial[1] + y) / size.height) * 2 + 1
        );
        raycaster.setFromCamera(currentMouse, camera);
        
        // Find current intersection
        const currentIntersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, currentIntersection);
        
        // Calculate movement vector
        const movement = new THREE.Vector3().subVectors(
          currentIntersection,
          initialIntersection
        );
        
        // Calculate new vector components
        let newComponents;
        if (components.length === 2) {
          newComponents = [
            components[0] + movement.x,
            components[1] + movement.y
          ];
        } else {
          newComponents = [
            components[0] + movement.x,
            components[1] + movement.y,
            components[2] + movement.z
          ];
        }
        
        // Update vector in store
        updateVector(vector.id, newComponents);
      }
    },
    { 
      // Only allow dragging if not a transformed vector
      enabled: isDraggable
    }
  );
  
  return (
    <group>
      {/* Visible cylinder for the arrow line */}
      <mesh
        position={midPoint}
        scale={[0.05, arrowLength, 0.05]}
        rotation={arrowDirection.x || arrowDirection.z ? 
          new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0), 
              arrowDirection
            )
          ) 
          : new THREE.Euler(0, 0, 0)}
      >
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshStandardMaterial 
          color={threeColor}
          opacity={opacity}
          transparent={isTransformed}
        />
      </mesh>
      
      {/* Arrow head at the end point - draggable */}
      <mesh 
        ref={arrowHeadRef}
        position={end}
        rotation={arrowDirection.x || arrowDirection.z ? 
          new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0), 
              arrowDirection
            )
          ) 
          : new THREE.Euler(0, 0, 0)}
        {...dragBind()}
        onClick={(e) => {
          e.stopPropagation();
          console.log("Vector clicked:", vector.id);
        }}
      >
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial 
          color={isDragging ? new THREE.Color(0xffffff) : threeColor}
          opacity={opacity}
          transparent={isTransformed}
          emissive={isDragging ? threeColor : undefined}
          emissiveIntensity={isDragging ? 0.5 : 0}
        />
      </mesh>
      
      {/* Small sphere at the origin */}
      <mesh position={start}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={threeColor}
          opacity={opacity * 0.7}
          transparent={true}
        />
      </mesh>
      
      {/* Debug info in useEffect */}
    </group>
  );
};

export default Vector;
