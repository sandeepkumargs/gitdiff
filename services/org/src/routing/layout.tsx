import React, { useMemo, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import BreadcrumbComponent from '../components/BreadCrumb';
import SideNav from '../components/SideBar/Index';
import { useAppContext } from './appContext';
import { Toast } from 'primereact/toast';

interface LayoutProps {
  showTopNavBar?: boolean;
}

type ShowToast = (options: {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
}) => void;

const Layout: React.FC<LayoutProps> = ({ showTopNavBar = true }) => {
  const { isCollapsed, setIsCollapsed } = useAppContext(); // Get values from context
  const { showModal, setShowModal } = useAppContext();
  const { refreshData, setRefreshData } = useAppContext();

  const toastRef = useRef<Toast | null>(null);
  const showToast = useMemo<ShowToast>(
    () => (options) => toastRef.current?.show?.(options),
    []
  );

  return (
    <div style={{ display: 'flex' }}>
      <Toast ref={toastRef} position="top-right" />
      {showTopNavBar && window.innerWidth > 768 && <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
      
      {/* Main Content Area */}
      <div
        style={{
          marginLeft: window.innerWidth < 768 ? '0rem' : (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/sign-up' ? '0rem' : isCollapsed ? '4rem' : '18rem'),
          transition: 'margin-left 0.3s ease',
          width: 'calc(100% - 18rem)',
          flexGrow: 1,
        }}
      >
        {showTopNavBar && (
          <header className="sticky top-0 z-50">
            <BreadcrumbComponent showModal={showModal} setShowModal={setShowModal} refreshData={refreshData} setRefreshData={setRefreshData} showToast={showToast} />
          </header>
        )}
        <main>
          <Outlet /> {/* Routed components will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
