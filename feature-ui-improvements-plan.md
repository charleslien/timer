# Feature: UI Improvements

## Overview
Enhance the overall look and feel of the application by updating the visual design. The goal is to apply a modern color scheme, refined typography, and updated component styling (including buttons, inputs, sidebar, and main content areas) to improve usability and aesthetics.

## Design/Implementation Steps

1. **Color Scheme & Typography:**
   - Update the background of the app to use a subtle gradient or soft neutral color (e.g. light gray to white).
   - Change fonts to a modern sans-serif style (e.g. "Roboto", "Segoe UI", or import a Google Font).
   - Adjust font sizes and weights for headings, subheadings, and body text.

   _Example CSS snippet:_
   ```
   body {
     background: linear-gradient(135deg, #f2f2f2, #ffffff);
     font-family: 'Roboto', 'Segoe UI', sans-serif;
     margin: 0;
     padding: 0;
   }
   ```

2. **Buttons & Controls:**
   - Update button styles to have a modern flat look with rounded corners and subtle box shadows.
   - Add hover effects (e.g. background color darkening) for better interactivity.
   - Increase padding and margins for controls to improve touch target sizes.

   _Example CSS snippet:_
   ```
   .controls button {
     background-color: #1976D2;
     color: #FFF;
     border: none;
     border-radius: 4px;
     padding: 10px 20px;
     font-size: 16px;
     transition: background 0.2s ease;
   }
   
   .controls button:hover {
     background-color: #0d47a1;
   }
   ```

3. **Sidebar Styling:**
   - Update the sidebar background to a darker tone (e.g. dark slate or charcoal) for contrast.
   - Update text color inside the sidebar to light (white or light gray).
   - Enhance the toggle buttons (both normal and fullscreen) with improved positioning, padding, and hover effects.
   - For fullscreen mode, the sidebar should overlay the entire viewport with smooth transitions and improved spacing.

   _Example CSS snippet:_
   ```
   .sidebar {
     background-color: #263238;
     color: #fff;
     transition: width 0.3s ease, background-color 0.3s ease;
     overflow-x: hidden;
     border-right: 1px solid #37474F;
   }
   
   .sidebar-toggle, .sidebar-fullscreen-toggle {
     background-color: #37474F;
     color: #FFF;
     border: none;
     border-radius: 4px;
     padding: 10px 12px;
     cursor: pointer;
     transition: background 0.2s ease;
   }
   
   .sidebar-toggle:hover, .sidebar-fullscreen-toggle:hover {
     background-color: #455A64;
   }
   
   .sidebar.fullscreen {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 1000;
     transition: none;
   }
   ```

4. **Main Content & Component Layout:**
   - Add padding and margin enhancements to main content for a card-like layout.
   - Use subtle box shadows and rounded corners on content sections (e.g., clock, stopwatch).
   - Ensure consistency between the sidebar and main content in spacing and alignment.

   _Example CSS snippet:_
   ```
   .main-content {
     padding: 20px;
     background-color: #fff;
     border-radius: 8px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
     margin: 20px;
     transition: margin-left 0.3s ease;
   }
   ```

5. **Additional UI Polishing:**
   - Update input styles (e.g., timer tag input) to have a cleaner appearance with rounded borders and clear focus states.
   - Adjust headings and dividers for a balanced layout.

   _Example CSS snippet:_
   ```
   .timer-tag input {
     padding: 8px;
     font-size: 16px;
     border: 1px solid #ccc;
     border-radius: 4px;
     width: 80%;
     max-width: 300px;
     transition: border 0.2s ease;
   }
   
   .timer-tag input:focus {
     border-color: #1976D2;
     outline: none;
   }
   
   .divider {
     width: 80%;
     height: 1px;
     background-color: #e0e0e0;
     margin: 20px auto;
   }
   ```

## Summary of Needed Changes
- **Modify App.css**: Update styles for body, .App, .sidebar, .main-content, .controls button, and inputs.
- **Update global styles**: Ensure consistency across components with new colors, fonts, and spacing.
- **No changes needed to App.tsx logic**: All UI improvements are handled via CSS updates and minor adjustments to markup for better layout structure.

This plan outlines the specific CSS changes and layout improvements to make the UI look a lot better. Further adjustments can be made based on feedback.

feature-save-timer-intervals-plan.md
