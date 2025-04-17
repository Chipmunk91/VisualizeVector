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
  // For controlling transparency
  opacity?: number;
}

interface VectorStore {
  vectors: Vector[];
  addVector: (components: number[]) => void;
  removeVector: (id: string) => void;
  updateVector: (id: string, components: number[]) => void;
  updateVectorLabel: (id: string, label: string) => void;
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
      label: `Vector${components.length}`,
      visible: true,
      isTransformed: false,
    };
    
    console.log("Adding new vector to store:", newVector);
    
    set((state) => ({
      vectors: [...state.vectors, newVector]
    }));
    
    console.log("Vector added, store now has vectors:", useVectorStore.getState().vectors);
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
  
  updateVectorLabel: (id, label) => {
    set((state) => {
      const updatedVectors = state.vectors.map((v) => {
        // Update original vector label
        if (v.id === id) {
          return { ...v, label };
        }
        // Update transformed vector label - append "- T" suffix
        if (v.originalId === id) {
          return { ...v, label: `${label} - T` };
        }
        return v;
      });
      return { vectors: updatedVectors };
    });
  },
  
  toggleVectorVisibility: (id) => {
    set((state) => {
      // Find the target vector
      const targetVector = state.vectors.find(v => v.id === id);
      if (!targetVector) return { vectors: state.vectors };
      
      // Get the new visibility state (toggled)
      const newVisibility = !targetVector.visible;
      
      // Return updated vectors array
      return {
        vectors: state.vectors.map((v) => {
          // Handle original vector
          if (v.id === id) {
            return { ...v, visible: newVisibility };
          }
          
          // Handle transformed vectors (if we're toggling an original vector)
          if (!targetVector.isTransformed && v.originalId === id) {
            return { ...v, visible: newVisibility };
          }
          
          // Handle original vectors (if we're toggling a transformed vector)
          if (targetVector.isTransformed && targetVector.originalId === v.id) {
            return { ...v, visible: newVisibility };
          }
          
          // Handle other transformed vectors of the same original (if toggling a transformed vector)
          if (targetVector.isTransformed && v.isTransformed && v.originalId === targetVector.originalId) {
            return { ...v, visible: newVisibility };
          }
          
          // Don't change other vectors
          return v;
        })
      };
    });
  },
  
  setTransformedVectors: (originalVectors, transformedVectors) => {
    set((state) => {
      // Keep only non-transformed vectors
      const originalState = state.vectors.filter(v => !v.isTransformed);
      
      // Sync visibility between original and transformed vectors
      const syncedTransformed = transformedVectors.map(transformed => {
        // Find the corresponding original vector
        const original = originalState.find(v => v.id === transformed.originalId);
        
        // If found, ensure transformed vector has same visibility as original
        if (original) {
          return { ...transformed, visible: original.visible };
        }
        
        return transformed;
      });
      
      // Return updated state
      return {
        vectors: [...originalState, ...syncedTransformed]
      };
    });
  },
  
  clearTransformedVectors: () => {
    set((state) => ({
      vectors: state.vectors.filter(v => !v.isTransformed)
    }));
  }
}));
