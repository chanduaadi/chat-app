import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  '../App.css'

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    // Call API to register user
    const res = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId : username, password, name }),
    });

    if (res.ok) {
      navigate('/login'); // Redirect to login page after successful registration
    }
  };

  return (
    <div className='App'>
    <div className="auth-page register-page">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="UserId"
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
        <button type="submit">Register</button>
      </form>
      <p className="toggle-link" onClick={() => navigate('/login')}>Already have an account? Login here.</p>
    </div>
    </div>
  );
};

export default Register;
