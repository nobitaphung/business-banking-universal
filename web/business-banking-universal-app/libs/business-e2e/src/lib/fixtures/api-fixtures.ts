import { CommonFixtures, UseFunction } from '../../fixtures';
import { ArrangementsApi, ContactsApi } from '../api-clients';
import { OtpSmsHandlerApi } from '../api-clients/clients/otp-sms-handler-client';

export interface ApiClientsFixtures {
  contactsApi: ContactsApi;
  arrangementsApi: ArrangementsApi;
  otpSmsClient: OtpSmsHandlerApi;
}

export const apiFixtures = {
  contactsApi: async ({ page, config }: CommonFixtures, use: UseFunction) => {
    await use(new ContactsApi(page, config));
  },
  arrangementsApi: async ({ page, config }: CommonFixtures, use: UseFunction) => {
    await use(new ArrangementsApi(page, config));
  },
  otpSmsClient: async ({ config }: CommonFixtures, use: UseFunction) => {
    await use(new OtpSmsHandlerApi(config.twilio));
  },
};
