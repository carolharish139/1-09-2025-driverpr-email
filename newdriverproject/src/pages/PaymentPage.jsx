import React, { useState } from 'react';
import SideMenu from '../components/SideMenu';
import PaypalButton from '../components/PaypalButton';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const [numLessons, setNumLessons] = useState(1);
  const lessonPrice = 100;
  const total = numLessons * lessonPrice;

  return (
    <div className="payment-page">
      <SideMenu />

      <div className="payment-container">
        <h2>💳 תשלום עבור שיעורים</h2>

        <div className="payment-summary">
          <label htmlFor="numLessons">כמות שיעורים:</label>
          <input
            id="numLessons"
            type="number"
            min="1"
            value={numLessons}
            onChange={(e) => setNumLessons(e.target.value)}
          />
          <p>מחיר לשיעור: {lessonPrice} ₪</p>
          <p><strong>סכום כולל: {total} ₪</strong></p>
        </div>

        <div className="paypal-container">
          <PaypalButton amount={total} />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
