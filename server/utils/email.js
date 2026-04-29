const nodemailer = require('nodemailer');

const SUPER_ADMIN_EMAIL = 'skjalaluddin772@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** Send email to super admin when someone requests admin/restaurant access */
exports.notifyAdminOfRequest = async (requestType, userData) => {
  try {
    const subject = requestType === 'admin'
      ? `🔐 New Admin Access Request — ${userData.name}`
      : `🍽️ New Restaurant Registration — ${userData.name}`;

    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:16px;">
        <div style="background:#FF6B35;padding:16px 24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">BiteDash Notification</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">
            ${requestType === 'admin' ? '🔐 Admin Access Request' : '🍽️ Restaurant Registration'}
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Name:</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${userData.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email:</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${userData.email}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Requested:</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p style="margin:20px 0 0;padding:16px;background:#FFF3ED;border-radius:8px;font-size:13px;color:#E55A2B;">
            Log in to your Admin Dashboard to approve or reject this request.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"BiteDash" <${process.env.EMAIL_USER}>`,
      to: SUPER_ADMIN_EMAIL,
      subject,
      html,
    });
    console.log(`  ✉ Email sent to ${SUPER_ADMIN_EMAIL} for ${requestType} request`);
  } catch (err) {
    console.error('  ✗ Email send failed:', err.message);
  }
};

/** Send approval/rejection notification to user */
exports.notifyUserOfDecision = async (userEmail, userName, requestType, approved) => {
  try {
    const subject = approved
      ? `✅ Your ${requestType} access has been approved!`
      : `❌ Your ${requestType} request was not approved`;

    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:16px;">
        <div style="background:${approved ? '#10B981' : '#EF4444'};padding:16px 24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">BiteDash</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
          <h2 style="margin:0 0 12px;color:#111827;">Hi ${userName},</h2>
          <p style="color:#374151;font-size:14px;line-height:1.6;">
            ${approved
              ? `Your <strong>${requestType}</strong> access request has been <strong style="color:#10B981;">approved</strong>! You can now log in and access your dashboard.`
              : `Unfortunately, your <strong>${requestType}</strong> access request was <strong style="color:#EF4444;">not approved</strong>. Please contact support for more information.`
            }
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"BiteDash" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html,
    });
    console.log(`  ✉ Decision email sent to ${userEmail}`);
  } catch (err) {
    console.error('  ✗ Email send failed:', err.message);
  }
};
