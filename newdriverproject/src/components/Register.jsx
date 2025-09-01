import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

const Register = () => {
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateInputs = () => {
    const idRegex = /^\d{9}$/;
    const phoneRegex = /^05\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!idRegex.test(idNumber)) {
      return 'תעודת זהות חייבת להכיל בדיוק 9 ספרות';
    }
    if (fullName.trim() === '') {
      return 'יש להזין שם מלא';
    }
    if (!emailRegex.test(email)) {
      return 'כתובת מייל לא תקינה';
    }
    if (!phoneRegex.test(phone)) {
      return 'מספר טלפון חייב להכיל 10 ספרות ולהתחיל ב-05';
    }
    if (password.length < 6) {
      return 'סיסמה חייבת להכיל לפחות 6 תווים';
    }
    if (!birthDate) {
      return 'יש לבחור תאריך לידה';
    }
    if (address.trim() === '') {
      return 'יש להזין כתובת';
    }
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      notify.warn(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idNumber,
          name: fullName,
          email,
          phone,
          password,
          birth_date: birthDate,
          address,
        }),
      });

      if (response.ok) {
        await notify.success('נרשמת בהצלחה! חזור להתחברות.', 'הרשמה הצליחה');
        navigate('/');
      } else {
        const msg = await response.text();
        notify.error(msg || 'לא ניתן להשלים את ההרשמה');
      }
    } catch (err) {
      console.error(err);
      notify.error('שגיאה בחיבור לשרת');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <h2>הרשמה</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="תעודת זהות"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="email"
          placeholder="מייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="tel"
          placeholder="טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
        <input
          type="date"
          placeholder="תאריך לידה"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          disabled={submitting}
          lang="he-IL"
        />
        <input
          type="text"
          placeholder="כתובת"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          disabled={submitting}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'נרשם…' : 'הרשמה'}
        </button>
      </form>

      <button
        onClick={handleBackToLogin}
        className="back-button"
        disabled={submitting}
      >
        חזור להתחברות
      </button>
    </div>
  );
};

export default Register;
