import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_NAME = "Book.My.Glow";

/** 
 * Send Booking Confirmation Email
 */
export const sendBookingConfirmation = async (booking) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: booking.user.email,
    subject: `✨ Booking Confirmed: ${booking.serviceName} at ${booking.salon.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ec4899; text-align: center;">${APP_NAME}</h2>
        <p>Hi ${booking.user.name},</p>
        <p>Your appointment has been successfully confirmed!</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Salon:</strong> ${booking.salon.name}</p>
          <p><strong>Service:</strong> ${booking.serviceName}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.timeSlot}</p>
          <p><strong>Price:</strong> ₹${booking.price}</p>
          <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        </div>
        <p>If you need to change your appointment, please do so at least 2 hours in advance.</p>
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          © 2026 ${APP_NAME}. All rights reserved.<br>
          ${booking.salon.location}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Confirmation Error:", error);
  }
};

/**
 * Send Cancellation Notice
 */
export const sendCancellationNotice = async (booking) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: booking.user.email,
    subject: `⚠️ Booking Cancelled: ${booking.serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #666; text-align: center;">${APP_NAME}</h2>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking for <strong>${booking.serviceName}</strong> has been cancelled.</p>
        <div style="background-color: #fff1f2; padding: 15px; border-radius: 10px; margin: 20px 0; color: #be123c;">
          <p><strong>Appointment Time:</strong> ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}</p>
        </div>
        <p>If this was not you, please contact support immediately at 9759883087.</p>
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          © 2026 ${APP_NAME}. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Cancellation Error:", error);
  }
};

/**
 * Send Review Notification to Owner
 */
export const sendReviewAlert = async (salon, review) => {
  if (!salon.owner?.email) return;

  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: salon.owner.email,
    subject: `⭐ New Review for ${salon.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ec4899; text-align: center;">${APP_NAME} Dashboard</h2>
        <p>Hi ${salon.owner.name},</p>
        <p>You have received a new ${review.rating}-star review!</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #ec4899;">
          <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</p>
          <p><strong>Comment:</strong> "${review.comment}"</p>
        </div>
        <p>We recommend replying to your customers to keep your reputation high.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: block; width: 200px; margin: 20px auto; background-color: #ec4899; color: white; text-align: center; padding: 12px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reply to Review
        </a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Review Alert Email Error:", error);
  }
};
