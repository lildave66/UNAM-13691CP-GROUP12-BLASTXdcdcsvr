import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define our color palettes
export const Colors = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1F3A',
    textSecondary: '#666666',
    primary: '#FF9900',
    border: '#ECEFF1',
    surface: '#FFFFFF',
    statusScheduled: '#FF9900',
    statusCompleted: '#27AE60',
    statusFailed: '#E74C3C',
  },
  dark: {
    background: '#0F1222',
    card: '#1A1F3A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    primary: '#FF9900',
    border: '#2C3E50',
    surface: '#161B33',
    statusScheduled: '#FFB84D',
    statusCompleted: '#2ECC71',
    statusFailed: '#FF5E5E',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('user-theme', newMode ? 'dark' : 'light');
  };

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
