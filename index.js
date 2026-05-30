/*
 * File: index.js
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import { registerRootComponent } from 'expo';
// Import project dependencies
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
