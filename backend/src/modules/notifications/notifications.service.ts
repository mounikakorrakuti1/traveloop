import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';
import type { SendEmailDto, SendPhoneMessageDto } from './notifications.dto';

interface NotificationResult {
  provider: 'resend' | 'twilio';
  messageId: string | null;
  status: 'sent';
}

const configuredFromEmail = (): string => {
  if (!env.RESEND_FROM_EMAIL) {
    throw new AppError('Email sender is not configured', 'SERVICE_UNAVAILABLE', 503);
  }
  return env.RESEND_FROM_EMAIL;
};

const assertTwilioConfigured = (): void => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new AppError('Phone messaging provider is not configured', 'SERVICE_UNAVAILABLE', 503);
  }
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* ── Beautiful HTML email wrapper ───────────────────────────── */
const emailLayout = (title: string, body: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F1DE; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(61, 64, 91, 0.12); }
    .email-header { background: linear-gradient(135deg, #3D405B 0%, #4A4D6B 100%); padding: 32px 40px; text-align: center; }
    .email-logo { font-size: 28px; font-weight: 800; color: #F4F1DE; letter-spacing: -0.02em; }
    .email-logo-accent { color: #E07A5F; }
    .email-body { padding: 40px; }
    .email-title { font-size: 24px; font-weight: 700; color: #3D405B; margin: 0 0 16px 0; }
    .email-text { font-size: 16px; line-height: 1.6; color: #4A4D6B; margin: 0 0 16px 0; }
    .email-otp-box { background: linear-gradient(135deg, #E07A5F 0%, #F2CC8F 100%); color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 0.3em; text-align: center; padding: 20px 32px; border-radius: 12px; margin: 24px 0; }
    .email-button { display: inline-block; background: #E07A5F; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 16px 0; }
    .email-divider { border: none; border-top: 1px solid #EDE8CC; margin: 24px 0; }
    .email-muted { font-size: 13px; color: #9294A8; line-height: 1.5; }
    .email-footer { background-color: #F4F1DE; padding: 24px 40px; text-align: center; }
    .email-footer-text { font-size: 12px; color: #6B6E8A; margin: 0; }
    .email-feature { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .email-feature-icon { width: 32px; height: 32px; background: rgba(129, 178, 154, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
    .email-feature-text { font-size: 14px; color: #4A4D6B; }
    .email-highlight { background: rgba(224, 122, 95, 0.08); border-left: 4px solid #E07A5F; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    @media (max-width: 600px) {
      .email-body { padding: 24px 20px; }
      .email-header { padding: 24px 20px; }
      .email-footer { padding: 16px 20px; }
    }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="email-container">
      <div class="email-header">
        <div class="email-logo">Travel<span class="email-logo-accent">-Loop</span></div>
      </div>
      <div class="email-body">
        ${body}
      </div>
      <div class="email-footer">
        <p class="email-footer-text">© ${new Date().getFullYear()} Traveloop — AI-powered travel planning</p>
        <p class="email-footer-text" style="margin-top:8px">You received this because you have a Traveloop account.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export class NotificationsService {
  public async sendEmail(dto: SendEmailDto): Promise<NotificationResult> {
    if (!env.RESEND_API_KEY) {
      throw new AppError('Email provider is not configured', 'SERVICE_UNAVAILABLE', 503);
    }

    const startedAt = Date.now();
    const payload: Record<string, string | string[]> = {
      from: configuredFromEmail(),
      to: dto.to,
      subject: dto.subject,
      text: dto.text
    };
    if (dto.html !== undefined) payload.html = dto.html;

    logger.debug('Sending email via Resend', {
      to: dto.to,
      subject: dto.subject,
      from: configuredFromEmail()
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No body');
      logger.error('Resend API error', {
        status: response.status,
        body: errorBody,
        to: dto.to
      });
      throw new AppError(
        `Email delivery failed (${response.status})`,
        'EMAIL_DELIVERY_FAILED',
        502
      );
    }

    const result = (await response.json()) as { id?: string };
    logger.info('Email sent successfully', {
      durationMs: Date.now() - startedAt,
      provider: 'resend',
      messageId: result.id,
      to: dto.to
    });
    return { provider: 'resend', messageId: result.id ?? null, status: 'sent' };
  }

  public async sendSms(dto: SendPhoneMessageDto): Promise<NotificationResult> {
    if (!env.TWILIO_SMS_FROM) {
      throw new AppError('SMS sender is not configured', 'SERVICE_UNAVAILABLE', 503);
    }
    return this.sendTwilioMessage(env.TWILIO_SMS_FROM, dto.to, dto.message);
  }

  public async sendWhatsApp(dto: SendPhoneMessageDto): Promise<NotificationResult> {
    if (!env.TWILIO_WHATSAPP_FROM) {
      throw new AppError('WhatsApp sender is not configured', 'SERVICE_UNAVAILABLE', 503);
    }
    return this.sendTwilioMessage(
      `whatsapp:${env.TWILIO_WHATSAPP_FROM}`,
      `whatsapp:${dto.to}`,
      dto.message
    );
  }

  /* ── Registration Welcome Email ───────────────────────────── */
  public async sendRegistrationWelcome(email: string, name: string): Promise<void> {
    const safeName = escapeHtml(name);
    const firstName = safeName.split(' ')[0];

    const html = emailLayout('Welcome to Traveloop!', `
      <h1 class="email-title">Welcome aboard, ${firstName}! 🎉</h1>
      <p class="email-text">
        Your Traveloop account is all set. You're now part of India's smartest
        AI-powered travel planning community.
      </p>

      <hr class="email-divider" />

      <p class="email-text" style="font-weight:600; margin-bottom:16px;">Here's what you can do right away:</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:8px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top">
                  <div style="width:32px;height:32px;background:rgba(129,178,154,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px">🗺️</div>
                </td>
                <td style="font-size:14px;color:#4A4D6B;padding-left:12px">
                  <strong>Plan trips</strong> — Add destinations, stops, and let AI build your itinerary
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top">
                  <div style="width:32px;height:32px;background:rgba(224,122,95,0.12);border-radius:8px;text-align:center;line-height:32px;font-size:16px">💰</div>
                </td>
                <td style="font-size:14px;color:#4A4D6B;padding-left:12px">
                  <strong>Smart budgets</strong> — AI estimates costs in ₹ based on your travel style
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top">
                  <div style="width:32px;height:32px;background:rgba(242,204,143,0.2);border-radius:8px;text-align:center;line-height:32px;font-size:16px">🎒</div>
                </td>
                <td style="font-size:14px;color:#4A4D6B;padding-left:12px">
                  <strong>Packing lists</strong> — AI-powered suggestions tailored to your destination
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top">
                  <div style="width:32px;height:32px;background:rgba(61,64,91,0.08);border-radius:8px;text-align:center;line-height:32px;font-size:16px">📸</div>
                </td>
                <td style="font-size:14px;color:#4A4D6B;padding-left:12px">
                  <strong>Travel media</strong> — Upload photos, documents, and share itineraries
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <hr class="email-divider" />

      <div class="email-highlight">
        <p class="email-text" style="margin:0;">
          💡 <strong>Pro tip:</strong> Head to your Profile to add a Gemini API key.
          This unlocks AI budget estimation, packing suggestions, and smart itinerary recommendations.
        </p>
      </div>

      <p class="email-muted" style="margin-top:24px;">
        If you did not create this account, you can safely ignore this email.
      </p>
    `);

    await this.sendEmail({
      to: email,
      subject: `Welcome to Traveloop, ${firstName}! 🌍`,
      text: `Hi ${name}, your Traveloop account was created successfully. You can now start planning your trips at ${env.FRONTEND_URL}`,
      html
    });
  }

  /* ── Password Reset OTP Email ─────────────────────────────── */
  public async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const safeOtp = escapeHtml(otp);

    const html = emailLayout('Password Reset — Traveloop', `
      <h1 class="email-title">Reset your password 🔐</h1>
      <p class="email-text">
        We received a request to reset the password for your Traveloop account.
        Use the verification code below to set a new password.
      </p>

      <div class="email-otp-box">${safeOtp}</div>

      <div class="email-highlight">
        <p class="email-text" style="margin:0;">
          ⏱️ This code expires in <strong>15 minutes</strong>.
          Do not share it with anyone.
        </p>
      </div>

      <p class="email-text">
        Enter this code on the password reset page along with your new password.
      </p>

      <hr class="email-divider" />

      <p class="email-muted">
        If you didn't request a password reset, please ignore this email.
        Your password will remain unchanged.
      </p>
      <p class="email-muted">
        For security, this request was received from your browser.
        If you're concerned about your account security, you can
        change your password immediately after logging in.
      </p>
    `);

    await this.sendEmail({
      to: email,
      subject: 'Traveloop — Password Reset Code',
      text: `Your Traveloop password reset code is ${otp}. It expires in 15 minutes. Do not share this code with anyone.`,
      html
    });
  }

  /* ── Login Alert Email (optional — called when needed) ────── */
  public async sendLoginAlert(email: string, name: string): Promise<void> {
    const safeName = escapeHtml(name);
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const html = emailLayout('Login Alert — Traveloop', `
      <h1 class="email-title">New login detected 🔔</h1>
      <p class="email-text">
        Hi ${safeName}, we noticed a new login to your Traveloop account.
      </p>

      <div class="email-highlight">
        <p class="email-text" style="margin:0;">
          🕐 <strong>Time:</strong> ${loginTime} IST<br/>
          📧 <strong>Account:</strong> ${escapeHtml(email)}
        </p>
      </div>

      <p class="email-text">
        If this was you, no action is needed.
      </p>
      <p class="email-text">
        If you didn't log in, please reset your password immediately
        and contact us.
      </p>
    `);

    await this.sendEmail({
      to: email,
      subject: 'Traveloop — New Login to Your Account',
      text: `Hi ${name}, a new login was detected on your Traveloop account at ${loginTime} IST. If this wasn't you, please reset your password immediately.`,
      html
    });
  }

  /* ── Password Changed Confirmation ────────────────────────── */
  public async sendPasswordChangedConfirmation(email: string, name: string): Promise<void> {
    const safeName = escapeHtml(name);
    const changeTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const html = emailLayout('Password Changed — Traveloop', `
      <h1 class="email-title">Password updated ✅</h1>
      <p class="email-text">
        Hi ${safeName}, your Traveloop password was successfully changed at ${changeTime} IST.
      </p>

      <p class="email-text">
        You can now log in with your new password.
      </p>

      <hr class="email-divider" />

      <p class="email-muted">
        If you did not make this change, please contact us immediately
        and reset your password.
      </p>
    `);

    await this.sendEmail({
      to: email,
      subject: 'Traveloop — Your Password Has Been Changed',
      text: `Hi ${name}, your Traveloop password was successfully changed at ${changeTime} IST. If you didn't do this, please reset your password immediately.`,
      html
    });
  }

  /* ── Trip Shared Notification ─────────────────────────────── */
  public async sendTripSharedNotification(
    email: string,
    name: string,
    tripTitle: string,
    publicUrl: string
  ): Promise<void> {
    const safeName = escapeHtml(name);
    const safeTitle = escapeHtml(tripTitle);

    const html = emailLayout('Trip Shared — Traveloop', `
      <h1 class="email-title">Your trip is now public! 🌍</h1>
      <p class="email-text">
        Hi ${safeName}, your trip "<strong>${safeTitle}</strong>" has been published
        and is now shareable with anyone.
      </p>

      <p style="text-align:center; margin:24px 0;">
        <a href="${publicUrl}" class="email-button">View Public Itinerary →</a>
      </p>

      <p class="email-muted">
        You can unpublish your trip anytime from the trip settings.
      </p>
    `);

    await this.sendEmail({
      to: email,
      subject: `Your trip "${tripTitle}" is now live on Traveloop!`,
      text: `Hi ${name}, your trip "${tripTitle}" is now public. View it at: ${publicUrl}`,
      html
    });
  }

  private async sendTwilioMessage(
    from: string,
    to: string,
    body: string
  ): Promise<NotificationResult> {
    assertTwilioConfigured();

    const startedAt = Date.now();
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams({ From: from, To: to, Body: body });
    const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      throw new AppError('Phone message delivery failed', 'PHONE_DELIVERY_FAILED', 502);
    }

    const payload = (await response.json()) as { sid?: string };
    logger.info('Phone message sent', { durationMs: Date.now() - startedAt, provider: 'twilio' });
    return { provider: 'twilio', messageId: payload.sid ?? null, status: 'sent' };
  }
}

export const notificationsService = new NotificationsService();
