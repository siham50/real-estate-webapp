import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import FeaturedResidences from '../components/FeaturedResidences';
import Services from '../components/Services';
import StatsBanner from '../components/StatsBanner';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

function HomePage() {
  const { user } = useAuth();
  const userRole = String(user?.role || '').toUpperCase();
  const isAgency =
    userRole === 'PROFESSIONAL' ||
    userRole === 'AGENCE' ||
    userRole === 'AGENCY' ||
    userRole.includes('PRO') ||
    userRole.includes('AGENC') ||
    Boolean(user?.companyName);
  const isAdmin = userRole === 'ADMIN' || userRole.includes('ADMIN');

  // Pour le compte agence, pas de navigation publique des biens/résidences -> redirection dashboard
  if (isAgency) {
    return <Navigate to="/agency/dashboard" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const [selectedResidenceId, setSelectedResidenceId] = useState(null);

  const handleSelectResidence = (residenceId) => {
    setSelectedResidenceId(residenceId);
    const el = document.getElementById('annonces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="urbanet-app-root">
      <Header />
      <main className="urbanet-main">
        <Hero />
        <FeaturedProperties filterResidenceId={selectedResidenceId} />
        <FeaturedResidences onSelectResidence={handleSelectResidence} />
        <Services />
        <StatsBanner />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
