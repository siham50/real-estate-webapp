import React, { useState } from 'react';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import Footer from '../components/Footer';

function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="crud-page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestion des Utilisateurs</h1>
            <p className="page-subtitle">Consultez, ajoutez, modifiez ou supprimez les comptes utilisateurs.</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-add"
            onClick={handleOpenCreate}
          >
            + Ajouter un utilisateur
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
              <UserForm
                userToEdit={userToEdit}
                onSuccess={handleSuccess}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        )}

        <UserList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      </main>
      <Footer />
    </div>
  );
}

export default UsersPage;
