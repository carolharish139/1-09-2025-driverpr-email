import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

const Login = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!idNumber || !password) {
      notify.warn('נא למלא את כל השדות');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNumber, password })
      });

      if (response.ok) {
        const data = await response.json();

        // טוסט ברכה לא חוסם ניווט
        notify.toast(`ברוך הבא, ${data.user.name}!`, 'success');

        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.idNumber);

        if (data.user.role === 'admin') {
          navigate('/teacher-availability');
        } else {
          navigate('/home');
        }
      } else {
        const msg = await response.text();
        notify.error(msg || 'שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      console.error(err);
      notify.error('שגיאה בחיבור לשרת');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>התחברות</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="תעודת זהות"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'מתחבר…' : 'התחבר'}
        </button>
      </form>

      <button onClick={handleRegister} className="back-button" disabled={submitting}>
        הרשמה
      </button>
    </div>
  );
};

export default Login;
