# Accessibility Widget

A comprehensive accessibility widget for users with disabilities.

## Features

### 1. **Screen Reader Mode**
- Enhanced focus indicators for keyboard navigation
- Better contrast and visibility for interactive elements
- ARIA labels support

### 2. **Font Size Adjustment**
- Range: 75% to 150%
- Adjustable in 5% increments
- Persists across sessions

### 3. **Color Blind Filters**
- **Normal Vision**: Default view
- **Protanopia**: Red-blind (red-green color blindness)
- **Deuteranopia**: Green-blind (red-green color blindness)
- **Tritanopia**: Blue-blind (blue-yellow color blindness)
- **Achromatopsia**: Complete color blindness (monochrome)

### 4. **Draggable Widget**
- Floating action button that can be positioned anywhere
- Drag handle for easy repositioning
- Compact and non-intrusive design

## Usage

The widget is automatically included in the root layout and appears on all pages. Users can:

1. Click the eye icon to open the accessibility panel
2. Adjust settings as needed
3. Drag the widget to their preferred position
4. Settings are saved in localStorage

## Technical Details

- Built with React and TypeScript
- Uses Radix UI components for accessibility
- CSS filters for color blind modes
- LocalStorage for persistence
- Fully responsive and mobile-friendly
