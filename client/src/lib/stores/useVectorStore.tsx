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
    
    // Find the next available vector number
    // Get all original vectors (not transformed)
    const originalVectors = useVectorStore.getState().vectors.filter(v => !v.isTransformed);
    
    // Extract existing vector numbers from labels like "v1", "v2"
    const usedNumbers = new Set<number>();
    originalVectors.forEach(v => {
      const match = v.label.match(/^v(\d+)$/);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    });
    
    // Find the lowest unused number
    let vectorNumber = 1;
    while (usedNumbers.has(vectorNumber)) {
      vectorNumber++;
    }
    
    const newVector: Vector = {
      id,
      components,
      color: getRandomColor(),
      label: `v${vectorNumber}`,
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
    // Add debug logs
    console.log("Setting transformed vectors:", transformedVectors.length);
    
    set((state) => {
      try {
        // First, remove all existing transformed vectors
        const nonTransformedVectors = state.vectors.filter(v => !v.isTransformed);
        
        // Create a map of originalId to visibility for faster lookup
        const originalVisibilityMap = new Map();
        nonTransformedVectors.forEach(v => {
          originalVisibilityMap.set(v.id, v.visible);
        });
        
        // Sync visibility for each transformed vector
        const syncedTransformedVectors = transformedVectors.map(transformed => {
          // Get visibility from map with default true
          const visibility = transformed.originalId ? 
            (originalVisibilityMap.get(transformed.originalId) ?? true) : 
            true;
          
          // Return transformed vector with matched visibility
          return {
            ...transformed,
            visible: visibility
          };
        });
        
        // Return updated state
        const newState = {
          vectors: [...nonTransformedVectors, ...syncedTransformedVectors]
        };
        
        // Double check for duplicates
        const uniqueIds = new Set();
        const hasDuplicates = newState.vectors.some(v => {
          if (uniqueIds.has(v.id)) return true;
          uniqueIds.add(v.id);
          return false;
        });
        
        // If duplicates found, log warning and filter them out
        if (hasDuplicates) {
          console.warn("Duplicate vector IDs detected - filtering duplicates");
          
          // Keep only the first occurrence of each vector ID
          const uniqueVectors: any[] = [];
          const seenIds = new Set();
          
          newState.vectors.forEach(v => {
            if (!seenIds.has(v.id)) {
              uniqueVectors.push(v);
              seenIds.add(v.id);
            }
          });
          
          return { vectors: uniqueVectors };
        }
        
        return newState;
      } catch (error) {
        console.error("Error in setTransformedVectors:", error);
        // Return unchanged state on error
        return state;
      }
    });
  },
  
  clearTransformedVectors: () => {
    try {
      set((state) => {
        // Make a copy of the state to avoid reference issues
        const filteredVectors = [...state.vectors].filter(v => !v.isTransformed);
        
        // Return a new state object
        return {
          vectors: filteredVectors
        };
      });
    } catch (error) {
      console.error("Error in clearTransformedVectors:", error);
      // If error occurs, set an empty array to recover
      set((state) => {
        const safeVectors = state.vectors.filter(v => !v.isTransformed);
        return { vectors: safeVectors || [] };
      });
    }
  }
}));
