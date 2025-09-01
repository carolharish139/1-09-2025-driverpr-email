// src/utils/alerts.js
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// מיקסין עם RTL וכפתורים מעוצבים
const rtlSwal = Swal.mixin({
  customClass: {
    popup: 'swal2-rtl',
    confirmButton: 'swal2-confirm-btn',
    cancelButton: 'swal2-cancel-btn',
  },
  buttonsStyling: false,
});

export const notify = {
  // מודלים רגילים
  success: (msg, title = 'הצלחה') =>
    rtlSwal.fire({ title, text: msg, icon: 'success', confirmButtonText: 'סבבה' }),

  error: (msg, title = 'שגיאה') =>
    rtlSwal.fire({ title, text: msg, icon: 'error', confirmButtonText: 'אישור' }),

  info: (msg, title = 'מידע') =>
    rtlSwal.fire({ title, text: msg, icon: 'info', confirmButtonText: 'סגור' }),

  warn: (msg, title = 'שים לב') =>
    rtlSwal.fire({ title, text: msg, icon: 'warning', confirmButtonText: 'הבנתי' }),

  // דיאלוג אישור
  confirm: async (title, text = 'האם אתה בטוח?') => {
    const res = await rtlSwal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'כן',
      cancelButtonText: 'בטל',
    });
    return res.isConfirmed;
  },

  // טוסט עליון (התראה קטנה)
  toast: (msg, icon = 'success') =>
    rtlSwal
      .mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      })
      .fire({ icon, title: msg }),
};
