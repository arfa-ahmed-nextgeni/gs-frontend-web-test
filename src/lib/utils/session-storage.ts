import "client-only";

/**
 * Get a value from sessionStorage
 * @param key - The sessionStorage key
 * @returns The stored value as a string, or null if not found
 */
export function getSessionStorage(key: string): null | string {
  try {
    return sessionStorage.getItem(key);
  } catch {
    console.error(`Failed to get sessionStorage for key "${key}"`);
    return null;
  }
}

/**
 * Get and parse a JSON value from sessionStorage
 * @param key - The sessionStorage key
 * @returns The parsed JSON value, or null if not found or parsing fails
 */
export function getSessionStorageJson<T>(key: string): null | T {
  const value = getSessionStorage(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(
      `Failed to parse sessionStorage JSON for key "${key}":`,
      error
    );
    return null;
  }
}

/**
 * Check if a key exists in sessionStorage
 * @param key - The sessionStorage key
 * @returns true if the key exists, false otherwise
 */
export function hasSessionStorage(key: string): boolean {
  return getSessionStorage(key) !== null;
}

/**
 * Remove a value from sessionStorage
 * @param key - The sessionStorage key
 */
export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    console.error(`Failed to remove sessionStorage for key "${key}"`);
  }
}

/**
 * Set a value in sessionStorage
 * @param key - The sessionStorage key
 * @param value - The value to store
 */
export function setSessionStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    console.error(`Failed to set sessionStorage for key "${key}":`, value);
  }
}
