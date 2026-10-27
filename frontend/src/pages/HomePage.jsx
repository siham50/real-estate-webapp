import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { testBackend } from '../services/api';

function HomePage() {
  const [backendStatus, setBackendStatus] = useState('Vérification...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await testBackend();
        setBackendStatus(res.success ? 'Opérationnel' : 'Erreur de connexion');
      } catch (err) {
        setBackendStatus('Non joignable');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="page-wrapper">
      <Header />
      <Hero />
      <main className="home-main">
        <section className="welcome-section">
          <div className="welcome-container">
            <h2>Bienvenue sur Real Estate</h2>
            <p>La référence pour vos projets immobiliers : vente, location et investissement au Maroc.</p>
            <div className={`status-badge ${backendStatus === 'Opérationnel' ? 'status-ok' : 'status-pending'}`}>
              Backend API : {backendStatus}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
