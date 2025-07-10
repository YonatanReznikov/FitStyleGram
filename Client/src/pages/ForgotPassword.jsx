import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/forgot-password`, { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <section className="register">
      <div className="container register__container">
        <h2>Forgot your password?</h2>
        <form onSubmit={handleSubmit}>
          {message && <p className="form__success-message">{message}</p>}
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn primary">Send Reset Link</button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
