import nodemailer from 'nodemailer';
import { env, isTest } from '../../config/env.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    if (env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT === 465,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      });
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
      if (!isTest) {
        console.warn('⚠️  Email Service: SMTP credentials not provided. Emails will be logged locally in development.');
      }
    }
  }

  async sendMail({ to, subject, html, text }) {
    if (!to) throw new Error('Email recipient is required');

    if (!this.isConfigured) {
      // In dev or test when not configured, log clearly instead of pretending
      console.log(`📨 [Email Service Mock/Log - No SMTP Configured] To: ${to} | Subject: "${subject}"`);
      return { success: false, reason: 'SMTP_NOT_CONFIGURED', logged: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('❌ Email sending failed:', err.message);
      return { success: false, reason: err.message };
    }
  }

  async sendVerificationEmail(email, token) {
    const verifyUrl = `${env.API_BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    return this.sendMail({
      to: email,
      subject: 'Verify your NutriTrack Account',
      html: `
        <div style="font-family: serif; color: #174A3A; padding: 24px;">
          <h2>Welcome to NutriTrack</h2>
          <p>Please verify your email address to activate your account:</p>
          <a href="${verifyUrl}" style="background-color: #174A3A; color: #F6F4EA; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block;">Verify Email</a>
          <p style="margin-top: 16px; font-size: 12px; color: #777;">Or copy this link: ${verifyUrl}</p>
        </div>
      `,
      text: `Welcome to NutriTrack! Verify your email using: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${env.CLIENT_URL.split(',')[0]}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    return this.sendMail({
      to: email,
      subject: 'Reset your NutriTrack Password',
      html: `
        <div style="font-family: serif; color: #174A3A; padding: 24px;">
          <h2>NutriTrack Password Reset</h2>
          <p>You requested a password reset. Click below to choose a new password (valid for 1 hour):</p>
          <a href="${resetUrl}" style="background-color: #174A3A; color: #F6F4EA; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block;">Reset Password</a>
          <p style="margin-top: 16px; font-size: 12px; color: #777;">Or copy this link: ${resetUrl}</p>
        </div>
      `,
      text: `Reset your NutriTrack password using: ${resetUrl}`,
    });
  }
}

export const emailService = new EmailService();
