import * as THREE from "three";
import { Text } from "@react-three/drei";

// Component to draw X, Y, Z axis with labels
const Axis = () => {
  // Define axis length
  const axisLength = 10;
  
  return (
    <group>
      {/* X Axis (Red) */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, axisLength, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="red" linewidth={2} />
      </line>
      <Text
        position={[axisLength + 0.3, 0, 0]}
        fontSize={0.3}
        color="red"
        anchorX="left"
        font="/fonts/inter.json"
      >
        X
      </Text>
      
      {/* Y Axis (Green) */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, axisLength, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="green" linewidth={2} />
      </line>
      <Text
        position={[0, axisLength + 0.3, 0]}
        fontSize={0.3}
        color="green"
        anchorX="center"
        font="/fonts/inter.json"
      >
        Y
      </Text>
      
      {/* Z Axis (Blue) */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, axisLength])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="blue" linewidth={2} />
      </line>
      <Text
        position={[0, 0, axisLength + 0.3]}
        fontSize={0.3}
        color="blue"
        anchorX="center"
        font="/fonts/inter.json"
      >
        Z
      </Text>
      
      {/* Origin Label */}
      <Text
        position={[0.2, 0.2, 0.2]}
        fontSize={0.2}
        color="white"
        anchorX="left"
        font="/fonts/inter.json"
      >
        O
      </Text>
      
      {/* Tick marks along axes */}
      {[...Array(10)].map((_, i) => (
        <group key={i}>
          {/* X axis ticks */}
          {i > 0 && (
            <>
              <line>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([i, -0.1, 0, i, 0.1, 0])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="red" linewidth={1} />
              </line>
              <Text
                position={[i, -0.3, 0]}
                fontSize={0.2}
                color="red"
                anchorX="center"
                font="/fonts/inter.json"
              >
                {i}
              </Text>
            </>
          )}
          
          {/* Y axis ticks */}
          {i > 0 && (
            <>
              <line>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([-0.1, i, 0, 0.1, i, 0])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="green" linewidth={1} />
              </line>
              <Text
                position={[-0.3, i, 0]}
                fontSize={0.2}
                color="green"
                anchorX="right"
                font="/fonts/inter.json"
              >
                {i}
              </Text>
            </>
          )}
          
          {/* Z axis ticks */}
          {i > 0 && (
            <>
              <line>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([-0.1, 0, i, 0.1, 0, i])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="blue" linewidth={1} />
              </line>
              <Text
                position={[-0.3, 0, i]}
                fontSize={0.2}
                color="blue"
                anchorX="right"
                font="/fonts/inter.json"
              >
                {i}
              </Text>
            </>
          )}
        </group>
      ))}
    </group>
  );
};

export default Axis;
