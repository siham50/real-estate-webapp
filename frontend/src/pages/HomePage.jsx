import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import Services from '../components/Services';
import StatsBanner from '../components/StatsBanner';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div className="urbanet-app-root">
      <Header />
      <main className="urbanet-main">
        <Hero />
        <FeaturedProperties />
        <Services />
        <StatsBanner />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
