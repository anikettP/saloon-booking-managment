// backend/utils/mail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * GENERAL MAIL SENDER (used for OTP)
 *
 * - Signature is SAME as before:  { to, subject, html }
 * - You can optionally pass `otp` and `expiresInMinutes`
 * - If subject contains "OTP" (case-insensitive) OR `otp` is provided,
 *   we wrap the content in a beautiful branded OTP template.
 */
export const sendMail = async ({
  to,
  subject,
  html,
  otp,
  expiresInMinutes = 10,
}) => {
  if (!to) return null;

  // Decide whether this is an OTP email
  const isOtpMail = otp || /otp/i.test(subject || '');

  let finalHtml = html;

  if (isOtpMail) {
    // Try to extract OTP digits from existing html if otp not explicitly passed
    let code = otp;
    if (!code && typeof html === 'string') {
      const match = html.match(/\d{4,8}/);
      if (match) code = match[0];
    }

    // Fallback message if no html was originally passed
    const plainMessage =
      typeof html === 'string' && html.trim().length
        ? html
        : 'Use this one-time password to complete your action.';

    const safeCode = code || '';

    // Pretty OTP email template (WowWoolies themed)
    finalHtml = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 520px;
        margin: 0 auto;
        padding: 24px 20px;
        background: #fff5f7;
        border-radius: 18px;
        border: 1px solid #ffe4ea;
      ">
        <div style="text-align:center; margin-bottom:18px;">
          <div style="
            display:inline-block;
            padding:10px 18px;
            border-radius:999px;
            background:linear-gradient(135deg,#fb7185,#ec4899);
            color:#ffffff;
            font-weight:600;
            font-size:13px;
            letter-spacing:0.12em;
            text-transform:uppercase;
          ">
            WowWoolies ✨
          </div>
        </div>

        <h2 style="
          text-align:center;
          color:#b3005a;
          margin:6px 0 4px;
          font-size:22px;
        ">
          Your one-time passcode 🔐
        </h2>

        <p style="
          text-align:center;
          font-size:14px;
          color:#555;
          margin:0 0 18px;
        ">
          Use this code to securely continue.  
          <span style="display:block; margin-top:4px;">Please don’t share it with anyone.</span>
        </p>

        <div style="
          margin:0 auto 18px;
          text-align:center;
          padding:14px 10px;
          border-radius:14px;
          background:#ffffff;
          border:1px dashed #f9a8d4;
        ">
          <div style="
            font-size:28px;
            letter-spacing:0.38em;
            font-weight:700;
            color:#b3005a;
          ">
            ${safeCode}
          </div>
          <div style="margin-top:8px; font-size:12px; color:#777;">
            This code will be valid for approximately ${expiresInMinutes} minutes.
          </div>
        </div>

        <p style="font-size:13px; color:#555; margin:0 0 12px;">
          ${plainMessage}
        </p>

        <p style="font-size:12px; color:#999; margin:0 0 4px;">
          If you did not request this, you can safely ignore this email.  
          Your account stays secure. 💖
        </p>

        <p style="font-size:12px; color:#999; margin-top:16px; text-align:center;">
          With love,<br/>
          <strong>Team WowWoolies</strong>
        </p>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html: finalHtml,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * ORDER EMAIL — upgraded to a beautiful WowWoolies–styled template
 * Signature is SAME: ({ to, name, order })
 */
export const sendOrderEmail = async ({ to, name, order }) => {
  if (!to) return null;

  const orderRef = order.localRef || order._id;
  const orderDate = order.date
    ? new Date(order.date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const customerName = name || order?.address?.firstName || 'Customer';

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0; font-size:13px; color:#444;">
            ${i.name || 'Item'}
            ${i.size ? `<div style="font-size:11px; color:#888;">Size: ${i.size}</div>` : ''}
          </td>
          <td style="padding:8px 0; font-size:13px; color:#444; text-align:center;">
            ${i.quantity || 1}
          </td>
          <td style="padding:8px 0; font-size:13px; color:#444; text-align:right;">
            ₹${Number(i.price || 0).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const amount = Number(order.amount || 0).toFixed(2);

  const addr = order.address || {};
  const fullNameFromAddress =
    [addr.firstName, addr.lastName].filter(Boolean).join(' ') ||
    addr.name ||
    '';
  const addressHtml =
    addr && (addr.street || addr.city || addr.state || addr.zipcode || addr.phone)
      ? `
      <div style="margin-top:10px; font-size:13px; color:#555;">
        <div style="font-weight:600; color:#b3005a; margin-bottom:4px;">Delivery Address</div>
        ${
          fullNameFromAddress
            ? `<div style="font-weight:500; color:#333;">${fullNameFromAddress}</div>`
            : ''
        }
        ${
          addr.street
            ? `<div>${addr.street}</div>`
            : ''
        }
        ${
          addr.city || addr.state || addr.zipcode
            ? `<div>${[addr.city, addr.state].filter(Boolean).join(', ')} ${
                addr.zipcode ? '- ' + addr.zipcode : ''
              }</div>`
            : ''
        }
        ${
          addr.country
            ? `<div>${addr.country}</div>`
            : ''
        }
        ${
          addr.phone
            ? `<div style="margin-top:4px;">📞 ${addr.phone}</div>`
            : ''
        }
      </div>
    `
      : '';

  const paymentLine = order.paymentMethod
    ? `${String(order.paymentMethod).toUpperCase()} ${
        order.payment ? '• Paid ✅' : ''
      }`
    : order.payment
    ? 'Paid ✅'
    : 'Payment received ✅';

  const subject = `Thank you for your order ✨ — ${orderRef}`;

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 24px 20px;
      background: #fff5f7;
      border-radius: 18px;
      border: 1px solid #ffe4ea;
    ">
      <!-- Brand chip -->
      <div style="text-align:center; margin-bottom:18px;">
        <div style="
          display:inline-block;
          padding:10px 18px;
          border-radius:999px;
          background:linear-gradient(135deg,#fb7185,#ec4899);
          color:#ffffff;
          font-weight:600;
          font-size:13px;
          letter-spacing:0.12em;
          text-transform:uppercase;
        ">
          WowWoolies ✨
        </div>
      </div>

      <!-- Heading -->
      <h2 style="
        text-align:center;
        color:#b3005a;
        margin:6px 0 4px;
        font-size:22px;
      ">
        Thank you for your order 💖
      </h2>

      <p style="text-align:center; font-size:14px; color:#555; margin:0 0 16px;">
        Hi <strong>${customerName}</strong>,<br/>
        we’ve received your order and are getting it ready for you.
      </p>

      <!-- Order meta card -->
      <div style="
        margin:0 auto 18px;
        padding:12px 14px;
        border-radius:14px;
        background:#ffffff;
        border:1px dashed #f9a8d4;
      ">
        <div style="display:flex; justify-content:space-between; font-size:13px; color:#444;">
          <span>Order ID:</span>
          <strong style="color:#b3005a;">${orderRef}</strong>
        </div>
        ${
          orderDate
            ? `
              <div style="display:flex; justify-content:space-between; font-size:13px; color:#444; margin-top:4px;">
                <span>Order Date:</span>
                <span>${orderDate}</span>
              </div>
            `
            : ''
        }
        ${
          paymentLine
            ? `
              <div style="display:flex; justify-content:space-between; font-size:13px; color:#444; margin-top:4px;">
                <span>Payment:</span>
                <span>${paymentLine}</span>
              </div>
            `
            : ''
        }
      </div>

      <!-- Items table -->
      <div style="
        background:#ffffff;
        border-radius:14px;
        padding:14px 14px 10px;
        border:1px solid #ffe4ea;
      ">
        <div style="font-size:14px; font-weight:600; color:#b3005a; margin-bottom:6px;">
          Order summary 🧾
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left; font-size:12px; color:#888; padding-bottom:6px;">Item</th>
              <th style="text-align:center; font-size:12px; color:#888; padding-bottom:6px;">Qty</th>
              <th style="text-align:right; font-size:12px; color:#888; padding-bottom:6px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top:1px solid #f3d4e2; margin-top:8px; padding-top:8px;">
          <div style="display:flex; justify-content:space-between; font-size:14px; color:#333;">
            <span style="font-weight:600;">Total</span>
            <span style="font-weight:700; color:#b3005a;">₹${amount}</span>
          </div>
        </div>
      </div>

      <!-- Address (if available) -->
      ${addressHtml}

      <!-- Closing note -->
      <p style="font-size:13px; color:#555; margin:16px 0 10px;">
        You’ll receive another update once your order is packed and ready to ship.  
        We hope this piece adds a little more joy 💫 to your space or to someone you love.
      </p>

      <p style="font-size:12px; color:#999; margin:8px 0 4px;">
        If you have any questions, just reply to this email or reach out to us on our support channels.  
      </p>

      <p style="font-size:12px; color:#999; margin-top:14px;">
        With love,<br/>
        <strong>Team WowWoolies</strong> 🎀
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
