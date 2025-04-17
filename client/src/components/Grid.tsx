import * as THREE from "three";

interface GridProps {
  size?: number;
  divisions?: number;
  color?: string;
}

const Grid = ({ size = 10, divisions = 10, color = "#444444" }: GridProps) => {
  return (
    <>
      {/* XY Grid (horizontal) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* XZ Grid (vertical along X) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* YZ Grid (vertical along Y) */}
      <gridHelper
        args={[size, divisions, color, color]}
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </>
  );
};

export default Grid;
