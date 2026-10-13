import React, { useState } from 'react';
import Header from '../components/Header';
import ResidenceList from '../components/ResidenceList';
import ResidenceForm from '../components/ResidenceForm';
import Footer from '../components/Footer';

function ResidencesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residenceToEdit, setResidenceToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenCreate = () => {
    setResidenceToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (residence) => {
    setResidenceToEdit(residence);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setResidenceToEdit(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsModalOpen(false);
    setResidenceToEdit(null);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="crud-page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestion des Résidences</h1>
            <p className="page-subtitle">Créez et gérez vos ensembles résidentiels et immeubles.</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-add"
            onClick={handleOpenCreate}
          >
            + Ajouter une résidence
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                &times;
              </button>
              <ResidenceForm
                residenceToEdit={residenceToEdit}
                onSuccess={handleSuccess}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        )}

        <ResidenceList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      </main>
      <Footer />
    </div>
  );
}

export default ResidencesPage;
