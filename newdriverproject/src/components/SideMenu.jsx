import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SideMenu.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

const SideMenu = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await notify.confirm('להתנתק מהמערכת?', 'תנותק ותועבר למסך התחברות');
    if (!ok) return;

    try {
      // אופציונלי: קריאת לוגאאוט לשרת אם זמינה
      // await fetch('http://localhost:3001/api/users/logout', { method: 'POST', credentials: 'include' });

      // ניקוי נתוני התחברות/משתמש
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');

      notify.toast('התנתקת בהצלחה', 'success');
      navigate('/');
    } catch (e) {
      console.error(e);
      notify.error('אירעה שגיאה בעת ההתנתקות');
    }
  };

  return (
    <div className="side-menu">
      <Link to="/home">בית</Link>
      <Link to="/profile">פרטים אישיים</Link>
      <Link to="/payment">תשלום</Link>
      <Link to="/feedback">הודעות למורה</Link>
      <button onClick={handleLogout} className="logout-button">התנתקות</button>
    </div>
  );
};

export default SideMenu;
