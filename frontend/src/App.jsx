import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import ResidencesPage from './pages/ResidencesPage';
import PropertiesPage from './pages/PropertiesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/residences" element={<ResidencesPage />} />
      <Route path="/properties" element={<PropertiesPage />} />
    </Routes>
  );
}

export default App;
