import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StorageProvider } from './src/storage/StorageContext';
import AppNavigator from './src/navigation/AppNavigator';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f0f7ff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a2472',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryBtn: {
    backgroundColor: '#0a2472',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StorageProvider>
          <AppNavigator />
        </StorageProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
