import { Page } from '@playwright/test';
import { ApiConfig } from '../api-config';
import { getDefaultApiHeaders, logResponseData } from '../api-client-utils';
import { ARRANGEMENTS_PATH } from '../api-urls.data';
import { ArrangementsApiData, ProductKinds } from '../dto/arrangements-api.data';
import { CreditDebitIndicator } from '../dto/batches-api.data';

export class ArrangementsApi {
  constructor(private page: Page, private config: ApiConfig) {}

  async getArrangements(): Promise<ArrangementsApiData[]> {
    const response = await this.page.request.get(ARRANGEMENTS_PATH, {
      params: {
        businessFunction: 'Product Summary, Product Summary Limited View',
        resourceName: 'Product Summary',
        privilege: 'view',
        from: 0,
        size: 100,
      },
      headers: await getDefaultApiHeaders(this.page.context(), this.config),
    });
    await logResponseData(response);
    return (await response.json()) as ArrangementsApiData[];
  }

  async getArrangementsForBatches(creditDebitIndicator: CreditDebitIndicator): Promise<ArrangementsApiData[]> {
    const response = await this.page.request.get(ARRANGEMENTS_PATH, {
      params: {
        businessFunction: 'Batch - Intracompany Payments',
        resourceName: 'Batch',
        privilege: 'create',
        ...(creditDebitIndicator === CreditDebitIndicator.CREDIT ? { creditAccount: true } : { debitAccount: true }),
        ignoredProductKindNames: [ProductKinds.creditCard, ProductKinds.debitCard].join(','),
        from: 0,
        size: 100,
      },
      headers: await getDefaultApiHeaders(this.page.context(), this.config),
    });
    await logResponseData(response);
    return (await response.json()) as ArrangementsApiData[];
  }
}
