import { Page } from '@playwright/test';
import { ApiConfig } from '../api-config';
import { getDefaultApiHeaders, logResponseData } from '../api-client-utils';
import { CONTACTS_PATH } from '../api-urls.data';
import { ContactsApiData } from '../dto/contacts-api.data';

export class ContactsApi {
  constructor(private page: Page, private config: ApiConfig) {}

  async getAllContacts(): Promise<ContactsApiData[]> {
    const response = await this.page.request.get(CONTACTS_PATH, {
      params: {
        from: 0,
        size: 100,
      },
      headers: await getDefaultApiHeaders(this.page.context(), this.config),
    });
    await logResponseData(response);
    return (await response.json()) as ContactsApiData[];
  }
}
