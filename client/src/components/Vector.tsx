import React, { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Vector as VectorType } from "../lib/stores/useVectorStore";
import { useVectorStore } from "../lib/stores/useVectorStore";
import { useDrag } from "@use-gesture/react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { vectorDistance } from "../lib/math";

interface VectorProps {
  vector: VectorType;
}

const Vector = ({ vector }: VectorProps) => {
  const { updateVector } = useVectorStore();
  const { camera } = useThree();
  const components = vector.components;
  const isTransformed = vector.isTransformed;
  const arrowHeadRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
  
  // Prevent dragging for transformed vectors
  const isDraggable = !isTransformed;
  
  // Ultra-simplified drag functionality that's reliable but less intuitive
  const dragBind = useDrag(
    ({ active, movement: [mx, my], event, memo = { 
      startComponents: [...components]
    }}) => {
      if (!isDraggable) return memo;
      
      // Block event propagation
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      setIsDragging(active);
      
      if (active) {
        // Use very simple movement approach - X movement changes X, Y movement changes Y
        // This isn't perspective correct but it's very reliable
        
        const sensitivity = 0.05; // Higher value = more movement
        
        // Calculate new positions with simple scaling
        let newComponents;
        
        if (components.length === 2) {
          // 2D vectors: X and Y
          newComponents = [
            memo.startComponents[0] + mx * sensitivity,
            memo.startComponents[1] - my * sensitivity // Flip Y for natural feel
          ];
        } else {
          // For 3D vectors, we'll change different axes based on a simple heuristic
          
          // If camera is more looking from above (Y-dominant view), change X and Z
          // This is an extreme simplification but provides consistent behavior
          if (Math.abs(camera.position.y) > Math.max(Math.abs(camera.position.x), Math.abs(camera.position.z))) {
            // Looking from above: mouse X → vector X, mouse Y → vector Z
            newComponents = [
              memo.startComponents[0] + mx * sensitivity,
              memo.startComponents[1], // Y unchanged
              memo.startComponents[2] - my * sensitivity
            ];
          } else {
            // Looking from side: mouse X → X or Z (depending on camera), mouse Y → Y
            // Simplify to just basic X-Y when viewed from sides
            newComponents = [
              memo.startComponents[0] + mx * sensitivity,
              memo.startComponents[1] - my * sensitivity,
              memo.startComponents[2]
            ];
          }
        }
        
        // Simple sanity check
        if (newComponents.every(n => !isNaN(n) && isFinite(n))) {
          updateVector(vector.id, newComponents);
        }
      }
      
      return memo;
    },
    { 
      // Only allow dragging if not a transformed vector
      enabled: isDraggable
    }
  );
  
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
        userData={{ vectorElement: true }}
        {...dragBind() as any}
        onClick={(e: any) => {
          e.stopPropagation();
          console.log("Vector clicked:", vector.id);
        }}
        onPointerDown={(e: any) => {
          // Set a DOM attribute that our Controls can detect
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.setAttribute('data-vector-element', 'true');
            // Remove it after the interaction is complete
            setTimeout(() => {
              canvas.removeAttribute('data-vector-element');
            }, 100);
          }
          // Prevent orbit controls from taking over
          e.stopPropagation();
        }}
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
          outlineWidth={0.04}
          outlineColor="#000000"
          outlineOpacity={opacity * 0.5}
          quaternion={camera.quaternion}
        >
          {vector.label}
        </Text>
      )}
    </group>
  );
};

export default Vector;
