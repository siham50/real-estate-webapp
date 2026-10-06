import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadUsers();
  }, []);

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
    <section className="user-list">
      <h2 className="section-title">Liste des utilisateurs</h2>

      {loading && <p className="user-loading">Chargement...</p>}

      {error && (
        <p className="user-error">Erreur lors de la récupération : {error}</p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="user-empty">Aucun utilisateur trouvé.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
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
