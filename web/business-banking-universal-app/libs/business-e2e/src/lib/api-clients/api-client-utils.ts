import { APIResponse, BrowserContext } from '@playwright/test';
import { getLocalStorageItem } from '../utils';

export const logResponseData = async (response: APIResponse): Promise<void> => {
  if (process.env.DEBUG_TEST) {
    console.debug('Incoming response from :', response.url());
    console.debug('\t Status: ', response.status());
    console.debug('\t Status Text: ', response.statusText());
    console.debug('\t Response Headers: ', response.headersArray());
    console.debug('\t Response body: ', await response.text());
  }
};

export const getDefaultApiHeaders = async (context: BrowserContext, { baasToken }) => {
  const accessToken = await getLocalStorageItem('access_token', context);
  return { 'x-prdl-baas': baasToken, Authorization: `Bearer ${accessToken}` };
};
