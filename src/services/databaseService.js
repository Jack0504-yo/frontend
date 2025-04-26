import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export const testDatabaseConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEST_CONNECTION}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '資料庫連接測試失敗');
    }
    
    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
}; 