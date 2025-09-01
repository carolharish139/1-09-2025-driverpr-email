import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

const PaypalButton = ({ amount, onSuccess }) => {
  return (
    <PayPalScriptProvider
      options={{
        'client-id':
          'AcVE9wuzaqAxYtSZOf2t1BQ_9M7UoV5SKBVt2Ignr-88I-yzxZtx28pVZrnyBK6cCxQoH_KNhcr-A0zd',
        'disable-funding': 'card',
        currency: 'ILS',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        forceReRender={[amount]}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount?.toString?.() || String(amount || '0'),
                  currency_code: 'ILS',
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            const name = details?.payer?.name?.given_name || '';
            notify.toast(`התשלום הצליח! תודה ${name ? `, ${name}` : ''}`, 'success');
            if (onSuccess) onSuccess(details);
          });
        }}
        onError={(err) => {
          console.error('❌ שגיאה בתשלום:', err);
          notify.error('אירעה שגיאה בעת ביצוע התשלום', 'שגיאה בתשלום');
        }}
        onCancel={() => {
          notify.info('התשלום בוטל', 'ביטול תשלום');
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaypalButton;
