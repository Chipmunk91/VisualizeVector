import React, { useState, useRef, useEffect } from 'react';
import { COLOR_PALETTE_BASIC, COLOR_PALETTE_EXTENDED, COLOR_PALETTE_PASTEL } from '../lib/colors';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  className?: string;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

const ColorPicker = ({ currentColor, onChange, className = '' }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // RGB values for advanced picker
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [hexValue, setHexValue] = useState('#000000');

  // Canvas refs for color pickers
  const colorGradientRef = useRef<HTMLCanvasElement>(null);
  const grayscaleRef = useRef<HTMLCanvasElement>(null);
  
  // Group our color palettes
  const colorPalettes = [
    COLOR_PALETTE_BASIC,
    COLOR_PALETTE_EXTENDED,
    COLOR_PALETTE_PASTEL
  ];
  
  // Handle color selection from palette
  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };
  
  // Update RGB values when current color changes
  useEffect(() => {
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);
      setHexValue(currentColor);
    }
  }, [currentColor]);
  
  // Update hex value when RGB values change
  useEffect(() => {
    const newHexValue = rgbToHex(red, green, blue);
    setHexValue(newHexValue);
  }, [red, green, blue]);
  
  // Handle changes to RGB inputs
  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    // Clamp value between 0 and 255
    const clampedValue = Math.max(0, Math.min(255, value));
    
    if (component === 'r') setRed(clampedValue);
    if (component === 'g') setGreen(clampedValue);
    if (component === 'b') setBlue(clampedValue);
  };

  // Handle changes to hex input
  const handleHexChange = (value: string) => {
    // Ensure it starts with a hash
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Validate the hex color
    const isValidHex = /^#[0-9A-F]{6}$/i.test(value);
    
    if (isValidHex) {
      setHexValue(value);
      const rgb = hexToRgb(value);
      if (rgb) {
        setRed(rgb.r);
        setGreen(rgb.g);
        setBlue(rgb.b);
      }
    } else {
      // Just update the displayed value for now
      setHexValue(value);
    }
  };

  // Apply the selected color from the advanced picker
  const applyAdvancedColor = () => {
    const newColor = rgbToHex(red, green, blue);
    onChange(newColor);
    setShowAdvanced(false);
    setIsOpen(false);
  };
  
  // Draw the color gradient canvas when component mounts or shows
  useEffect(() => {
    if (!showAdvanced) return;
    
    // Draw color gradient
    if (colorGradientRef.current) {
      const canvas = colorGradientRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create rainbow gradient horizontally
        const horizontalGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        horizontalGradient.addColorStop(0, '#FF0000'); // Red
        horizontalGradient.addColorStop(0.17, '#FFFF00'); // Yellow
        horizontalGradient.addColorStop(0.33, '#00FF00'); // Green
        horizontalGradient.addColorStop(0.5, '#00FFFF'); // Cyan
        horizontalGradient.addColorStop(0.67, '#0000FF'); // Blue
        horizontalGradient.addColorStop(0.83, '#FF00FF'); // Magenta
        horizontalGradient.addColorStop(1, '#FF0000'); // Back to Red
        
        ctx.fillStyle = horizontalGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create white to black gradient vertically
        const verticalGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        verticalGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        verticalGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        verticalGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        verticalGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = verticalGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Draw grayscale gradient
    if (grayscaleRef.current) {
      const canvas = grayscaleRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create grayscale gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgb(255, 255, 255)'); // White
        gradient.addColorStop(1, 'rgb(0, 0, 0)'); // Black
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showAdvanced]);
  
  // Handle click on color gradient
  const handleGradientClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (colorGradientRef.current) {
      const canvas = colorGradientRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        console.log("Color picked:", imageData[0], imageData[1], imageData[2]);
        setRed(imageData[0]);
        setGreen(imageData[1]);
        setBlue(imageData[2]);
      }
    }
  };
  
  // Handle click on grayscale
  const handleGrayscaleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (grayscaleRef.current) {
      const canvas = grayscaleRef.current;
      const rect = canvas.getBoundingClientRect();
      const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
      
      // Calculate grayscale value (0-255) based on y position
      const value = Math.round((canvas.height - y) / canvas.height * 255);
      console.log("Grayscale picked:", value);
      setRed(value);
      setGreen(value);
      setBlue(value);
    }
  };
  
  // Trigger ref for the color swatch
  const triggerRef = useRef<HTMLDivElement>(null);
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div 
            ref={triggerRef}
            className={`w-6 h-6 rounded-full cursor-pointer border border-gray-300 transition-all hover:scale-110 ${className}`} 
            style={{ backgroundColor: currentColor }}
            onClick={() => setIsOpen(true)}
            aria-label="Select color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col gap-1">
            {colorPalettes.map((palette, paletteIndex) => (
              <div key={paletteIndex} className="flex flex-wrap gap-1 justify-center mb-1">
                {palette.map((color, colorIndex) => (
                  <div
                    key={`${paletteIndex}-${colorIndex}-${color}`}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-125 ${
                      currentColor === color ? 'ring-2 ring-black ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    aria-label={color}
                  />
                ))}
              </div>
            ))}
            
            {/* Custom color selector with advanced colors button */}
            <div className="flex justify-end mt-1">
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                aria-label="More colors"
                onClick={() => setShowAdvanced(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Advanced Color Picker Dialog */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Advanced Color Picker</DialogTitle>
            <DialogDescription>
              Select a custom color using the color picker, sliders, or hex input.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Color gradient and grayscale */}
            <div className="flex gap-2">
              <canvas 
                ref={colorGradientRef} 
                width={200} 
                height={200} 
                onClick={handleGradientClick}
                className="cursor-crosshair border border-gray-300 rounded-md"
              />
              <canvas 
                ref={grayscaleRef} 
                width={30} 
                height={200} 
                onClick={handleGrayscaleClick}
                className="cursor-pointer border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Color controls */}
            <div className="flex flex-col gap-3">
              {/* Preview box and hex input */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-12 h-12 rounded-md border border-gray-300"
                  style={{ backgroundColor: hexValue }}
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="hex-color">Hex Color</Label>
                  <Input 
                    id="hex-color"
                    type="text" 
                    value={hexValue} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
              
              {/* RGB sliders */}
              <div className="space-y-2 mt-2">
                <div className="grid grid-cols-[1fr_60px] items-center gap-2">
                  <div>
                    <Label htmlFor="red">Red</Label>
                    <Input 
                      id="red"
                      type="range" 
                      min="0" 
                      max="255" 
                      value={red}
                      onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    />
                  </div>
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={red}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-[1fr_60px] items-center gap-2">
                  <div>
                    <Label htmlFor="green">Green</Label>
                    <Input 
                      id="green"
                      type="range" 
                      min="0" 
                      max="255" 
                      value={green}
                      onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    />
                  </div>
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={green}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-[1fr_60px] items-center gap-2">
                  <div>
                    <Label htmlFor="blue">Blue</Label>
                    <Input 
                      id="blue"
                      type="range" 
                      min="0" 
                      max="255" 
                      value={blue}
                      onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    />
                  </div>
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={blue}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              {/* Apply button */}
              <button
                onClick={applyAdvancedColor}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mt-2"
              >
                Apply Color
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ColorPicker;