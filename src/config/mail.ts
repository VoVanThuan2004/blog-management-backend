import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"],
  port: Number(process.env["SMTP_PORT"]),
  secure: true,
  auth: {
    user: process.env["SMTP_USER"],
    pass: process.env["SMTP_PASS"],
  },
});

export const sendOTP = async (email: string, otpCode: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your OTP code is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 24px 0;">
        ${otpCode}
      </div>
      <p style="color: #666;">This code expires in <strong>5 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Blog API" <${process.env["SMTP_USER"]}>`,
    to: email,
    subject: "Your OTP Code",
    html,
  });
};
