import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StorageProvider } from './src/storage/StorageContext';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StorageProvider>
        <AppNavigator />
      </StorageProvider>
    </SafeAreaProvider>
  );
};

export default App;
