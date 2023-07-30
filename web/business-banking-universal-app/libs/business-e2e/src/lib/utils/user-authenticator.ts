import { UserData, Config } from '../data';
import { Browser, chromium } from '@playwright/test';
import { augmentPageWithBaasHeader } from './playwright-utils';
import { IdentityLoginPage, AccountsPage, SelectContextPage } from '../page-objects';
import { getStorageStatePathForUser } from './config-utils';

export const authenticateUser = async (user: UserData, config: Config, baseUrl?: string, externalBrowser?: Browser) => {
  const browser = externalBrowser ? externalBrowser : await chromium.launch({ headless: true });
  const effectiveBaseUrl = baseUrl ? baseUrl : config.baseUrl;

  const context = await browser.newContext();
  const page = await augmentPageWithBaasHeader(await context.newPage(), config.baasToken);

  await page.goto(effectiveBaseUrl);

  const identityPage = new IdentityLoginPage(page);
  const accountsPage = new AccountsPage(page);

  await identityPage.loginThroughUI(user.username, user.password);
  if (user.defaultContext) {
    const contextSelectionPage = new SelectContextPage(page);
    await contextSelectionPage.selectContext(user.defaultContext);
  }
  await accountsPage.accountTable.root.waitFor();

  const userSessionState = getStorageStatePathForUser(user.username);
  await context.storageState({ path: userSessionState as string });
  await context.close();

  if (!externalBrowser) {
    await browser.close();
  }
};
