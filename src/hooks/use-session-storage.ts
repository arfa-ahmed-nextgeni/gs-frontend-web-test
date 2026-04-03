import { useCallback, useEffect, useState } from "react";

import { useWindowStorageEvent } from "@/hooks/use-window-storage-event";

/**
 * Custom hook that syncs state with sessionStorage
 * Similar to useState but persists value in sessionStorage
 *
 * @param key - The sessionStorage key
 * @param initialValue - Initial value if nothing is stored
 * @returns [value, setValue] tuple similar to useState
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: ((prev: T) => T) | T) => void] {
  const storageEvent = useWindowStorageEvent();

  // Initialize state with value from sessionStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(
        `Failed to read from sessionStorage for key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // Update sessionStorage whenever state changes
  const setValue = useCallback(
    (value: ((prev: T) => T) | T) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(
          `Failed to write to sessionStorage for key "${key}":`,
          error
        );
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    if (
      storageEvent.version === 0 ||
      storageEvent.key !== key ||
      storageEvent.newValue === null ||
      storageEvent.storageArea !== "sessionStorage"
    ) {
      return;
    }

    try {
      setStoredValue(JSON.parse(storageEvent.newValue) as T);
    } catch (error) {
      console.error(
        `Failed to parse sessionStorage value for key "${key}":`,
        error
      );
    }
  }, [key, storageEvent]);

  return [storedValue, setValue];
}
