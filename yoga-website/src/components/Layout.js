import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();

  const hideNavbarPaths = ['/login', '/signup'];

  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <div style={{ paddingTop: hideNavbarPaths.includes(location.pathname) ? '0px' : '80px' }}>
        {children}
      </div>
    </>
  );
};

export default Layout;
