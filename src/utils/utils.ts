
// Utility functions for the application

// Format date to display in a user-friendly format
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Generate a unique ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sort an array of objects by a specific property
export const sortByProperty = <T>(array: T[], property: keyof T, ascending: boolean = true): T[] => {
  return [...array].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
};

// Check if a string is empty or only contains whitespace
export const isEmptyString = (str: string): boolean => {
  return str.trim() === '';
};
