import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PropertyList from '../components/PropertyList';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <main>
        <PropertyList />
      </main>
      <Footer />
    </>
  );
}

export default HomePage;
