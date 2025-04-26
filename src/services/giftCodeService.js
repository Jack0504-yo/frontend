import axios from 'axios'

const API_URL = '/api/gift-codes'

// 設置 Axios 攔截器，自動附加 JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') // 使用 authToken 而不是 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 設置 Axios 錯誤處理，以獲取更詳細的錯誤信息
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 詳細記錄錯誤信息
    console.error('API 請求錯誤:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
    
    // 特別處理 401 錯誤
    if (error.response && error.response.status === 401) {
      console.error('認證錯誤，請重新登錄');
      // 可以選擇在這裡重定向到登錄頁面
      // window.location.href = '/admin/login';
    }
    
    return Promise.reject(error)
  }
)

// 獲取禮包碼列表
export const getGiftCodes = async (page = 1, pageSize = 10) => {
  try {
    console.log('正在獲取禮包碼列表，當前令牌:', localStorage.getItem('authToken') ? '令牌存在' : '無令牌');
    const response = await axios.get(`${API_URL}`, {
      params: {
        page,
        pageSize,
      },
    })
    return response.data
  } catch (error) {
    console.error('獲取禮包碼列表錯誤:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

// 創建新禮包碼
export const createGiftCode = async (giftCodeData) => {
  try {
    const response = await axios.post(`${API_URL}`, giftCodeData)
    return response.data
  } catch (error) {
    console.error('創建禮包碼錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}

// 刪除禮包碼
export const deleteGiftCode = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('刪除禮包碼錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}

// 延長禮包碼有效期
export const extendGiftCode = async (id, newExpiryDate) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/extend`, {
      expiryDate: newExpiryDate,
    })
    return response.data
  } catch (error) {
    console.error('延長禮包碼有效期錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}

// 更新禮包碼的特定帳號列表
export const updateGiftCodeAccounts = async (id, accountsList) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/accounts`, {
      specific_accounts: JSON.stringify(accountsList),
    })
    return response.data
  } catch (error) {
    console.error('更新特定帳號列表錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}

// 獲取禮包碼兌換記錄
export const getGiftCodeRedemptions = async (codeId, page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_URL}/${codeId}/redemptions`, {
      params: {
        page,
        pageSize,
      },
    })
    return response.data
  } catch (error) {
    console.error('獲取兌換記錄錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}

// 獲取禮包碼操作日誌
export const getGiftCodeLogs = async (codeId, page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_URL}/${codeId}/logs`, {
      params: {
        page,
        pageSize,
      },
    })
    return response.data
  } catch (error) {
    console.error('獲取操作日誌錯誤:', {
      message: error.message,
      response: error.response?.data,
    })
    throw error
  }
}