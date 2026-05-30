/*
 * File: src\components\Spacer.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React from "react";
// Import project dependencies
import { View } from "react-native";

// Define a function or component using an arrow function
const Spacer = ({ size = 16, horizontal = false }) => {
// Return JSX layout
  return (
    <View
      style={{ width: horizontal ? size : 0, height: horizontal ? 0 : size }}
    />
  );
};

// Export the default component or module
export default Spacer;
