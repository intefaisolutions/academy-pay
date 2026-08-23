import React, { useState } from 'react';
import { Header } from './components/Header';
import { PaymentForm } from './components/PaymentForm';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { PaymentFailedModal } from './components/PaymentFailedModal';
import { CustomerDetails, VerifyPaymentResponse } from './types';

export const App: React.FC = () => {
  const [successData, setSuccessData] = useState<{
    verification: VerifyPaymentResponse;
    customer: CustomerDetails;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePaymentSuccess = (verification: VerifyPaymentResponse, customer: CustomerDetails) => {
    setSuccessData({ verification, customer });
    setErrorMessage(null);
  };

  const handlePaymentFailure = (error: string) => {
    setErrorMessage(error);
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMessage(null);
  };

  return (
    <div className="app-container">
      <Header />

      <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <PaymentForm
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      </main>

      {/* Success Modal */}
      {successData && (
        <PaymentSuccessModal
          verificationData={successData.verification}
          customerData={successData.customer}
          onReset={handleReset}
        />
      )}

      {/* Failure Modal */}
      {errorMessage && (
        <PaymentFailedModal
          errorMessage={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
};

export default App;
