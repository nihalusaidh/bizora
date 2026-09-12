import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@bizora.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInviteEmail(
  to: string,
  businessName: string,
  inviterName: string,
  role: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111;">You've been invited to join ${businessName}</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi there,<br/><br/>
        <strong>${inviterName}</strong> has invited you to join <strong>${businessName}</strong> as a <strong>${role}</strong> on Bizora.
      </p>
      <a href="${APP_URL}/auth/signup" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        Accept Invitation
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        If you didn't expect this email, you can safely ignore it.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Invite to join ${businessName} on Bizora`,
    html,
  });
}

export async function sendPaymentReminder(
  to: string,
  customerName: string,
  amount: number,
  invoiceNumber: string,
  businessName: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111;">Payment Reminder</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${customerName},<br/><br/>
        This is a friendly reminder from <strong>${businessName}</strong> regarding your pending payment.
      </p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #555;">Invoice:</span>
          <strong>${invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #555;">Amount Due:</span>
          <strong style="color: #DC2626; font-size: 18px;">₹${amount.toLocaleString("en-IN")}</strong>
        </div>
      </div>
      <a href="${APP_URL}/customers" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        View Details
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        Please make the payment at your earliest convenience. Thank you!
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Payment Reminder - ${invoiceNumber} from ${businessName}`,
    html,
  });
}

export async function sendInvoiceEmail(
  to: string,
  customerName: string,
  invoiceNumber: string,
  amount: number,
  businessName: string,
  downloadUrl: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111;">Invoice from ${businessName}</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${customerName},<br/><br/>
        Please find your invoice below from <strong>${businessName}</strong>.
      </p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #555;">Invoice:</span>
          <strong>${invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #555;">Amount:</span>
          <strong style="font-size: 18px;">₹${amount.toLocaleString("en-IN")}</strong>
        </div>
      </div>
      <a href="${downloadUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        Download Invoice
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        If you have any questions, please don't hesitate to reach out.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Invoice ${invoiceNumber} from ${businessName}`,
    html,
  });
}

export async function sendLowStockAlert(
  to: string,
  productName: string,
  currentStock: number,
  businessName: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111;">Low Stock Alert</h2>
      <p style="color: #555; line-height: 1.6;">
        The following product in <strong>${businessName}</strong> is running low on stock:
      </p>
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #555;">Product:</span>
          <strong>${productName}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #555;">Current Stock:</span>
          <strong style="color: #DC2626;">${currentStock} units</strong>
        </div>
      </div>
      <a href="${APP_URL}/inventory" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        Restock Now
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        Consider reordering to avoid stockouts.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Low Stock Alert: ${productName} - ${businessName}`,
    html,
  });
}
