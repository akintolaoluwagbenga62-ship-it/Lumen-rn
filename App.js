// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function StatusBarManager() {
  const app = useApp();
  return <StatusBar barStyle={app.darkMode ? 'light-content' : 'dark-content'} backgroundColor={app.darkMode ? '#0A0A0C' : '#F8F8F7'} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBarManager />
        <AppNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
