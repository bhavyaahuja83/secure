import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PasscodeScreen from './components/PasscodeScreen';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Bills from './pages/Bills';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import NotFound from './pages/NotFound';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { validatePasscode, setCurrentUser, getCurrentUser, logout } from './utils/auth';
import { toast } from 'sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleAuthenticate = (passcode: string) => {
    const user = validatePasscode(passcode);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Invalid passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <PasscodeScreen onAuthenticate={handleAuthenticate} />
      ) : (
        <Router>
          <Layout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      )}
    </div>
  );
}

export default App;
