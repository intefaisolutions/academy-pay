import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

interface Props {
  errorMessage: string;
  onClose: () => void;
}

export const PaymentFailedModal: React.FC<Props> = ({ errorMessage, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="failed-icon-container">
          <XCircle size={42} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Payment Failed or Cancelled
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          We could not complete your transaction at this moment.
        </p>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '1rem',
          margin: '1.5rem 0',
          color: '#fca5a5',
          fontSize: '0.85rem',
          textAlign: 'left',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage || 'Transaction was dismissed or rejected by the payment gateway.'}</span>
        </div>

        <div className="modal-actions">
          <button className="primary-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
