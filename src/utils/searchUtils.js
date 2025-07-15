// Enhanced search utilities for product filtering

/**
 * Basic case-insensitive search
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to search for
 * @returns {boolean} - True if text contains searchTerm (case-insensitive)
 */
export const basicSearch = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Advanced search with multiple fields
 * @param {Object} product - The product object
 * @param {string} searchTerm - The term to search for
 * @returns {boolean} - True if any field matches the search term
 */
export const advancedProductSearch = (product, searchTerm) => {
  if (!searchTerm.trim()) return true;
  
  const searchFields = [
    product.productName,
    product.description,
    product.categoryName,
    product.productId?.toString()
  ].filter(Boolean); // Remove null/undefined values
  
  return searchFields.some(field => 
    field.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Fuzzy search with typo tolerance
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to search for
 * @param {number} tolerance - Number of character differences allowed (default: 1)
 * @returns {boolean} - True if text matches searchTerm with tolerance
 */
export const fuzzySearch = (text, searchTerm, tolerance = 1) => {
  if (!text || !searchTerm) return false;
  
  const textLower = text.toLowerCase();
  const termLower = searchTerm.toLowerCase();
  
  // Exact match
  if (textLower.includes(termLower)) return true;
  
  // Simple fuzzy matching (you can implement more sophisticated algorithms)
  const words = textLower.split(' ');
  return words.some(word => {
    const distance = levenshteinDistance(word, termLower);
    return distance <= tolerance;
  });
};

/**
 * Levenshtein distance calculation for fuzzy search
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Distance between strings
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Search with accent-insensitive matching
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to search for
 * @returns {boolean} - True if text contains searchTerm (accent-insensitive)
 */
export const accentInsensitiveSearch = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  
  const normalizeText = (str) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd'); // Handle Vietnamese đ
  };
  
  return normalizeText(text).includes(normalizeText(searchTerm));
};

/**
 * Multi-field product search with configurable fields
 * @param {Object} product - The product object
 * @param {string} searchTerm - The term to search for
 * @param {Array} searchFields - Array of field names to search in
 * @returns {boolean} - True if any field matches the search term
 */
export const multiFieldSearch = (product, searchTerm, searchFields = ['productName', 'description']) => {
  if (!searchTerm.trim()) return true;
  
  return searchFields.some(field => {
    const value = product[field];
    if (!value) return false;
    return basicSearch(value.toString(), searchTerm);
  });
}; 