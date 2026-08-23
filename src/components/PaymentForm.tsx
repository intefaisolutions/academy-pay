import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Shield, CheckCircle, CreditCard, Tag, Flame, Clock } from 'lucide-react';
import { CustomerDetails, VerifyPaymentResponse } from '../types';
import { APP_CONFIG } from '../config';
import { syncToGoogleSheet } from '../services/sheetService';

interface Props {
  onPaymentSuccess: (data: VerifyPaymentResponse, customer: CustomerDetails) => void;
  onPaymentFailure: (errorMsg: string) => void;
}

const ORIGINAL_PRICE = APP_CONFIG.ORIGINAL_PRICE;
const DISCOUNTED_PRICE = APP_CONFIG.DISCOUNTED_PRICE;
const SAVINGS = ORIGINAL_PRICE - DISCOUNTED_PRICE;
const DISCOUNT_PERCENTAGE = Math.round((SAVINGS / ORIGINAL_PRICE) * 100);

export const PaymentForm: React.FC<Props> = ({ onPaymentSuccess, onPaymentFailure }) => {
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    amount: DISCOUNTED_PRICE,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your 10-digit mobile number';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Mobile number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof CustomerDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError(null);

    try {
      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Direct Frontend Razorpay Standard Checkout
      const options = {
        key: APP_CONFIG.RAZORPAY_KEY_ID,
        amount: DISCOUNTED_PRICE * 100, // 499900 paise
        currency: 'INR',
        name: APP_CONFIG.PRODUCT_NAME,
        description: APP_CONFIG.PRODUCT_DESCRIPTION,
        image: 'https://cdn.razorpay.com/static/assets/logo/rzp.svg',
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: APP_CONFIG.THEME_COLOR,
        },
        handler: async function (response: any) {
          try {
            const paymentId = response.razorpay_payment_id || `PAY_${Date.now()}`;
            const orderId = response.razorpay_order_id || `ORDER_${Date.now()}`;

            // Sync to Google Sheet directly from frontend
            await syncToGoogleSheet({
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              amount: DISCOUNTED_PRICE,
              paymentId,
              orderId,
              status: 'SUCCESS',
            });

            onPaymentSuccess(
              {
                success: true,
                message: 'Payment completed successfully!',
                orderId,
                paymentId,
                verifiedAt: new Date().toISOString(),
              },
              { ...formData, amount: DISCOUNTED_PRICE },
            );
          } catch (err: any) {
            console.error('Post payment error', err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options as any);
      razorpayInstance.open();
    } catch (err: any) {
      setLoading(false);
      setServerError(err.message || 'Unable to initiate payment');
    }
  };

  return (
    <div className="checkout-wrapper">
      {/* Left Panel - Feature Summary & Pricing */}
      <div className="glass-card summary-panel">
        <div>
          {/* Limited Time Offer Tag */}
          <div className="discount-header-badge">
            <Flame size={15} color="#f97316" />
            <span>LIMITED TIME MEGA OFFER • {DISCOUNT_PERCENTAGE}% OFF</span>
          </div>

          <h1 className="summary-title">{APP_CONFIG.PRODUCT_NAME}</h1>
          <p className="summary-desc">
            Unlock complete access at an exclusive promotional discount. Fill in your details below to claim your spot instantly.
          </p>

          {/* Pricing Highlight Box */}
          <div className="pricing-box">
            <div className="pricing-top">
              <div className="pricing-original">
                <span className="price-label">Original Price:</span>
                <span className="price-strike">₹{ORIGINAL_PRICE.toLocaleString('en-IN')}</span>
              </div>
              <div className="save-badge">
                <Tag size={13} />
                <span>SAVE ₹{SAVINGS.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pricing-main">
              <div className="final-price-wrapper">
                <span className="currency-symbol">₹</span>
                <span className="final-price-number">{DISCOUNTED_PRICE.toLocaleString('en-IN')}</span>
                <span className="price-tagline">Only</span>
              </div>
              <div className="discount-pill">{DISCOUNT_PERCENTAGE}% OFF</div>
            </div>

            <div className="pricing-footer">
              <Clock size={14} color="#f59e0b" />
              <span>Offer expires soon • Instant digital access</span>
            </div>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield size={20} />
              </div>
              <div className="feature-text">
                <h4>Bank-Grade Security</h4>
                <p>100% encrypted transactions with Razorpay verified gateway.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CreditCard size={20} />
              </div>
              <div className="feature-text">
                <h4>All Payment Methods Supported</h4>
                <p>Google Pay, PhonePe, Paytm, UPI, Cards & NetBanking.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle size={20} />
              </div>
              <div className="feature-text">
                <h4>Instant Confirmation</h4>
                <p>Instant digital receipt & immediate activation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="trust-badges">
          <div className="trust-item">
            <Lock size={14} color="#60a5fa" />
            <span>256-Bit SSL Encryption</span>
          </div>
          <div className="trust-item">
            <Shield size={14} color="#34d399" />
            <span>Razorpay Verified</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Input Form & Pay Now Button */}
      <div className="glass-card form-panel">
        <div className="form-header">
          <h2 className="form-title">Enter Your Details</h2>
          <p className="form-subtitle">Complete this step to secure your ₹{DISCOUNTED_PRICE.toLocaleString('en-IN')} deal</p>
        </div>

        {serverError && (
          <div className="banner-error">
            <span>{serverError}</span>
          </div>
        )}

        {/* Order Price Breakdown Mini Card */}
        <div className="mini-price-breakdown">
          <div className="breakdown-row">
            <span>Standard Price</span>
            <span style={{ textDecoration: 'line-through', color: '#64748b' }}>₹{ORIGINAL_PRICE.toLocaleString('en-IN')}</span>
          </div>
          <div className="breakdown-row discount-row">
            <span>Special Discount ({DISCOUNT_PERCENTAGE}% OFF)</span>
            <span style={{ color: '#10b981' }}>-₹{SAVINGS.toLocaleString('en-IN')}</span>
          </div>
          <div className="breakdown-divider" />
          <div className="breakdown-row total-row">
            <span>Total Payable Amount</span>
            <span className="total-highlight">₹{DISCOUNTED_PRICE.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handlePayment} noValidate>
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Full Name *
            </label>
            <div className="input-field-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="custom-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
              />
              <User size={18} className="input-icon" />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Address */}
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email Address *
            </label>
            <div className="input-field-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="custom-input"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
              <Mail size={18} className="input-icon" />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Mobile Number */}
          <div className="input-group">
            <label className="input-label" htmlFor="phone">
              Mobile Number (WhatsApp) *
            </label>
            <div className="input-field-wrapper">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                className="custom-input"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
              <Phone size={18} className="input-icon" />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Pay Now Button Container (Fixed on Mobile) */}
          <div className="pay-button-container">
            <button type="submit" className="pay-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Pay Now ₹{DISCOUNTED_PRICE.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>

          {/* Supported Methods Tags */}
          <div className="supported-methods">
            <span className="method-tag">UPI</span>
            <span className="method-tag">Google Pay</span>
            <span className="method-tag">PhonePe</span>
            <span className="method-tag">Paytm</span>
            <span className="method-tag">Cards</span>
            <span className="method-tag">NetBanking</span>
          </div>
        </form>
      </div>
    </div>
  );
};
