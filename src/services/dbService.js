import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export const testDatabaseConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEST_CONNECTION}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '伺服器錯誤' }));
      throw new Error(errorData.message || '資料庫連接測試失敗');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
};

export const addEligibleAccount = async (accountId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ELIGIBLE_ACCOUNTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '伺服器錯誤' }));
      throw new Error(errorData.message || '添加資格失敗');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
};