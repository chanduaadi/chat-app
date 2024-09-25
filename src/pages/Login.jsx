import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  '../App.css'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Call API to login user
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId:username, password }),
    });

    if (res.ok) {
      // localStorage.setItem('userId',username); // SenderId from localStorage
      // Redirect to chat page after successful login
      const userId = await res.json()
      navigate(`/chat?userId=${userId?.user?._id}`);
    }
  };

  return (
    <div className='App'>
    <div className="auth-page login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="toggle-link" onClick={() => navigate('/register')}>Don't have an account? Register here.</p>
    </div>
    </div>
  );
};

export default Login;
