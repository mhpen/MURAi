/**
 * Utility script to clear authentication tokens from localStorage
 * This can be used to force users to re-login after JWT secret changes
 */

export const clearAuthTokens = () => {
  try {
    // Remove the token
    localStorage.removeItem('token');
    console.log('Authentication token cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing authentication tokens:', error);
    return false;
  }
};

// Auto-execute if this script is imported directly
if (typeof window !== 'undefined') {
  clearAuthTokens();
}
