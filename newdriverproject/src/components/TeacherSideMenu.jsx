import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SideMenu.css';

function TeacherSideMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (

    
    <div className="side-menu" style={{ minWidth: '150px' }}>

      <Link to="/teacher-feedback">הודעות מהתלמיד</Link>
      <Link to="/teacher-availability">אילוצים</Link>
      <button className="logout-button" onClick={handleLogout}>התנתקות</button>
    </div>
  );
}

export default TeacherSideMenu;