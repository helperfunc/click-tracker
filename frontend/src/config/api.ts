export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getAuthHeaders = async (user: any) => {
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};