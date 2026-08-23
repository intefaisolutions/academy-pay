import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <Zap size={20} color="#ffffff" />
        </div>
        <div>
          <h2 className="brand-title">
            Pay<span style={{ color: '#60a5fa' }}>Secure</span>
          </h2>
          <p className="brand-subtitle">Razorpay Verified Checkout</p>
        </div>
      </div>

      <div className="security-badge">
        <ShieldCheck size={15} />
        <span>100% Safe & Secure</span>
      </div>
    </header>
  );
};
