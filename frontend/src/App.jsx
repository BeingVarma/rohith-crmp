import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyData from './pages/CompanyData';
import CustomerData from './pages/CustomerData';
import Profile from './pages/Profile';
import Layout from './components/Layout';

export const ThemeContext = createContext();
export const AuthContext = createContext();

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
              <Route element={token ? <Layout /> : <Navigate to="/login" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/companies" element={<CompanyData />} />
                <Route path="/customers" element={<CustomerData />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
