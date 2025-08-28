import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../components/NavBar';

interface LayoutProps {
    showTopNavBar?: boolean;
  }

  const Layout: React.FC<LayoutProps> = ({ showTopNavBar = true }) => {


    return (
        <div>
          {showTopNavBar && (
            <header className="sticky top-0 z-50">
              <Nav />
            </header>
          )}
          <main>
            <Outlet /> {/* Routed components will be rendered here */}
          </main>
        </div>
    );
  };
  
  export default Layout;