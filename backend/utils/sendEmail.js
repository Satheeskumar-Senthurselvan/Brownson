// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,      // e.g., your Gmail address
      pass: process.env.GMAIL_PASS       // App password from Google
    }
  });

  const mailOptions = {
    from: `"Brownson Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
