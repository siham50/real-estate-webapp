import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../services/api';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'CLIENT',
};

const UserForm = ({ userToEdit = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = Boolean(userToEdit && userToEdit.id);

  useEffect(() => {
    if (userToEdit && userToEdit.id) {
      setFormData({
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        email: userToEdit.email || '',
        password: '',
        phone: userToEdit.phone || '',
        role: userToEdit.role || 'CLIENT',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setSuccessMessage('');
    setErrorMessage('');
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      if (isEditMode) {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };
        if (formData.password && formData.password.trim() !== '') {
          payload.password = formData.password;
        }

        await updateUser(userToEdit.id, payload);
        setSuccessMessage('Utilisateur modifié avec succès !');
        setFormData(INITIAL_FORM);
        if (onSuccess) onSuccess();
      } else {
        const result = await createUser(formData);
        if (result.success) {
          setSuccessMessage('Utilisateur créé avec succès !');
          setFormData(INITIAL_FORM);
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(result.error || "Erreur lors de la création de l'utilisateur");
        }
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-form user-form">
      <h2>{isEditMode ? 'Modifier l’utilisateur' : 'Ajouter un utilisateur'}</h2>

      {successMessage && <div className="alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userFirstName">Prénom *</label>
            <input
              type="text"
              id="userFirstName"
              name="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userLastName">Nom *</label>
            <input
              type="text"
              id="userLastName"
              name="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userEmail">Email *</label>
            <input
              type="email"
              id="userEmail"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userPhone">Téléphone</label>
            <input
              type="text"
              id="userPhone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userPassword">
              {isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
            </label>
            <input
              type="password"
              id="userPassword"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? 'Laisser vide pour conserver l’actuel' : ''}
              required={!isEditMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="userRole">Rôle *</label>
            <select
              id="userRole"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="CLIENT">CLIENT</option>
              <option value="PROFESSIONAL">PROFESSIONAL</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-secondary btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? 'Enregistrement...'
              : isEditMode
              ? 'Mettre à jour'
              : 'Créer l’utilisateur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
