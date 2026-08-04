import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage when user logging in or switching
  useEffect(() => {
    if (user && user._id) {
      const stored = localStorage.getItem(`wishlist_${user._id}`);
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse wishlist from localStorage', e);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [user]);

  const isInWishlist = (hostelId) => {
    return wishlist.some((h) => h._id === hostelId);
  };

  const toggleWishlist = (hostel) => {
    if (!user) {
      showToast('Please login to save hostels.', 'warning');
      return;
    }

    let updatedWishlist;
    const exists = wishlist.some((h) => h._id === hostel._id);
    if (exists) {
      updatedWishlist = wishlist.filter((h) => h._id !== hostel._id);
      showToast(`${hostel.name} removed from wishlist`, 'info');
    } else {
      updatedWishlist = [...wishlist, hostel];
      showToast(`${hostel.name} added to wishlist`, 'success');
    }

    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
