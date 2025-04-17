import React, { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Vector as VectorType } from "../lib/stores/useVectorStore";
import { useVectorStore } from "../lib/stores/useVectorStore";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface VectorProps {
  vector: VectorType;
}

const Vector = ({ vector }: VectorProps) => {
  const { updateVector } = useVectorStore();
  const { camera, mouse } = useThree();
  
  const components = vector.components;
  const isTransformed = vector.isTransformed;
  
  // Create refs for interactive elements
  const arrowHeadRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // State for interaction and tracking
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [originalComponents, setOriginalComponents] = useState<number[]>([]);
  
  // Debug logging (limited to reduce spam)
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

  // Calculate midpoint for arrow placement
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
  const opacity = vector.opacity !== undefined ? vector.opacity : (isTransformed ? 0.6 : 1);
  const arrowHeadSize = isTransformed ? 0.13 : 0.15;
  const lineWidth = isTransformed ? 0.04 : 0.05;
  
  // Prevent dragging for transformed vectors and default axis vectors
  const isDefaultAxis = vector.id === "default-x" || vector.id === "default-y" || vector.id === "default-z";
  const isDraggable = !isTransformed && !isDefaultAxis;
  
  // Use a direct frameloop to handle dragging
  useFrame(() => {
    if (isDragging && isDraggable && dragStart) {
      // Get current viewport mouse position
      const vpMouse = new THREE.Vector2(mouse.x, mouse.y);
      
      if (originalComponents.length > 0) {
        // Calculate delta from drag start
        const sensitivity = 0.3; // Increased for more responsive movement
        const deltaX = (vpMouse.x - dragStart.x) * sensitivity;
        const deltaY = (vpMouse.y - dragStart.y) * sensitivity;
        
        // Get camera right and up vectors for screen-space movement
        const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        
        // Distance factor for scaling movement
        const distanceFactor = Math.max(1, camera.position.length() * 0.1);
        
        let newComponents;
        if (components.length === 2) {
          // 2D vectors move in screen space
          newComponents = [
            originalComponents[0] + deltaX * distanceFactor,
            originalComponents[1] - deltaY * distanceFactor // Flip Y axis for intuitive movement
          ];
        } else {
          // 3D vectors - movement in camera-aligned plane
          newComponents = [
            originalComponents[0] + (deltaX * cameraRight.x - deltaY * cameraUp.x) * distanceFactor,
            originalComponents[1] + (deltaX * cameraRight.y - deltaY * cameraUp.y) * distanceFactor,
            originalComponents[2] + (deltaX * cameraRight.z - deltaY * cameraUp.z) * distanceFactor,
          ];
        }
        
        // Ensure vectors aren't too large or too small
        const length = Math.sqrt(newComponents.reduce((sum, val) => sum + val * val, 0));
        if (length > 20) {
          const scale = 20 / length;
          newComponents = newComponents.map(c => c * scale);
        } else if (length < 0.1) {
          const scale = 0.1 / (length || 0.01); // Avoid division by zero
          newComponents = newComponents.map(c => c * scale);
        }
        
        // Round to 2 decimal places for cleaner display
        newComponents = newComponents.map(val => Math.round(val * 100) / 100);
        
        // Update vector in store
        updateVector(vector.id, newComponents);
      }
    }
  });
  
  // Event handler for starting drag
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggable) return;
    
    // Prevent orbit controls from taking over
    e.stopPropagation();
    // Note: ThreeEvent doesn't have preventDefault directly
    
    // Set a DOM attribute that our Controls can detect
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Flag for dragging a vector to disable camera controls
      canvas.setAttribute('data-vector-element', 'true');
      
      // Set global event listeners to ensure removal of attribute
      const clearAttribute = () => {
        canvas.removeAttribute('data-vector-element');
        setIsDragging(false);
        setDragStart(null);
        window.removeEventListener('mouseup', clearAttribute);
        window.removeEventListener('mouseleave', clearAttribute);
      };
      
      // Start dragging
      setIsDragging(true);
      setDragStart({ x: mouse.x, y: mouse.y });
      setOriginalComponents([...components]);
      
      console.log("Starting drag with mouse at:", mouse.x, mouse.y);
      console.log("Original components:", components);
      
      // Remove when interaction ends
      window.addEventListener('mouseup', clearAttribute);
      window.addEventListener('mouseleave', clearAttribute);
    }
  };
  
  // Use internal state for managing cursor
  const [hovered, setHovered] = useState(false);
  
  // Update cursor style to pointer (hand) when hovering over draggable vector tips
  useEffect(() => {
    if (isDraggable) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }
    
    // Cleanup
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, isDraggable]);
  
  return (
    <group>
      {/* Visible cylinder for the arrow line */}
      <mesh
        position={midPoint}
        scale={[lineWidth, arrowLength, lineWidth]}
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
          transparent={true}
        />
      </mesh>
      
      {/* Arrow head at the end point - draggable */}
      <group
        ref={groupRef}
        position={end}
        rotation={arrowDirection.x || arrowDirection.z ? 
          new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0), 
              arrowDirection
            )
          ) 
          : new THREE.Euler(0, 0, 0)}
      >
        {/* Arrowhead */}
        <mesh 
          ref={arrowHeadRef}
          userData={{ vectorElement: true }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            console.log("Vector clicked:", vector.id);
          }}
          onPointerDown={handlePointerDown}
          onPointerEnter={() => isDraggable && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <coneGeometry args={[hovered && isDraggable ? arrowHeadSize * 1.2 : arrowHeadSize, 0.4, 16]} />
          <meshStandardMaterial 
            color={isDragging ? new THREE.Color(0xffffff) : (hovered && isDraggable ? new THREE.Color(0xffffff) : threeColor)}
            opacity={opacity}
            transparent={true}
            emissive={isDragging || (hovered && isDraggable) ? threeColor : undefined}
            emissiveIntensity={isDragging ? 0.7 : (hovered && isDraggable ? 0.5 : 0)}
          />
        </mesh>
        
        {/* Visual drag handle indicator for non-transformed vectors */}
        {isDraggable && (
          <group position={[0, 0.5, 0]} scale={0.2}>
            {/* Only show drag handles when hovered or dragging */}
            {(hovered || isDragging) && (
              <>
                {/* X handle */}
                <mesh position={[0.6, 0, 0]} scale={[1.2, 0.05, 0.05]}>
                  <boxGeometry />
                  <meshStandardMaterial 
                    color={new THREE.Color("#ff4444")} 
                    emissive={new THREE.Color("#ff4444")}
                    emissiveIntensity={0.5}
                  />
                </mesh>
                
                {/* Y handle */}
                <mesh position={[0, 0.6, 0]} scale={[0.05, 1.2, 0.05]}>
                  <boxGeometry />
                  <meshStandardMaterial 
                    color={new THREE.Color("#44ff44")} 
                    emissive={new THREE.Color("#44ff44")}
                    emissiveIntensity={0.5}
                  />
                </mesh>
                
                {/* Z handle for 3D vectors */}
                {components.length > 2 && (
                  <mesh position={[0, 0, 0.6]} scale={[0.05, 0.05, 1.2]}>
                    <boxGeometry />
                    <meshStandardMaterial 
                      color={new THREE.Color("#4444ff")} 
                      emissive={new THREE.Color("#4444ff")}
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                )}
              </>
            )}
          </group>
        )}
      </group>
      
      {/* Small sphere at the origin */}
      <mesh position={start}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={threeColor}
          opacity={opacity * 0.7}
          transparent={true}
        />
      </mesh>
      
      {/* Only show labels for non-transformed vectors */}
      {vector.visible && !isTransformed && (
        <Text
          position={[end.x, end.y + 0.5, end.z]}
          fontSize={0.4}
          color={vector.color}
          anchorX="center"
          anchorY="bottom"
          fillOpacity={opacity}
          outlineWidth={0.05}
          outlineColor="#222222"
          outlineOpacity={opacity * 0.8}
          quaternion={camera.quaternion}
        >
          {vector.label}
        </Text>
      )}
    </group>
  );
};

export default Vector;
