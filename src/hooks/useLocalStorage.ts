import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with auto-save
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

/**
 * Hook for debounced auto-save to localStorage
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay: number = 500
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        setLastSaved(new Date());
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, key, delay]);

  return [value, setValue, lastSaved] as const;
}
