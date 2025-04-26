const API_BASE_URL = 'https://backend-itzze730b-jack0504-yos-projects.vercel.app/'

// 登錄函數
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('登錄失敗');
    }

    return await response.json();
  } catch (error) {
    console.error('登錄錯誤:', error);
    throw error;
  }
};

// 註冊函數（如果需要）
export const register = async (username, password, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    });

    if (!response.ok) {
      throw new Error('註冊失敗');
    }

    return await response.json();
  } catch (error) {
    console.error('註冊錯誤:', error);
    throw error;
  }
};

// 其他身份驗證相關的函數（如登出、檢查登錄狀態等） 