import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyList from './components/PropertyList';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <main>
        <PropertyList />
      </main>
      <Footer />
    </div>
  );
}

export default App;
