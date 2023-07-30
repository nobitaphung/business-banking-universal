import { Page } from '@playwright/test';
import { BasePage, IdentityLoginPage, SelectContextPage } from '../page-objects';

export class LoginLogoutActions {
  public static async logIn(page: Page, username: string, password: string, context?: string) {
    const identityLogInPage = new IdentityLoginPage(page);
    await identityLogInPage.loginThroughUI(username, password);
    const basePage = new BasePage(page);

    if (context == undefined) {
      await basePage.pageTitleHeader.waitFor();
      return;
    }

    const selectContextPage = new SelectContextPage(page);
    await selectContextPage.selectContext(context);
    await basePage.pageTitleHeader.waitFor();
  }

  public static async logOut(basePage: BasePage): Promise<IdentityLoginPage> {
    await basePage.userContextMenu.logOut();
    return new IdentityLoginPage(basePage.page);
  }
}
