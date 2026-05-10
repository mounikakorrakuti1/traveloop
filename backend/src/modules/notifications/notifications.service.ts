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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new AppError('Email delivery failed', 'EMAIL_DELIVERY_FAILED', 502);
    }

    const result = (await response.json()) as { id?: string };
    logger.info('Email sent', { durationMs: Date.now() - startedAt, provider: 'resend' });
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

  public async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Traveloop password reset OTP',
      text: `Your Traveloop password reset OTP is ${otp}. It expires in 15 minutes.`,
      html: `<p>Your Traveloop password reset OTP is <strong>${otp}</strong>.</p><p>It expires in 15 minutes.</p>`
    });
  }

  public async sendRegistrationWelcome(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Traveloop',
      text: `Hi ${name}, your Traveloop account was created successfully. You can now start planning your trips.`,
      html: `<p>Hi ${name},</p><p>Your Traveloop account was created successfully. You can now start planning your trips.</p>`
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
