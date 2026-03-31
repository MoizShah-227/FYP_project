import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../config/axiosConfig.js"; 

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Call backend login API
      const response = await api.post("/user/login", {
        regno: username,  
        password: password
      },{withCredentials: true});
  
  
      localStorage.setItem("token", response.data.token);
  
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      navigate("/feed");
  
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div
      className="vh-100 vw-100 d-flex align-items-center justify-content-center m-0 p-0"
      style={{
        backgroundColor: '#f4f7f6', // Light neutral background
        fontFamily: 'sans-serif'
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        <div className="card-body p-5">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#07333d', fontSize: '2.5rem' }}>
              Login
            </h2>
            <p className="text-muted">Please enter your credentials</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Username field */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase text-muted">Username</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="2022-adm-4531"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  height: '55px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6'
                }}
              />
            </div>

            {/* Password field */}
            <div className="mb-5 position-relative">
              <label className="form-label small fw-bold text-uppercase text-muted">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control rounded-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  height: '55px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6'
                }}
              />
              <button
                type="button"
                className="position-absolute end-0 translate-middle-y bg-transparent border-0 pe-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ top: '70%', color: '#adb5bd' }}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709zM11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12 .708-.708 12 12-.708.708z"/></svg>
                ) : (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                )}
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="btn w-100 text-white fw-bold"
              style={{
                backgroundColor: '#ffa726',
                height: '55px',
                fontSize: '1.2rem',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 15px rgba(255, 167, 38, 0.3)'
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;