import React from 'react';
import Header from '../components/Header';
import UserList from '../components/UserList';
import Footer from '../components/Footer';

function UsersPage() {
  return (
    <>
      <Header />
      <main>
        <UserList />
      </main>
      <Footer />
    </>
  );
}

export default UsersPage;
