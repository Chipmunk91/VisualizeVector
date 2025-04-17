import React from "react";
import { useVectorStore, Vector } from "../lib/stores/useVectorStore";
import { 
  calculateMagnitude, 
  dotProduct, 
  crossProduct, 
  vectorDistance,
  angleBetweenVectors
} from "../lib/math";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const VectorAnalysis = () => {
  // Get all non-transformed vectors
  const vectors = useVectorStore(state => 
    state.vectors.filter(v => !v.isTransformed)
  );

  // Find all transformed vectors
  const transformedVectors = useVectorStore(state => 
    state.vectors.filter(v => v.isTransformed)
  );

  // Group transformed vectors by their original vector
  const transformationMap = new Map<string, Vector[]>();
  transformedVectors.forEach(tv => {
    if (tv.originalId) {
      if (!transformationMap.has(tv.originalId)) {
        transformationMap.set(tv.originalId, []);
      }
      transformationMap.get(tv.originalId)?.push(tv);
    }
  });

  // Check if we have at least one vector
  if (vectors.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vector Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Add vectors to see analysis here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Vector Analysis</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        {/* Individual Vector Analysis */}
        <div className="space-y-4">
          {vectors.map(vector => {
            const magnitude = calculateMagnitude(vector.components);
            const transformedVector = transformationMap.get(vector.id)?.[0];
            
            return (
              <div key={vector.id} className="border border-border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: vector.color }}
                  />
                  <h3 className="font-medium">{vector.label}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted p-2 rounded-md">
                    <p className="font-medium">Magnitude:</p>
                    <p>{magnitude.toFixed(4)}</p>
                  </div>
                  
                  <div className="bg-muted p-2 rounded-md">
                    <p className="font-medium">Components:</p>
                    <p>[{vector.components.map(c => c.toFixed(2)).join(", ")}]</p>
                  </div>
                  
                  {transformedVector && (
                    <>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="font-medium">Transformed:</p>
                        <p>[{transformedVector.components.map(c => c.toFixed(2)).join(", ")}]</p>
                      </div>
                      
                      <div className="bg-muted p-2 rounded-md">
                        <p className="font-medium">Transformation Magnitude:</p>
                        <p>{calculateMagnitude(transformedVector.components).toFixed(4)}</p>
                      </div>
                      
                      <div className="bg-muted p-2 rounded-md col-span-2">
                        <p className="font-medium">Distance from Original:</p>
                        <p>
                          {vectorDistance(vector.components, transformedVector.components)?.toFixed(4) || "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Vector Pair Analysis */}
        {vectors.length >= 2 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Vector Relationships</h3>
            <div className="space-y-2">
              {vectors.flatMap((v1, i) => 
                vectors.slice(i + 1).map(v2 => {
                  const dot = dotProduct(v1.components, v2.components);
                  const cross = v1.components.length === 3 && v2.components.length === 3 
                    ? crossProduct(v1.components, v2.components) 
                    : null;
                  const angle = angleBetweenVectors(v1.components, v2.components);
                  const distance = vectorDistance(v1.components, v2.components);
                  
                  return (
                    <div key={`${v1.id}-${v2.id}`} className="border border-border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: v1.color }}
                          />
                          <span>{v1.label}</span>
                        </div>
                        <span>and</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: v2.color }}
                          />
                          <span>{v2.label}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-medium">Dot Product:</p>
                          <p>{dot?.toFixed(4) || "N/A"}</p>
                        </div>
                        
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-medium">Angle (degrees):</p>
                          <p>{angle ? (angle * (180 / Math.PI)).toFixed(2) + "°" : "N/A"}</p>
                        </div>
                        
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-medium">Distance:</p>
                          <p>{distance?.toFixed(4) || "N/A"}</p>
                        </div>
                        
                        {cross && (
                          <div className="bg-muted p-2 rounded-md">
                            <p className="font-medium">Cross Product:</p>
                            <p>[{cross.map(c => c.toFixed(2)).join(", ")}]</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VectorAnalysis;