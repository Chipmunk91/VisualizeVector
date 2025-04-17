import { create } from "zustand";
import { getRandomColor } from "../colors";

export interface Vector {
  id: string;
  components: number[];
  color: string;
  label: string;
  visible: boolean;
  // For showing original and transformed vectors
  isTransformed: boolean;
  originalId?: string; 
}

interface VectorStore {
  vectors: Vector[];
  addVector: (components: number[]) => void;
  removeVector: (id: string) => void;
  updateVector: (id: string, components: number[]) => void;
  toggleVectorVisibility: (id: string) => void;
  setTransformedVectors: (originalVectors: Vector[], transformedVectors: Vector[]) => void;
  clearTransformedVectors: () => void;
}

export const useVectorStore = create<VectorStore>((set) => ({
  vectors: [],
  
  addVector: (components) => {
    const id = `vector-${Date.now()}`;
    const newVector: Vector = {
      id,
      components,
      color: getRandomColor(),
      label: `v${components.length === 2 ? components.length : components.length}`,
      visible: true,
      isTransformed: false,
    };
    
    set((state) => ({
      vectors: [...state.vectors, newVector]
    }));
  },
  
  removeVector: (id) => {
    set((state) => ({
      vectors: state.vectors.filter((v) => v.id !== id && v.originalId !== id)
    }));
  },
  
  updateVector: (id, components) => {
    set((state) => ({
      vectors: state.vectors.map((v) => {
        if (v.id === id) {
          return { ...v, components };
        }
        return v;
      })
    }));
  },
  
  toggleVectorVisibility: (id) => {
    set((state) => ({
      vectors: state.vectors.map((v) => {
        if (v.id === id) {
          return { ...v, visible: !v.visible };
        }
        return v;
      })
    }));
  },
  
  setTransformedVectors: (originalVectors, transformedVectors) => {
    set((state) => {
      // Filter out any existing transformed vectors
      const filteredVectors = state.vectors.filter(v => !v.isTransformed);
      
      // Add the new transformed vectors
      return {
        vectors: [...filteredVectors, ...transformedVectors]
      };
    });
  },
  
  clearTransformedVectors: () => {
    set((state) => ({
      vectors: state.vectors.filter(v => !v.isTransformed)
    }));
  }
}));
