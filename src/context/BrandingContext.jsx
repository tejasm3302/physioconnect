import { createContext, useContext, useState, useEffect } from 'react';
import { localDB } from '../utils/localDB';

const BrandingContext = createContext(null);

const defaultBranding = {
  companyName: 'PhysioConnect',
  tagline: 'Find Your Perfect Physiotherapist',
  logo: null,
  primaryColor: '#0d9488',
  accentColor: '#fbbf24',
  contactEmail: 'support@physioconnect.com',
  contactPhone: '+91 98765 43210'
};

export function BrandingProvider({ children }) {
  const [branding, setBrandingState] = useState(() => {
    return localDB.getBranding() || defaultBranding;
  });

  const updateBranding = (updates) => {
    const newBranding = { ...branding, ...updates };
    setBrandingState(newBranding);
    localDB.setBranding(newBranding);
    return newBranding;
  };

  const resetBranding = () => {
    setBrandingState(defaultBranding);
    localDB.setBranding(defaultBranding);
  };

  useEffect(() => {
    const saved = localDB.getBranding();
    if (saved) {
      setBrandingState(saved);
    }
  }, []);

  const value = {
    branding,
    updateBranding,
    resetBranding
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

export default BrandingContext;
