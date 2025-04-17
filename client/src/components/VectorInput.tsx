import { useState } from "react";
import { useVectorStore } from "../lib/stores/useVectorStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trash, Eye, EyeOff } from "lucide-react";
import VectorAnalysis from "./VectorAnalysis";

// Simple implementation to avoid re-render issues
const VectorInput = () => {
  const { vectors, addVector, removeVector, updateVector, updateVectorLabel, toggleVectorVisibility } = useVectorStore();
  const [dimensions, setDimensions] = useState<"2d" | "3d">("3d");
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [z, setZ] = useState("0");

  // Add a new vector - simplified
  const handleAddVector = () => {
    // Safely parse inputs with default values
    const xVal = parseFloat(x) || 0;
    const yVal = parseFloat(y) || 0;
    const zVal = parseFloat(z) || 0;
    
    // Create appropriate components array
    const components = dimensions === "2d" 
      ? [xVal, yVal]
      : [xVal, yVal, zVal];
    
    // Add the vector
    addVector(components);
    
    // Reset input fields
    setX("0");
    setY("0");
    setZ("0");
  };

  // Filter out transformed vectors for the list
  const originalVectors = vectors.filter(v => !v.isTransformed);

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Vector Controls</h2>
      
      {/* Add new vector */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Add New Vector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="grid w-full grid-cols-2 rounded-md overflow-hidden mb-2">
              <button 
                onClick={() => setDimensions("2d")}
                className={`py-2 px-4 text-center ${dimensions === "2d" ? "bg-primary text-white" : "bg-secondary"}`}
              >
                2D Vector
              </button>
              <button 
                onClick={() => setDimensions("3d")}
                className={`py-2 px-4 text-center ${dimensions === "3d" ? "bg-primary text-white" : "bg-secondary"}`}
              >
                3D Vector
              </button>
            </div>
            
            {dimensions === "2d" ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="x-2d">X</Label>
                  <Input 
                    id="x-2d" 
                    type="number" 
                    value={x} 
                    onChange={(e) => {
                      // Handle leading zeros properly (keep for decimals like 0.5)
                      let value = e.target.value;
                      if (value.match(/^0[0-9]/) && !value.includes('.')) {
                        value = value.replace(/^0+/, '');
                        // Update the input value directly
                        e.target.value = value;
                      }
                      setX(value);
                    }}
                    onClick={(e) => {
                      // Select all on click
                      (e.target as HTMLInputElement).select();
                    }}
                    onDoubleClick={(e) => {
                      // Also select on double click to be safe
                      (e.target as HTMLInputElement).select();
                    }}
                    step="any"
                  />
                </div>
                <div>
                  <Label htmlFor="y-2d">Y</Label>
                  <Input 
                    id="y-2d" 
                    type="number" 
                    value={y}
                    onChange={(e) => {
                      // Handle leading zeros properly (keep for decimals like 0.5)
                      let value = e.target.value;
                      if (value.match(/^0[0-9]/) && !value.includes('.')) {
                        value = value.replace(/^0+/, '');
                        // Update the input value directly
                        e.target.value = value;
                      }
                      setY(value);
                    }}
                    onClick={(e) => {
                      // Select all on click
                      (e.target as HTMLInputElement).select();
                    }}
                    onDoubleClick={(e) => {
                      // Also select on double click to be safe
                      (e.target as HTMLInputElement).select();
                    }}
                    step="any"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label htmlFor="x-3d">X</Label>
                  <Input 
                    id="x-3d" 
                    type="number" 
                    value={x}
                    onChange={(e) => {
                      // Handle leading zeros properly (keep for decimals like 0.5)
                      let value = e.target.value;
                      if (value.match(/^0[0-9]/) && !value.includes('.')) {
                        value = value.replace(/^0+/, '');
                        // Update the input value directly
                        e.target.value = value;
                      }
                      setX(value);
                    }}
                    onClick={(e) => {
                      // Select all on click
                      (e.target as HTMLInputElement).select();
                    }}
                    onDoubleClick={(e) => {
                      // Also select on double click to be safe
                      (e.target as HTMLInputElement).select();
                    }}
                    step="any"
                  />
                </div>
                <div>
                  <Label htmlFor="y-3d">Y</Label>
                  <Input 
                    id="y-3d" 
                    type="number" 
                    value={y}
                    onChange={(e) => {
                      // Handle leading zeros properly (keep for decimals like 0.5)
                      let value = e.target.value;
                      if (value.match(/^0[0-9]/) && !value.includes('.')) {
                        value = value.replace(/^0+/, '');
                        // Update the input value directly
                        e.target.value = value;
                      }
                      setY(value);
                    }}
                    onClick={(e) => {
                      // Select all on click
                      (e.target as HTMLInputElement).select();
                    }}
                    onDoubleClick={(e) => {
                      // Also select on double click to be safe
                      (e.target as HTMLInputElement).select();
                    }}
                    step="any"
                  />
                </div>
                <div>
                  <Label htmlFor="z-3d">Z</Label>
                  <Input 
                    id="z-3d" 
                    type="number" 
                    value={z}
                    onChange={(e) => {
                      // Handle leading zeros properly (keep for decimals like 0.5)
                      let value = e.target.value;
                      if (value.match(/^0[0-9]/) && !value.includes('.')) {
                        value = value.replace(/^0+/, '');
                        // Update the input value directly
                        e.target.value = value;
                      }
                      setZ(value);
                    }}
                    onClick={(e) => {
                      // Select all on click
                      (e.target as HTMLInputElement).select();
                    }}
                    onDoubleClick={(e) => {
                      // Also select on double click to be safe
                      (e.target as HTMLInputElement).select();
                    }}
                    step="any"
                  />
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={handleAddVector} className="w-full">
            Add Vector
          </Button>
        </CardContent>
      </Card>
      
      {/* Vector Analysis */}
      <VectorAnalysis />
      
      {/* Vector list */}
      <Card className="flex-1 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vector List</CardTitle>
        </CardHeader>
        <CardContent>
          {originalVectors.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No vectors added yet. Add a vector to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {originalVectors.map((vector) => (
                <li key={vector.id} className="border border-border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: vector.color }}
                      />
                      <span className="font-medium">
                        {vector.components.length}D
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVectorVisibility(vector.id)}
                      >
                        {vector.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVector(vector.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Vector name field */}
                  <div className="mb-3">
                    <Label htmlFor={`vector-name-${vector.id}`}>Vector Name</Label>
                    <Input
                      id={`vector-name-${vector.id}`}
                      type="text"
                      value={vector.label}
                      onChange={(e) => updateVectorLabel(vector.id, e.target.value)}
                      placeholder="Enter vector name"
                      onDoubleClick={(e) => {
                        // Select all text on double click for easier editing
                        (e.target as HTMLInputElement).select();
                      }}
                      onClick={(e) => {
                        // Also select on single click for better usability
                        (e.target as HTMLInputElement).select();
                      }}
                    />
                  </div>
                  
                  {/* Vector components */}
                  <div className="grid grid-cols-3 gap-2">
                    {vector.components.map((value, index) => (
                      <div key={index}>
                        <Label>{index === 0 ? 'X' : index === 1 ? 'Y' : 'Z'}</Label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            // Handle leading zeros properly (keep for decimals like 0.5)
                            let value = e.target.value;
                            if (value.match(/^0[0-9]/) && !value.includes('.')) {
                              value = value.replace(/^0+/, '');
                              // Update the input value
                              e.target.value = value;
                            }
                            
                            const newComponents = [...vector.components];
                            newComponents[index] = parseFloat(value) || 0;
                            updateVector(vector.id, newComponents);
                          }}
                          onDoubleClick={(e) => {
                            // Select all text on double click for easier editing
                            (e.target as HTMLInputElement).select();
                          }}
                          onClick={(e) => {
                            // Also select on single click for better usability
                            (e.target as HTMLInputElement).select();
                          }}
                          step="any"
                        />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorInput;
