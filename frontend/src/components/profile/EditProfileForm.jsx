import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';

const EditProfileForm = ({ onProfileUpdated }) => {
  const { user, updateUserState } = useAuth();

  const isAgency = user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [iceNumber, setIceNumber] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Pré-remplissage des champs avec les données actuelles de l'utilisateur
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCompanyName(user.companyName || '');
      setRcNumber(user.rcNumber || '');
      setIceNumber(user.iceNumber || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      };

      if (isAgency) {
        payload.companyName = companyName.trim();
        payload.rcNumber = rcNumber.trim();
        payload.iceNumber = iceNumber.trim();
      }

      // Appel de l'endpoint PUT /api/users/{id}/profile
      const updatedUser = await updateProfile(user.id, payload);

      // Mise à jour de l'AuthContext et du localStorage
      updateUserState(updatedUser);

      setFeedback({
        type: 'success',
        message: 'Vos informations ont été enregistrées et mises à jour avec succès.',
      });

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Une erreur est survenue lors de la mise à jour du profil.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-form-wrapper">
      {feedback.message && (
        <div
          className={`auth-alert ${feedback.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}
          style={{ marginBottom: '18px' }}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Champs spécifiques aux Agences */}
        {isAgency && (
          <>
            <div className="form-group">
              <label htmlFor="companyName">Raison sociale / Nom de l'agence *</label>
              <input
                id="companyName"
                type="text"
                required
                className="input-field"
                placeholder="Ex: Atlas Immobilier SARL"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="rcNumber">Registre du Commerce (RC) *</label>
                <input
                  id="rcNumber"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ex: RC-12345"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="iceNumber">Identifiant Entreprise (ICE) *</label>
                <input
                  id="iceNumber"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ex: 001234567000089"
                  value={iceNumber}
                  onChange={(e) => setIceNumber(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Informations Personnelles (Responsable ou Client) */}
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="firstName">
              {isAgency ? 'Prénom du responsable *' : 'Prénom *'}
            </label>
            <input
              id="firstName"
              type="text"
              required
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              {isAgency ? 'Nom du responsable *' : 'Nom *'}
            </label>
            <input
              id="lastName"
              type="text"
              required
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="form-group">
          <label htmlFor="phone">Numéro de téléphone *</label>
          <input
            id="phone"
            type="tel"
            required
            className="input-field"
            placeholder="Ex: +212 600-000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Email non modifiable */}
        <div className="form-group">
          <label htmlFor="email">Adresse email (non modifiable)</label>
          <input
            id="email"
            type="email"
            disabled
            className="input-field input-field-disabled"
            value={user?.email || ''}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-urbanet-primary"
          style={{ width: '100%', marginTop: '8px' }}
        >
          {saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;

