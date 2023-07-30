import { test, expect, LoginLogoutActions, LoginState, UserType } from '@backbase/business-e2e';

test.describe('Universal: Log in spec', () => {
  test.use({ loginState: LoginState.notLoggedIn, testUserType: UserType.userWithSingleContext });

  test('User is able to log in to the Universal Business Banking App', async ({ basePage, page, testUser }) => {
    await LoginLogoutActions.logIn(page, testUser.username, testUser.password, testUser.userContext);
    await expect(await basePage.userContextMenu.username.textContent()).toContain(testUser.fullName);
    await expect(await basePage.userContextMenu.contextname.textContent()).toContain(testUser.userContext);
  });

  test('User is able to log out of Universal Business Banking App', async ({ basePage, page, testUser }) => {
    await LoginLogoutActions.logIn(page, testUser.username, testUser.password, testUser.userContext);
    const identityLoginPage = await LoginLogoutActions.logOut(basePage);
    await expect(identityLoginPage.usernameInput).toBeVisible();
    await expect(identityLoginPage.passwordInput).toBeVisible();
    await expect(identityLoginPage.loginButton).toBeVisible();
  });
});
