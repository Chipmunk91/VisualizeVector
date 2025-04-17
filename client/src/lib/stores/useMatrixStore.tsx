import { create } from "zustand";

export type MatrixDimension = '2x2' | '2x3' | '3x2' | '3x3';

export interface Matrix {
  values: number[][];
  dimension: MatrixDimension;
}

interface MatrixStore {
  matrix: Matrix;
  showTransformed: boolean;
  setMatrix: (matrix: Matrix) => void;
  updateMatrixValue: (row: number, col: number, value: number) => void;
  setDimension: (dimension: MatrixDimension) => void;
  toggleShowTransformed: () => void;
}

const createEmptyMatrix = (dimension: MatrixDimension): number[][] => {
  const [rows, cols] = dimension.split('x').map(Number);
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
};

// Initialize with identity matrix of the selected dimension
const createIdentityMatrix = (dimension: MatrixDimension): number[][] => {
  const [rows, cols] = dimension.split('x').map(Number);
  return Array(rows).fill(0).map((_, i) => 
    Array(cols).fill(0).map((_, j) => i === j ? 1 : 0)
  );
};

export const useMatrixStore = create<MatrixStore>((set) => ({
  matrix: {
    values: createIdentityMatrix('3x3'),
    dimension: '3x3',
  },
  showTransformed: true,
  
  setMatrix: (matrix) => {
    set({ matrix });
  },
  
  updateMatrixValue: (row, col, value) => {
    set((state) => {
      const newValues = [...state.matrix.values];
      newValues[row][col] = value;
      return {
        matrix: {
          ...state.matrix,
          values: newValues,
        }
      };
    });
  },
  
  setDimension: (dimension) => {
    set((state) => {
      // Create a new matrix with the new dimension
      const newValues = createIdentityMatrix(dimension);
      
      // Copy over existing values where possible
      const [oldRows, oldCols] = state.matrix.dimension.split('x').map(Number);
      const [newRows, newCols] = dimension.split('x').map(Number);
      
      for (let i = 0; i < Math.min(oldRows, newRows); i++) {
        for (let j = 0; j < Math.min(oldCols, newCols); j++) {
          newValues[i][j] = state.matrix.values[i][j];
        }
      }
      
      return {
        matrix: {
          values: newValues,
          dimension,
        }
      };
    });
  },
  
  toggleShowTransformed: () => {
    set((state) => {
      // Force recalculation by triggering a state change in two steps
      const newState = {
        showTransformed: !state.showTransformed,
      };
      
      // When toggling to show transformed vectors, we also set a flag
      // to indicate that a recalculation should happen
      if (!state.showTransformed) {
        // We're turning it ON
        // Clear any hash to force recalculation
        document.body.removeAttribute('data-last-transform-hash');
      }
      
      return newState;
    });
  },
}));
