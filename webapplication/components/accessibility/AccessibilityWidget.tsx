'use client';

import { useState, useEffect } from 'react';
import { Volume2, Type, Eye, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ColorBlindMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>('normal');
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('a11y-font-size');
    const savedColorMode = localStorage.getItem('a11y-color-mode');
    const savedScreenReader = localStorage.getItem('a11y-screen-reader');
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedColorMode) setColorBlindMode(savedColorMode as ColorBlindMode);
    if (savedScreenReader) setScreenReaderEnabled(savedScreenReader === 'true');
  }, []);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('a11y-font-size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    // Apply color blind filter
    const filters: Record<ColorBlindMode, string> = {
      normal: 'none',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)',
      achromatopsia: 'grayscale(100%)',
    };
    
    document.documentElement.style.filter = filters[colorBlindMode];
    localStorage.setItem('a11y-color-mode', colorBlindMode);
  }, [colorBlindMode]);

  useEffect(() => {
    // Screen reader announcements
    localStorage.setItem('a11y-screen-reader', screenReaderEnabled.toString());
    
    if (screenReaderEnabled) {
      document.body.setAttribute('data-screen-reader', 'true');
    } else {
      document.body.removeAttribute('data-screen-reader');
    }
  }, [screenReaderEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const resetSettings = () => {
    setFontSize(100);
    setColorBlindMode('normal');
    setScreenReaderEnabled(false);
  };

  return (
    <>
      {/* SVG Filters for Color Blind Modes */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0
                                                   0.558, 0.442, 0, 0, 0
                                                   0, 0.242, 0.758, 0, 0
                                                   0, 0, 0, 1, 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0
                                                   0.7, 0.3, 0, 0, 0
                                                   0, 0.3, 0.7, 0, 0
                                                   0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0
                                                   0, 0.433, 0.567, 0, 0
                                                   0, 0.475, 0.525, 0, 0
                                                   0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      {/* Floating Widget */}
      <div
        className="fixed z-50"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg"
            aria-label="Open accessibility options"
            title="Accessibility Options"
          >
            <Eye className="w-6 h-6" />
          </Button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-80 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 drag-handle cursor-move">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-lg">Accessibility</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility options"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Screen Reader */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screenReaderEnabled}
                    onChange={(e) => setScreenReaderEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Screen Reader Mode</span>
                </label>
              </div>

              {/* Font Size */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4" />
                  <span className="text-sm font-medium">Font Size: {fontSize}%</span>
                </label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={75}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Color Blind Filter */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Color Vision</span>
                </label>
                <Select value={colorBlindMode} onValueChange={(value) => setColorBlindMode(value as ColorBlindMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Vision</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                    <SelectItem value="achromatopsia">Achromatopsia (Monochrome)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
