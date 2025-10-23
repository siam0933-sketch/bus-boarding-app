import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AppProvider } from './src/context/AppContext';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  return (
    <PaperProvider>
      <AppProvider>
        <MainScreen />
        <StatusBar style="auto" />
      </AppProvider>
    </PaperProvider>
  );
}
