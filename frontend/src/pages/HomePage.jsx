import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import FeaturedResidences from '../components/FeaturedResidences';
import Services from '../components/Services';
import StatsBanner from '../components/StatsBanner';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

function HomePage() {
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
