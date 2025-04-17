import React, { useState, useRef } from 'react';
import { COLOR_PALETTE_BASIC, COLOR_PALETTE_EXTENDED, COLOR_PALETTE_PASTEL } from '../lib/colors';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker = ({ currentColor, onChange, className = '' }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Group our color palettes
  const colorPalettes = [
    COLOR_PALETTE_BASIC,
    COLOR_PALETTE_EXTENDED,
    COLOR_PALETTE_PASTEL
  ];
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };
  
  // Trigger ref for the color swatch
  const triggerRef = useRef<HTMLDivElement>(null);
  
  return (
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
              {palette.map((color) => (
                <div
                  key={color}
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
  );
};

export default ColorPicker;