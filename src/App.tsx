import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Snackbar } from './components/Snackbar';
import { LoadingScreen } from './components/LoadingScreen';

function AppContent() {
  const { authState, isTransitioning } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isTransitioning) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen">
      {authState.isAuthenticated ? <Dashboard /> : <Auth />}
      <Snackbar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
