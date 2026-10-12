import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser } from '../services/api';

const UserList = ({ onEdit, refreshTrigger = 0 }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchUsers();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || 'Erreur lors de la récupération des utilisateurs');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.firstName} ${user.lastName}" ?`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || 'Erreur lors de la suppression'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'CLIENT':
        return 'badge-client';
      case 'PROFESSIONAL':
        return 'badge-professional';
      case 'ADMIN':
        return 'badge-admin';
      default:
        return '';
    }
  };

  return (
    <section className="crud-list user-list">
      {actionError && <div className="alert-error">{actionError}</div>}

      {loading && <p className="user-loading">Chargement des utilisateurs...</p>}

      {error && (
        <p className="user-error">Erreur lors de la récupération : {error}</p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="user-empty">Aucun utilisateur trouvé.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive">
          <table className="user-table crud-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`badge-role ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit && onEdit(user)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default UserList;
