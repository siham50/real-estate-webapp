import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { testBackend, fetchUsers, fetchResidences, fetchProperties } from '../services/api';

function HomePage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    residencesCount: 0,
    propertiesCount: 0,
    backendStatus: 'Vérification...',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const backendRes = await testBackend();
        const [usersRes, residencesRes, propertiesRes] = await Promise.allSettled([
          fetchUsers(),
          fetchResidences(),
          fetchProperties(),
        ]);

        const usersCount =
          usersRes.status === 'fulfilled' && usersRes.value.success && Array.isArray(usersRes.value.data)
            ? usersRes.value.data.length
            : 0;

        const residencesCount =
          residencesRes.status === 'fulfilled' && Array.isArray(residencesRes.value.data)
            ? residencesRes.value.data.length
            : 0;

        const propertiesCount =
          propertiesRes.status === 'fulfilled' && Array.isArray(propertiesRes.value.data)
            ? propertiesRes.value.data.length
            : 0;

        setStats({
          usersCount,
          residencesCount,
          propertiesCount,
          backendStatus: backendRes.success ? 'Opérationnel' : 'Erreur de connexion',
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, backendStatus: 'Non joignable' }));
      }
    };

    loadStats();
  }, []);

  return (
    <div className="page-wrapper">
      <Header />
      <Hero />
      <main className="home-main">
        <section className="dashboard-section">
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h2>Tableau de bord & Gestion Immobilière</h2>
              <p>Accédez rapidement à l'administration des données clés de la plateforme.</p>
            </div>

            <div className="dashboard-grid">
              <Link to="/properties" className="dash-card">
                <div className="dash-icon-wrapper icon-property">
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3>Biens Immobiliers</h3>
                <p>Gestion CRUD des appartements, villas, terrains à vendre ou à louer.</p>
                <div className="dash-stat">
                  <span className="stat-number">{stats.propertiesCount}</span> biens enregistrés
                </div>
                <span className="dash-link">Gérer les biens &rarr;</span>
              </Link>

              <Link to="/residences" className="dash-card">
                <div className="dash-icon-wrapper icon-residence">
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3>Résidences</h3>
                <p>Gestion des ensembles résidentiels, immeubles et lotissements.</p>
                <div className="dash-stat">
                  <span className="stat-number">{stats.residencesCount}</span> résidences
                </div>
                <span className="dash-link">Gérer les résidences &rarr;</span>
              </Link>

              <Link to="/users" className="dash-card">
                <div className="dash-icon-wrapper icon-user">
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3>Utilisateurs</h3>
                <p>Comptes clients, agents professionnels et administrateurs.</p>
                <div className="dash-stat">
                  <span className="stat-number">{stats.usersCount}</span> utilisateurs
                </div>
                <span className="dash-link">Gérer les utilisateurs &rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
