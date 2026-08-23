import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Copy, Download, RefreshCw } from 'lucide-react';
import { CustomerDetails, VerifyPaymentResponse } from '../types';

interface Props {
  verificationData: VerifyPaymentResponse;
  customerData: CustomerDetails;
  onReset: () => void;
}

export const PaymentSuccessModal: React.FC<Props> = ({
  verificationData,
  customerData,
  onReset,
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Payment ID copied to clipboard!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="success-icon-container">
          <CheckCircle2 size={42} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Payment Successful!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Thank you, <strong style={{ color: '#f1f5f9' }}>{customerData.name}</strong>! Your transaction was completed securely.
        </p>

        <div className="receipt-table">
          <div className="receipt-row">
            <span className="receipt-label">Amount Paid</span>
            <span className="receipt-value" style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 700 }}>
              ₹{customerData.amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment ID</span>
            <span
              className="receipt-value"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => copyToClipboard(verificationData.paymentId)}
              title="Click to copy"
            >
              {verificationData.paymentId.substring(0, 14)}...
              <Copy size={12} color="#94a3b8" />
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Order ID</span>
            <span className="receipt-value">{verificationData.orderId.substring(0, 16)}...</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Email</span>
            <span className="receipt-value">{customerData.email}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Phone</span>
            <span className="receipt-value">{customerData.phone}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Status</span>
            <span className="receipt-value" style={{ color: '#34d399' }}>Verified ✓</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Download size={16} /> Print Receipt
          </button>
          <button className="primary-btn" onClick={onReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Make Another Payment
          </button>
        </div>
      </div>
    </div>
  );
};
