import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmpassword) {
      return setError('Passwords do not match');
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 3000); // הפניה לדף התחברות
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <section className="register">
      <div className="container register__container">
        <h2>Reset your password</h2>
        <form onSubmit={handleReset}>
          {message && <p className="form__success-message">{message}</p>}
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="password"
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn primary">Reset Password</button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
