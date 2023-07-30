import { BrowserContext, Page } from '@playwright/test';

export const augmentPageWithBaasHeader = async (page: Page, baasHeader: string): Promise<Page> => {
  await page.route('**/*', async (route) => {
    const headers = await route.request().allHeaders();
    headers['X-PRDL-BAAS'] = baasHeader;
    await route.continue({ headers: headers });
  });
  return page;
};

export const getLocalStorageItem = async (key: string, context: BrowserContext): Promise<string> => {
  const localStorage = (await context.storageState()).origins[0].localStorage;

  const localStorageKeyValue = localStorage.find((nameValuePair) => nameValuePair.name === key);
  if (!localStorageKeyValue) {
    throw new Error(`Could not find an element in localstorage with key ${key}`);
  }
  return localStorageKeyValue.value;
};
