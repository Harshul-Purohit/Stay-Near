import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const { showToast } = useToast();

  const addToCompare = (hostel) => {
    // Check duplicate
    if (compareList.find((h) => h._id === hostel._id)) {
      showToast('Hostel is already added to comparison.', 'warning');
      return;
    }

    // Check limit
    if (compareList.length >= 3) {
      showToast('You can compare a maximum of 3 hostels at a time.', 'warning');
      return;
    }

    setCompareList((prev) => [...prev, hostel]);
    showToast(`${hostel.name} added to comparison list.`, 'success');
  };

  const removeFromCompare = (hostelId) => {
    setCompareList((prev) => prev.filter((h) => h._id !== hostelId));
    showToast('Hostel removed from comparison list.', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
    showToast('Comparison list cleared.', 'info');
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
