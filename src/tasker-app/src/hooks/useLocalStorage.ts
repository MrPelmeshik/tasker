import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../services/storage';

/**
 * Hook for managing state in localStorage.
 * 
 * @param key Storage key
 * @param initialValue Initial value if nothing is in storage
 * @returns [storedValue, setValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Get from local storage then
    // parse stored json or if none return initialValue
    const readValue = useCallback((): T => {
        try {
            const item = safeLocalStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }, [key, initialValue]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            safeLocalStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    useEffect(() => {
        setStoredValue(readValue());
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    return [storedValue, setValue];
}
