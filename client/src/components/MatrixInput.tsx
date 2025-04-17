import { useMatrixStore, MatrixDimension } from "../lib/stores/useMatrixStore";
import { useVectorStore } from "../lib/stores/useVectorStore";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import MatrixAnalysis from "./MatrixAnalysis";

// Extremely simplified component - no side effects
const MatrixInput = () => {
  const { matrix, updateMatrixValue, setDimension, showTransformed, toggleShowTransformed } = useMatrixStore();

  // These handlers don't have any side effects beyond the store update
  const handleMatrixChange = (row: number, col: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateMatrixValue(row, col, numValue);
    }
  };

  // Import from useVectorStore directly in component
  const { clearTransformedVectors } = useVectorStore();
  
  const handleDimensionChange = (value: string) => {
    if (['2x2', '2x3', '3x2', '3x3'].includes(value)) {
      // Set the new dimension
      setDimension(value as MatrixDimension);
      
      // Clear transformed vectors when dimension changes
      clearTransformedVectors();
      console.log(`Matrix dimension changed to ${value}, clearing transformed vectors`);
    }
  };

  // Parse dimensions from string
  const [rows, cols] = matrix.dimension.split('x').map(Number);

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Matrix Controls</h2>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Matrix Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="matrix-dimension">Matrix Dimension</Label>
              <div className="relative">
                <select
                  id="matrix-dimension"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  value={matrix.dimension}
                  onChange={(e) => handleDimensionChange(e.target.value)}
                >
                  <option value="2x2">2×2</option>
                  <option value="2x3">2×3</option>
                  <option value="3x2">3×2</option>
                  <option value="3x3">3×3</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-transformed"
                checked={showTransformed}
                onChange={toggleShowTransformed}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="show-transformed">Show Transformed Vectors</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="flex-1 overflow-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Matrix Values</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="grid gap-4 mb-4">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} className="w-[80px] flex-grow-0 flex-shrink-0">
                    <Label htmlFor={`m-${rowIndex}-${colIndex}`} className="whitespace-nowrap">
                      M<sub>{rowIndex+1},{colIndex+1}</sub>
                    </Label>
                    <Input
                      id={`m-${rowIndex}-${colIndex}`}
                      type="number"
                      step="any"
                      pattern="[0-9]*[.]?[0-9]*"
                      min="-100" 
                      max="100"
                      className="min-w-0"
                      value={matrix.values[rowIndex][colIndex]}
                      onChange={(e) => {
                        // Handle leading zeros properly (keep for decimals like 0.5)
                        let value = e.target.value;
                        if (value.match(/^0[0-9]/) && !value.includes('.')) {
                          value = value.replace(/^0+/, '');
                          // Update the input value directly
                          e.target.value = value;
                        }
                        handleMatrixChange(rowIndex, colIndex, value);
                      }}
                      onClick={(e) => {
                        // Select all on click
                        (e.target as HTMLInputElement).select();
                      }}
                      onDoubleClick={(e) => {
                        // Also select on double click to be safe
                        (e.target as HTMLInputElement).select();
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <MatrixAnalysis />
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixInput;
