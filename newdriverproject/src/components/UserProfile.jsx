import React, { useEffect, useState } from 'react';
import SideMenu from './SideMenu';
import '../styles/UserProfile.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    (async () => {
      if (!userId) {
        setError('משתמש לא מחובר');
        notify.error('משתמש לא מחובר');
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/api/users/${userId}`);
        if (!res.ok) throw new Error('שגיאה בשליפת נתוני משתמש');
        const data = await res.json();
        setUserData(data);
        setFormData(data);
      } catch (e) {
        console.error(e);
        setError('שגיאה בטעינת פרטי המשתמש');
        notify.error('שגיאה בטעינת פרטי המשתמש');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hasChanges = () => {
    if (!userData) return false;
    // שווה-ערך מהיר; אפשר לדייק לפי שדות ספציפיים
    return JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birth_date: formData.birth_date,
      address: formData.address,
    }) !== JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      birth_date: userData.birth_date,
      address: userData.address,
    });
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.text(); // תאימות לקוד קיים שמחזיר טקסט
      setUserData(formData);
      setIsEditing(false);
      notify.success('הפרטים נשמרו בהצלחה', 'שמירה הושלמה');
    } catch (e) {
      console.error(e);
      notify.error(e.message || 'שגיאה בעדכון הפרטים');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = async () => {
    if (hasChanges()) {
      const ok = await notify.confirm('לבטל שינויים?', 'כל השינויים שלא נשמרו יאבדו');
      if (!ok) return;
    }
    setFormData(userData || {});
    setIsEditing(false);
  };

  if (error) {
    return (
      <div className="user-profile">
        <SideMenu />
        <div className="user-info"><p>{error}</p></div>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="user-profile">
        <SideMenu />
        <div className="user-info"><p>טוען פרטים...</p></div>
      </div>
    );
  }

  const safeBirthValue =
    formData?.birth_date ? String(formData.birth_date).slice(0, 10) : '';

  return (
    <div className="user-profile">
      <SideMenu />
      <div className="user-info">
        <h2>פרטי המשתמש</h2>

        {isEditing ? (
          <>
            <p>
              <strong>שם:</strong>{' '}
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </p>
            <p>
              <strong>אימייל:</strong>{' '}
              <input
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={submitting}
                type="email"
              />
            </p>
            <p>
              <strong>טלפון:</strong>{' '}
              <input
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={submitting}
                type="tel"
              />
            </p>
            <p>
              <strong>תאריך לידה:</strong>{' '}
              <input
                name="birth_date"
                type="date"
                value={safeBirthValue}
                onChange={handleChange}
                disabled={submitting}
                lang="he-IL"
              />
            </p>
            <p>
              <strong>כתובת:</strong>{' '}
              <input
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </p>

            <button onClick={handleSave} disabled={submitting}>
              {submitting ? 'שומר…' : 'שמור'}
            </button>
            <button onClick={handleCancelEdit} disabled={submitting}>
              ביטול
            </button>
          </>
        ) : (
          <>
            <p><strong>שם:</strong> {userData.name}</p>
            <p><strong>תעודת זהות:</strong> {userData.user_id}</p>
            <p><strong>טלפון:</strong> {userData.phone}</p>
            <p><strong>אימייל:</strong> {userData.email}</p>
            <p>
              <strong>תאריך לידה:</strong>{' '}
              {userData.birth_date
                ? new Date(userData.birth_date).toLocaleDateString('he-IL')
                : ''}
            </p>
            <p><strong>כתובת:</strong> {userData.address}</p>
            <p><strong>תפקיד:</strong> {userData.role === 'admin' ? 'מורה (מנהל)' : 'תלמיד'}</p>

            <button className="edit-button" onClick={() => setIsEditing(true)}>
              ערוך פרטים
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
