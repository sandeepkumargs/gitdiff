import React, { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { getUser } from '../pages/services/service';

interface ProjectDetails {
  id?: string;
  name?: string;
  description?: string;
}

interface PortfolioDetails {
  id?: string;
  name?: string;
  projectCount?: number;
}

interface AppName {
  name?: string;
}

interface AppContextType {
  data: {
    projectDetails: ProjectDetails;
    portfolioDetails: PortfolioDetails;
    appName: AppName;
  };
  setData: React.Dispatch<React.SetStateAction<{
    projectDetails: ProjectDetails;
    portfolioDetails: PortfolioDetails;
    appName: AppName;
  }>>;
  isCollapsed: boolean;
  showModal: boolean;
  refreshData: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRefreshData: React.Dispatch<React.SetStateAction<boolean>>;
}

// Initialize context with default undefined and handle when needed
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem('appData');
    return storedData
      ? JSON.parse(storedData)
      : {
          projectDetails: {} as ProjectDetails,
          portfolioDetails: {} as PortfolioDetails,
          appName: {} as AppName,
        };
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AppContext.Provider value={{ data, setData, isCollapsed, setIsCollapsed, showModal, setShowModal, refreshData, setRefreshData }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context safely
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
