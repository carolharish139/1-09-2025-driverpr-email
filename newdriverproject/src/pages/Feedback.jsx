import React, { useState } from 'react';
import SideMenu from '../components/SideMenu';
import '../styles/Feedback.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      notify.error('משתמש לא מחובר');
      return;
    }

    const text = message.trim();
    if (!text) {
      notify.warn('אנא כתוב הודעה לפני שליחה');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId, 10), message: text }),
      });

      if (response.ok) {
        notify.success('תודה! ההודעה שלך התקבלה.', 'הודעה נשלחה');
        setMessage('');
      } else {
        const msg = await response.text();
        notify.error(msg || 'שגיאה בשליחת ההודעה');
      }
    } catch (error) {
      console.error('שגיאה:', error);
      notify.error('שגיאה בשרת');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <SideMenu />
      <div className="feedback-container">
        <h2 className="feedback-title">📝 הודעה למורה</h2>
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>כתוב את ההודעה שלך:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="כתוב כאן את ההודעה למורה או השאלה שלך למורה..."
            rows="6"
            disabled={submitting}
          />
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'שולח…' : 'שלח הודעה'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
