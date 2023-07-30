import { PlaywrightTestArgs, PlaywrightTestOptions, test as baseTest } from '@playwright/test';

import { Config, UserData, UserType } from './lib/data';
import {
  LoginState,
  getStorageStatePathForUser,
  isReloginRequired,
  readFile,
  augmentPageWithBaasHeader,
  authenticateUser,
} from './lib/utils';
import { pageFixtures, PageFixtures } from './lib/fixtures/page-fixtures';
import { ApiClientsFixtures, apiFixtures } from './lib/fixtures/api-fixtures';

export type CommonFixtures = TestOptions &
  PageFixtures &
  ApiClientsFixtures &
  ConfigurationFixtures &
  PlaywrightTestArgs &
  PlaywrightTestOptions;
export type UseFunction = (...args: any[]) => Promise<void>;

export interface TestOptions {
  configPath: string;
  testUserType: UserType;
  loginState: LoginState;
}

export interface ConfigurationFixtures {
  config: Config;
  testUser: UserData;
}

export const test = baseTest.extend<CommonFixtures>({
  ...pageFixtures,
  ...apiFixtures,
  configPath: ['', { option: true }],
  loginState: [LoginState.loggedIn, { option: true }],
  testUserType: [UserType.userWithSingleContext, { option: true }],

  config: async ({ configPath }, use) => {
    const configObject = readFile<Config>(configPath);
    await use(configObject);
  },
  baseURL: async ({ baseURL, config }, use) => {
    //Case when baseUrl is redefined in playwright.config
    if (baseURL) {
      await use(baseURL);
    }
    await use(config.baseUrl);
  },
  testUser: async ({ config, testUserType }, use) => {
    await use(config.users[testUserType]);
  },
  storageState: async ({ testUser, config, loginState, baseURL }, use) => {
    const sessionStoragePath = getStorageStatePathForUser(testUser.username);
    if (loginState === LoginState.loggedIn && (await isReloginRequired(sessionStoragePath))) {
      await authenticateUser(testUser, config, baseURL);
      await use(sessionStoragePath);
    } else if (loginState === LoginState.loggedIn) {
      await use(sessionStoragePath);
    } else {
      await use({ cookies: [], origins: [] });
    }
  },
  page: async ({ page, config }, use) => {
    await augmentPageWithBaasHeader(page, config.baasToken);
    await page.goto('/');
    await use(page);
  },
});

export const expect = test.expect;
