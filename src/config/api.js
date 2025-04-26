// API 基礎 URL
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3002'  // 開發環境
  : 'http://103.88.33.228:3002';  // 生產環境

// API 端點
export const API_ENDPOINTS = {
  TEST_CONNECTION: '/api/test-connection',
  ELIGIBLE_ACCOUNTS: '/api/eligible-accounts',
  UPDATE_POST_STATUS: (postId) => `/api/posts/${postId}/status`
}; 