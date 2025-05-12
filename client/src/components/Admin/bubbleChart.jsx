import { API_BASE_URL } from '@/config';
import { getAuthHeaders, handleResponse } from '@/utils/auth';

const fetchBubbleData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/bubble`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching bubble data:', error);
    throw error;
  }
}; 