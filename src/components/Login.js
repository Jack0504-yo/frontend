import React, { useState } from 'react';
import { login } from '../api/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      console.log('登錄成功:', data);
      // 處理登錄成功後的邏輯（如保存 token、重定向等）
    } catch (error) {
      setError('登錄失敗，請檢查用戶名和密碼');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="用戶名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">登錄</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Login; 