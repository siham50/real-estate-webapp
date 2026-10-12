import React, { useState } from 'react';
import Header from '../components/Header';
import PropertyList from '../components/PropertyList';
import PropertyForm from '../components/PropertyForm';
import Footer from '../components/Footer';

function PropertiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenCreate = () => {
    setPropertyToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (property) => {
    setPropertyToEdit(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPropertyToEdit(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsModalOpen(false);
    setPropertyToEdit(null);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="crud-page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestion des Biens Immobiliers</h1>
            <p className="page-subtitle">Ajoutez, modifiez ou supprimez vos annonces immobilières.</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-add"
            onClick={handleOpenCreate}
          >
            + Ajouter un bien
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                &times;
              </button>
              <PropertyForm
                propertyToEdit={propertyToEdit}
                onSuccess={handleSuccess}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        )}

        <PropertyList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      </main>
      <Footer />
    </div>
  );
}

export default PropertiesPage;
