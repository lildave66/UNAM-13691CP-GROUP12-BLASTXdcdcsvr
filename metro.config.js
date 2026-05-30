/*
 * File: metro.config.js
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Declare a constant or variable
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
// Declare a constant or variable
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Add specific module resolution for Firebase
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
