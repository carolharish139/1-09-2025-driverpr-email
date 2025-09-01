import './App.css';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import ScheduleLesson from './components/ScheduleLesson';
import UserProfile from './components/UserProfile';
import Feedback from './pages/Feedback';
import PaymentPage from './pages/PaymentPage';
import Home from './pages/Home';
import TeacherAvailability from './components/TeacherAvailability';
import TeacherHome from './pages/TeacherHome';
import TeacherFeedback from './pages/TeacherFeedback';

function App() {
  return (
    <>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/schedule" element={<ScheduleLesson />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/teacher-home" element={<AdminRoute><TeacherHome /></AdminRoute>} />
          <Route path="/teacher-feedback" element={<AdminRoute><TeacherFeedback /></AdminRoute>} />
          <Route path="/teacher-availability" element={<AdminRoute><TeacherAvailability /></AdminRoute>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;

// קומפוננטת הגנה למנהלים בלבד
function AdminRoute({ children }) {
  const role = localStorage.getItem('userRole');
  if (role === 'admin') {
    return children;
  } else {
    window.alert('אין לך הרשאה לגשת לדף זה');
    window.location.href = '/';
    return null;
  }
}