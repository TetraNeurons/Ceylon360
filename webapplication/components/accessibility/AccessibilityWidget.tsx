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
  const [position, setPosition] = useState({ x: 20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>('normal');
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Set initial position after mount
    setPosition({ x: 20, y: window.innerHeight - 200 });
    
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
      
      // Initialize speech synthesis
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        let textToSpeak = '';
        
        // Get text content based on element type
        if (target.tagName === 'BUTTON') {
          textToSpeak = target.getAttribute('aria-label') || target.textContent || 'Button';
        } else if (target.tagName === 'A') {
          textToSpeak = target.getAttribute('aria-label') || target.textContent || 'Link';
        } else if (target.tagName === 'INPUT') {
          const input = target as HTMLInputElement;
          const label = document.querySelector(`label[for="${input.id}"]`)?.textContent || 
                       input.getAttribute('aria-label') || 
                       input.placeholder || 
                       input.type;
          textToSpeak = `${label}, ${input.checked ? 'checked' : input.value || 'empty'}`;
        } else if (target.tagName === 'SELECT') {
          const select = target as HTMLSelectElement;
          const label = document.querySelector(`label[for="${select.id}"]`)?.textContent || 
                       select.getAttribute('aria-label');
          textToSpeak = `${label || 'Select'}, ${select.options[select.selectedIndex]?.text || 'no selection'}`;
        } else if (target.closest('button, a, [role="button"], [role="link"]')) {
          const clickable = target.closest('button, a, [role="button"], [role="link"]') as HTMLElement;
          textToSpeak = clickable.getAttribute('aria-label') || clickable.textContent || 'Interactive element';
        } else if (target.textContent && target.textContent.trim()) {
          textToSpeak = target.textContent.trim();
        }
        
        if (textToSpeak) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          // Create and speak the utterance
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      };
      
      // Add click listener to document
      document.addEventListener('click', handleClick, true);
      
      // Announce that screen reader is enabled
      const announcement = new SpeechSynthesisUtterance('Screen reader mode enabled');
      window.speechSynthesis.speak(announcement);
      
      // Cleanup function
      return () => {
        document.removeEventListener('click', handleClick, true);
        window.speechSynthesis.cancel();
      };
    } else {
      document.body.removeAttribute('data-screen-reader');
      window.speechSynthesis.cancel();
    }
  }, [screenReaderEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleClick = () => {
    // Only open if we didn't drag
    if (!hasDragged) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setHasDragged(true);
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
      >
        {!isOpen ? (
          <Button
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            className="rounded-full w-12 h-12 shadow-lg cursor-move relative"
            aria-label="Open accessibility options"
            title="Accessibility Options (Drag to move)"
          >
            <GripVertical className="w-3 h-3 absolute top-1 left-1 opacity-40" />
            <Eye className="w-5 h-5" />
          </Button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-80 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Accessibility</h3>
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
