const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = "recentSearches";

export const clearStoredRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error("Error clearing recent searches:", error);
  }
};

export const getStoredRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch (error) {
    console.error("Error loading recent searches:", error);
    return [];
  }
};

export const saveRecentSearch = (searchTerm: string) => {
  if (!searchTerm.trim()) {
    return getStoredRecentSearches();
  }

  const trimmedTerm = searchTerm.trim();
  const filtered = getStoredRecentSearches().filter(
    (term) => term !== trimmedTerm
  );
  const updated = [trimmedTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving recent searches:", error);
  }

  return updated;
};
