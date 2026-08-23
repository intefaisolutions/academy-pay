import { APP_CONFIG } from '../config';

export interface PaymentSyncPayload {
  dateTime?: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  paymentId: string;
  orderId?: string;
  status: string;
}

/**
 * Directly post payment data to Google Sheets Apps Script Web App
 */
export async function syncToGoogleSheet(data: PaymentSyncPayload): Promise<void> {
  const webhookUrl = APP_CONFIG.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes('YOUR_SCRIPT_ID')) {
    console.warn('⚠️ Google Sheet Webhook URL is not set in src/config.ts');
    return;
  }

  const payload = {
    dateTime: data.dateTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    name: data.name,
    email: data.email,
    phone: data.phone,
    amount: data.amount,
    paymentId: data.paymentId,
    orderId: data.orderId || 'DIRECT_PAYMENT',
    status: data.status,
  };

  try {
    // mode: 'no-cors' allows browser to post to Google Apps Script without CORS blockage
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('✅ Google Sheet updated successfully from frontend!');
  } catch (error) {
    console.error('Failed to sync to Google Sheet:', error);
  }
}
