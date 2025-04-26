import { API_BASE_URL } from '../config/api'

// 獲取所有管理員
export const getAllAdmins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/list`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('獲取管理員列表失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('獲取管理員列表錯誤:', error);
    throw error;
  }
}

// 根據用戶名獲取管理員
export const getAdminByUsername = async (username) => {
  try {
    console.log('Fetching admin by username:', username);
    const response = await fetch(`${API_BASE_URL}/api/admin/by-username/${username}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Admin not found');
        return null;
      }
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.message || '獲取管理員信息失敗');
    }
    
    const data = await response.json();
    console.log('Admin data:', data);
    return data;
  } catch (error) {
    console.error('獲取管理員錯誤:', error);
    throw error;
  }
}

// 創建新管理員
export const createAdmin = async (adminData) => {
  try {
    console.log('Creating admin with data:', adminData);
    const response = await fetch(`${API_BASE_URL}/api/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(adminData)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.message || '創建管理員失敗');
    }
    
    const data = await response.json();
    console.log('Created admin:', data);
    return data;
  } catch (error) {
    console.error('創建管理員錯誤:', error);
    throw error;
  }
}

// 更新管理員
export const updateAdmin = async (id, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('更新管理員失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新管理員錯誤:', error);
    throw error;
  }
}

// 刪除管理員
export const deleteAdmin = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('刪除管理員失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('刪除管理員錯誤:', error);
    throw error;
  }
}

// 修改管理員密碼
export const changeAdminPassword = async (id, oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/${id}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    
    if (!response.ok) {
      throw new Error('修改密碼失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('修改密碼錯誤:', error);
    throw error;
  }
}

// 獲取管理員數量
export const getAdminsCount = async () => {
  try {
    const admins = await getAllAdmins();
    return admins.length;
  } catch (error) {
    console.error('獲取管理員數量錯誤:', error);
    throw error;
  }
}