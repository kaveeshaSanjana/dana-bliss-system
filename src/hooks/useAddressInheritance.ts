import { useState, useCallback, useEffect } from 'react';

// Storage key for address inheritance (session-based, cleared on browser close)
const ADDRESS_STORAGE_KEY = 'suraksha_address_inheritance';

export interface AddressData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface StoredAddress extends AddressData {
  source: 'father' | 'mother' | 'guardian';
  sourceName: string;
  timestamp: number;
}

interface AddressInheritanceReturn {
  // Get all stored addresses
  getStoredAddresses: () => StoredAddress[];
  
  // Save an address from a parent/guardian
  saveAddress: (address: AddressData, source: 'father' | 'mother' | 'guardian', sourceName: string) => void;
  
  // Get suggestion (most recent address that's not from current source)
  getSuggestion: (currentSource: 'father' | 'mother' | 'guardian' | 'student') => StoredAddress | null;
  
  // Clear all stored addresses
  clearAddresses: () => void;
  
  // Check if there are any stored addresses
  hasStoredAddresses: () => boolean;
}

export const useAddressInheritance = (): AddressInheritanceReturn => {
  // Read from sessionStorage
  const getStoredAddresses = useCallback((): StoredAddress[] => {
    try {
      const stored = sessionStorage.getItem(ADDRESS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as StoredAddress[];
    } catch {
      return [];
    }
  }, []);

  // Save an address
  const saveAddress = useCallback((
    address: AddressData, 
    source: 'father' | 'mother' | 'guardian',
    sourceName: string
  ) => {
    try {
      // Only save if address has meaningful data
      if (!address.province && !address.district && !address.city && !address.addressLine1) {
        return;
      }

      const stored = getStoredAddresses();
      
      // Remove existing address from same source
      const filtered = stored.filter(a => a.source !== source);
      
      // Add new address
      const newAddress: StoredAddress = {
        ...address,
        source,
        sourceName,
        timestamp: Date.now()
      };
      
      filtered.push(newAddress);
      
      sessionStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }, [getStoredAddresses]);

  // Get suggestion for current form
  const getSuggestion = useCallback((currentSource: 'father' | 'mother' | 'guardian' | 'student'): StoredAddress | null => {
    try {
      const stored = getStoredAddresses();
      
      if (stored.length === 0) return null;
      
      // Filter out addresses from same source (unless it's student who can use any)
      const available = currentSource === 'student' 
        ? stored 
        : stored.filter(a => a.source !== currentSource);
      
      if (available.length === 0) return null;
      
      // Return most recent address
      return available.sort((a, b) => b.timestamp - a.timestamp)[0];
    } catch {
      return null;
    }
  }, [getStoredAddresses]);

  // Clear all addresses
  const clearAddresses = useCallback(() => {
    try {
      sessionStorage.removeItem(ADDRESS_STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }, []);

  // Check if there are stored addresses
  const hasStoredAddresses = useCallback((): boolean => {
    return getStoredAddresses().length > 0;
  }, [getStoredAddresses]);

  return {
    getStoredAddresses,
    saveAddress,
    getSuggestion,
    clearAddresses,
    hasStoredAddresses
  };
};
