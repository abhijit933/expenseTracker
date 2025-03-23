import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Transactions from './components/Transactions/Transactions';
import Budgets from './components/Budgets/Budgets';
import PrivateRoute from './components/Auth/PrivateRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
              </Routes>
            </AppLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
