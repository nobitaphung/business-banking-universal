import { test, expect, LoginState } from '@backbase/business-e2e';
import { UserType } from '@backbase/business-e2e';

test.describe('Universal: Journeys availability by direct navigation spec', () => {
  test.use({ loginState: LoginState.loggedIn, testUserType: UserType.userWithSingleContext });

  test('User is able to access Accounts journey by navigating to it by direct URL', async ({ accountsPage }) => {
    await accountsPage.navigateTo();
    await expect.soft(accountsPage.journeyUi).toBeVisible();
    expect.soft(await accountsPage.pageTitleHeader.textContent()).toContain('Accounts');
    expect.soft(await accountsPage.page.title()).toContain('Accounts');
  });

  test('User is able to access Cards journey by navigating to it by direct URL', async ({ cardsPage }) => {
    await cardsPage.navigateTo();
    await expect.soft(cardsPage.journeyUi).toBeVisible();
    expect.soft(await cardsPage.pageTitleHeader.textContent()).toContain('Cards');
    expect.soft(await cardsPage.page.title()).toContain('Cards');
  });

  test('User is able to access Loans journey by navigating to it by direct URL', async ({ loansPage }) => {
    await loansPage.navigateTo();
    await expect.soft(loansPage.journeyUi).toBeVisible();
    expect.soft(await loansPage.pageTitleHeader.textContent()).toContain('Loans overview');
    expect.soft(await loansPage.page.title()).toContain('Loans');
  });

  test('User is able to access Account Statements journey by navigating to it by direct URL', async ({
    accountStatementsPage,
  }) => {
    await accountStatementsPage.navigateTo();
    await expect.soft(accountStatementsPage.journeyUi).toBeVisible();
    expect.soft(await accountStatementsPage.pageTitleHeader.textContent()).toContain('Account Statements');
    expect.soft(await accountStatementsPage.page.title()).toContain('Account Statements');
  });

  test('User is able to access Transactions journey by navigating to it by direct URL', async ({
    transactionsPage,
  }) => {
    await transactionsPage.navigateTo();
    await expect.soft(transactionsPage.journeyUi).toBeVisible();
    expect.soft(await transactionsPage.pageTitleHeader.textContent()).toContain('Transactions');
    expect.soft(await transactionsPage.page.title()).toContain('Transactions');
  });

  test('User is able to access Transfers journey by navigating to it by direct URL', async ({
    oneOffTransfersPage,
  }) => {
    await oneOffTransfersPage.navigateTo();
    await expect.soft(oneOffTransfersPage.journeyUi).toBeVisible();
    expect.soft(await oneOffTransfersPage.pageTitleHeader.textContent()).toContain('Transfers');
    expect.soft(await oneOffTransfersPage.page.title()).toContain('One-off');
  });

  test('User is able to access Batches journey by navigating to it by direct URL', async ({ manageBatchesPage }) => {
    await manageBatchesPage.navigateTo();
    await expect.soft(manageBatchesPage.journeyUi).toBeVisible();
    expect.soft(await manageBatchesPage.pageTitleHeader.textContent()).toContain('Batches');
    expect.soft(await manageBatchesPage.page.title()).toContain('Manage');
  });

  test('User is able to access Stop Check Payments journey by navigating to it by direct URL', async ({
    stopCheckPaymentsPage,
  }) => {
    await stopCheckPaymentsPage.navigateTo();
    await expect.soft(stopCheckPaymentsPage.journeyUi).toBeVisible();
    expect.soft(await stopCheckPaymentsPage.pageTitleHeader.textContent()).toContain('Stop Checks');
    expect.soft(await stopCheckPaymentsPage.page.title()).toContain('Stop check payments');
  });

  test('User is able to access Templates journey by navigating to it by direct URL', async ({
    paymentsTemplatesPage,
  }) => {
    await paymentsTemplatesPage.navigateTo();
    await expect.soft(paymentsTemplatesPage.journeyUi).toBeVisible();
    expect.soft(await paymentsTemplatesPage.pageTitleHeader.textContent()).toContain('Manage Templates');
    expect.soft(await paymentsTemplatesPage.page.title()).toContain('Payments');
  });

  test('User is able to access Contacts journey by navigating to it by direct URL', async ({ allContactsPage }) => {
    await allContactsPage.navigateTo();
    await expect.soft(allContactsPage.journeyUi).toBeVisible();
    expect.soft(await allContactsPage.pageTitleHeader.textContent()).toContain('Contact Manager');
    expect.soft(await allContactsPage.page.title()).toContain('All contacts');
  });

  test('User is able to access Cash Flow journey by navigating to it by direct URL', async ({ linkPlatformPage }) => {
    await linkPlatformPage.navigateTo();
    await expect.soft(linkPlatformPage.journeyUi).toBeVisible();
    expect.soft(await linkPlatformPage.pageTitleHeader.textContent()).toContain('Cash Flow');
    expect.soft(await linkPlatformPage.page.title()).toContain('Cash Flow');
  });

  test('User is able to access Sweeping journey by navigating to it by direct URL', async ({ sweepingPage }) => {
    await sweepingPage.navigateTo();
    await expect.soft(sweepingPage.journeyUi).toBeVisible();
    expect.soft(await sweepingPage.pageTitleHeader.textContent()).toContain('Sweeping');
    expect.soft(await sweepingPage.page.title()).toContain('Sweeping');
  });

  test('User is able to access Forex journey by navigating to it by direct URL', async ({ currenciesPage }) => {
    await currenciesPage.navigateTo();
    await expect.soft(currenciesPage.journeyUi).toBeVisible();
    expect.soft(await currenciesPage.pageTitleHeader.textContent()).toContain('Forex');
    expect.soft(await currenciesPage.page.title()).toContain('Currencies');
  });

  test.skip('User is able to access Trade Finance journey by navigating to it by direct URL', async ({
    importPage,
  }) => {
    await importPage.navigateTo();
    await expect.soft(importPage.journeyUi).toBeVisible();
    expect.soft(await importPage.pageTitleHeader.textContent()).toContain('Trade Finance');
    expect.soft(await importPage.page.title()).toContain('Trade Finance');
  });

  test('User is able to access Messages journey by navigating to it by direct URL', async ({ inboxPage }) => {
    await inboxPage.navigateTo();
    await expect.soft(inboxPage.journeyUi).toBeVisible();
    expect.soft(await inboxPage.pageTitleHeader.textContent()).toContain('Inbox');
    expect.soft(await inboxPage.page.title()).toContain('Inbox');
  });

  test('User is able to access My Profile journey by navigating to it by direct URL', async ({
    contactDetailsPage,
  }) => {
    await contactDetailsPage.navigateTo();
    await expect.soft(contactDetailsPage.journeyUi).toBeVisible();
    expect.soft(await contactDetailsPage.pageTitleHeader.textContent()).toContain('My Profile');
    expect.soft(await contactDetailsPage.page.title()).toContain('Contact Details');
  });

  test('User is able to access Find ATM or Branch journey by navigating to it by direct URL', async ({
    findAtmBranchPage,
  }) => {
    await findAtmBranchPage.navigateTo();
    await expect.soft(findAtmBranchPage.journeyUi).toBeVisible();
    expect.soft(await findAtmBranchPage.pageTitleHeader.textContent()).toContain('Find Branches and ATMs');
    expect.soft(await findAtmBranchPage.page.title()).toContain('Places');
  });

  test('User is able to access Audit journey by navigating to it by direct URL', async ({ auditPage }) => {
    await auditPage.navigateTo();
    await expect.soft(auditPage.journeyUi).toBeVisible();
    expect.soft(await auditPage.pageTitleHeader.textContent()).toContain('Audit');
    expect.soft(await auditPage.page.title()).toContain('Audit');
  });

  test('User is able to access Company Permissions journey by navigating to it by direct URL', async ({
    userAndPermissionsPage,
  }) => {
    await userAndPermissionsPage.navigateTo();
    await expect.soft(userAndPermissionsPage.journeyUi).toBeVisible();
    expect.soft(await userAndPermissionsPage.pageTitleHeader.textContent()).toContain('Company Permissions');
    expect.soft(await userAndPermissionsPage.page.title()).toContain('User & Permissions');
  });

  test('User is able to access Service Agreements journey by navigating to it by direct URL', async ({
    serviceAgreementsPage,
  }) => {
    await serviceAgreementsPage.navigateTo();
    await expect.soft(serviceAgreementsPage.journeyUi).toBeVisible();
    expect.soft(await serviceAgreementsPage.pageTitleHeader.textContent()).toContain('Service Agreements');
    expect.soft(await serviceAgreementsPage.page.title()).toContain('Service Agreements');
  });

  test('User is able to access Legal Entities journey by navigating to it by direct URL', async ({
    legalEntitiesPage,
  }) => {
    await legalEntitiesPage.navigateTo();
    await expect.soft(legalEntitiesPage.journeyUi).toBeVisible();
    expect.soft(await legalEntitiesPage.pageTitleHeader.textContent()).toContain('Legal Entities');
    expect.soft(await legalEntitiesPage.page.title()).toContain('Legal Entities');
  });
});
