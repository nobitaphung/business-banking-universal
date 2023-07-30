import twilio from 'twilio';

export class OtpSmsHandlerApi {
  private client;

  constructor({ accountSid, authToken }) {
    this.client = twilio(accountSid, authToken);
  }

  async getSmsOtpCode(): Promise<string> {
    const lastTwilioMessage = await this.client.messages.list({ limit: 1 });

    const smsOtp = lastTwilioMessage.map((record) => record.body.match(/\d+/)!);

    return smsOtp[0].toString();
  }
}
