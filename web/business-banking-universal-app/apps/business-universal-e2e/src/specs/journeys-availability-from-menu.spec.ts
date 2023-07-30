import { test, expect, LoginState } from '@backbase/business-e2e';
import { ApplicationMenu } from '../data/menu.data';
import { UserType } from '@backbase/business-e2e';

test.describe('Universal: Journeys availability by accessing it through menu spec', () => {
  test.use({ loginState: LoginState.loggedIn, testUserType: UserType.userWithSingleContext });

  test('User is able to access Accounts journey by navigating to it through the menu', async ({
    basePage,
    accountsPage,
  }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await accountsAndCards.goTo('Accounts');
    await expect.soft(accountsPage.journeyUi).toBeVisible();
    expect.soft(await accountsPage.pageTitleHeader.textContent()).toContain('Accounts');
    expect.soft(await accountsPage.page.title()).toContain('Accounts');
  });

  test('User is able to access Cards journey by navigating to it through the menu', async ({ basePage, cardsPage }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await accountsAndCards.goTo('Cards');
    await expect.soft(cardsPage.journeyUi).toBeVisible();
    expect.soft(await cardsPage.pageTitleHeader.textContent()).toContain('Cards');
    expect.soft(await cardsPage.page.title()).toContain('Cards');
  });

  test('User is able to access Loans journey by navigating to it through the menu', async ({ basePage, loansPage }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await accountsAndCards.goTo('Loans');
    await expect.soft(loansPage.journeyUi).toBeVisible();
    expect.soft(await loansPage.pageTitleHeader.textContent()).toContain('Loans overview');
    expect.soft(await loansPage.page.title()).toContain('Loans');
  });

  test('User is able to access Account Statements journey by navigating to it through the menu', async ({
    basePage,
    accountStatementsPage,
  }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await accountsAndCards.goTo('Account Statements');
    await expect.soft(accountStatementsPage.journeyUi).toBeVisible();
    expect.soft(await accountStatementsPage.pageTitleHeader.textContent()).toContain('Account Statements');
    expect.soft(await accountStatementsPage.page.title()).toContain('Account Statements');
  });

  test('User is able to access Transactions journey by navigating to it through the menu', async ({
    basePage,
    transactionsPage,
  }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await accountsAndCards.goTo('Transactions');
    await expect.soft(transactionsPage.journeyUi).toBeVisible();
    expect.soft(await transactionsPage.pageTitleHeader.textContent()).toContain('Transactions');
    expect.soft(await transactionsPage.page.title()).toContain('Transactions');
  });

  test('User is able to access Transfers journey by navigating to it through the menu', async ({
    basePage,
    oneOffTransfersPage,
  }) => {
    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await moveMoney.goTo('Transfers');
    await expect.soft(oneOffTransfersPage.journeyUi).toBeVisible();
    expect.soft(await oneOffTransfersPage.pageTitleHeader.textContent()).toContain('Transfers');
    expect.soft(await oneOffTransfersPage.page.title()).toContain('One-off');
  });

  test('User is able to access Batches journey by navigating to it through the menu', async ({
    basePage,
    manageBatchesPage,
  }) => {
    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await moveMoney.goTo('Batches');
    await expect.soft(manageBatchesPage.journeyUi).toBeVisible();
    expect.soft(await manageBatchesPage.pageTitleHeader.textContent()).toContain('Batches');
    expect.soft(await manageBatchesPage.page.title()).toContain('Manage');
  });

  test('User is able to access Stop Check Payments journey by navigating to it through the menu', async ({
    basePage,
    stopCheckPaymentsPage,
  }) => {
    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await moveMoney.goTo('Stop check payments');
    await expect.soft(stopCheckPaymentsPage.journeyUi).toBeVisible();
    expect.soft(await stopCheckPaymentsPage.pageTitleHeader.textContent()).toContain('Stop Checks');
    expect.soft(await stopCheckPaymentsPage.page.title()).toContain('Stop check payments');
  });

  test('User is able to access Templates journey by navigating to it through the menu', async ({
    basePage,
    paymentsTemplatesPage,
  }) => {
    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await moveMoney.goTo('Templates');
    await expect.soft(paymentsTemplatesPage.journeyUi).toBeVisible();
    expect.soft(await paymentsTemplatesPage.pageTitleHeader.textContent()).toContain('Manage Templates');
    expect.soft(await paymentsTemplatesPage.page.title()).toContain('Payments');
  });

  test('User is able to access Contacts journey by navigating to it through the menu', async ({
    basePage,
    allContactsPage,
  }) => {
    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await moveMoney.goTo('Contacts');
    await expect.soft(allContactsPage.journeyUi).toBeVisible();
    expect.soft(await allContactsPage.pageTitleHeader.textContent()).toContain('Contact Manager');
    expect.soft(await allContactsPage.page.title()).toContain('All contacts');
  });

  test('User is able to access Cash Flow journey by navigating to it through the menu', async ({
    basePage,
    linkPlatformPage,
  }) => {
    const financeManagement = await basePage.navigationMenu.getMenuSection(ApplicationMenu.financeManagement.name);
    await financeManagement.goTo('Cash Flow');
    await expect.soft(linkPlatformPage.journeyUi).toBeVisible();
    expect.soft(await linkPlatformPage.pageTitleHeader.textContent()).toContain('Cash Flow');
    expect.soft(await linkPlatformPage.page.title()).toContain('Cash Flow');
  });

  test('User is able to access Sweeping journey by navigating to it through the menu', async ({
    basePage,
    sweepingPage,
  }) => {
    const financeManagement = await basePage.navigationMenu.getMenuSection(ApplicationMenu.financeManagement.name);
    await financeManagement.goTo('Sweeping');
    await expect.soft(sweepingPage.journeyUi).toBeVisible();
    expect.soft(await sweepingPage.pageTitleHeader.textContent()).toContain('Sweeping');
    expect.soft(await sweepingPage.page.title()).toContain('Sweeping');
  });

  test('User is able to access Forex journey by navigating to it through the menu', async ({
    basePage,
    currenciesPage,
  }) => {
    const financeManagement = await basePage.navigationMenu.getMenuSection(ApplicationMenu.financeManagement.name);
    await financeManagement.goTo('Forex');
    await expect.soft(currenciesPage.journeyUi).toBeVisible();
    expect.soft(await currenciesPage.pageTitleHeader.textContent()).toContain('Forex');
    expect.soft(await currenciesPage.page.title()).toContain('Currencies');
  });

  test('User is able to access Messages journey by navigating to it through the menu', async ({
    basePage,
    inboxPage,
  }) => {
    const personal = await basePage.navigationMenu.getMenuSection(ApplicationMenu.personal.name);
    await personal.goTo('Messages');
    await expect.soft(inboxPage.journeyUi).toBeVisible();
    expect.soft(await inboxPage.pageTitleHeader.textContent()).toContain('Inbox');
    expect.soft(await inboxPage.page.title()).toContain('Inbox');
  });

  test('User is able to access My Profile journey by navigating to it through the menu', async ({
    basePage,
    contactDetailsPage,
  }) => {
    const personal = await basePage.navigationMenu.getMenuSection(ApplicationMenu.personal.name);
    await personal.goTo('My profile');
    await expect.soft(contactDetailsPage.journeyUi).toBeVisible();
    expect.soft(await contactDetailsPage.pageTitleHeader.textContent()).toContain('My Profile');
    expect.soft(await contactDetailsPage.page.title()).toContain('Contact Details');
  });

  test('User is able to access Find ATM or Branch journey by navigating to it through the menu', async ({
    basePage,
    findAtmBranchPage,
  }) => {
    const personal = await basePage.navigationMenu.getMenuSection(ApplicationMenu.personal.name);
    await personal.goTo('Find ATM or Branch');
    await expect.soft(findAtmBranchPage.journeyUi).toBeVisible();
    expect.soft(await findAtmBranchPage.pageTitleHeader.textContent()).toContain('Find Branches and ATMs');
    expect.soft(await findAtmBranchPage.page.title()).toContain('Places');
  });

  test('User is able to access Audit journey by navigating to it through the menu', async ({ basePage, auditPage }) => {
    const companyAdministration = await basePage.navigationMenu.getMenuSection(
      ApplicationMenu.companyAdministration.name,
    );
    await companyAdministration.goTo('Audit');
    await expect.soft(auditPage.journeyUi).toBeVisible();
    expect.soft(await auditPage.pageTitleHeader.textContent()).toContain('Audit');
    expect.soft(await auditPage.page.title()).toContain('Audit');
  });

  test('User is able to access Company Permissions journey by navigating to it through the menu', async ({
    basePage,
    userAndPermissionsPage,
  }) => {
    const companyAdministration = await basePage.navigationMenu.getMenuSection(
      ApplicationMenu.companyAdministration.name,
    );
    await companyAdministration.goTo('Company Permissions');
    await expect.soft(userAndPermissionsPage.journeyUi).toBeVisible();
    expect.soft(await userAndPermissionsPage.pageTitleHeader.textContent()).toContain('Company Permissions');
    expect.soft(await userAndPermissionsPage.page.title()).toContain('User & Permissions');
  });

  test('User is able to access Service Agreements journey by navigating to it through the menu', async ({
    basePage,
    serviceAgreementsPage,
  }) => {
    const companyAdministration = await basePage.navigationMenu.getMenuSection(
      ApplicationMenu.companyAdministration.name,
    );
    await companyAdministration.goTo('Service Agreements');
    await expect.soft(serviceAgreementsPage.journeyUi).toBeVisible();
    expect.soft(await serviceAgreementsPage.pageTitleHeader.textContent()).toContain('Service Agreements');
    expect.soft(await serviceAgreementsPage.page.title()).toContain('Service Agreements');
  });

  test('User is able to access Legal Entities journey by navigating to it through the menu', async ({
    basePage,
    legalEntitiesPage,
  }) => {
    const companyAdministration = await basePage.navigationMenu.getMenuSection(
      ApplicationMenu.companyAdministration.name,
    );
    await companyAdministration.goTo('Legal Entities');
    await expect.soft(legalEntitiesPage.journeyUi).toBeVisible();
    expect.soft(await legalEntitiesPage.pageTitleHeader.textContent()).toContain('Legal Entities');
    expect.soft(await legalEntitiesPage.page.title()).toContain('Legal Entities');
  });
});
