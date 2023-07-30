import { LoginState, NavigationMenuSection, test } from '@backbase/business-e2e';
import { ApplicationMenu } from '../data/menu.data';
import { expect } from '@playwright/test';
import { UserType } from '@backbase/business-e2e';

test.describe('Universal: Navigation menu spec', () => {
  test.use({ loginState: LoginState.loggedIn, testUserType: UserType.userWithSingleContext });

  test('User is able to see all elements of application navigation menu', async ({ basePage }) => {
    const accountsAndCards = await basePage.navigationMenu.getMenuSection(ApplicationMenu.accountsAndCards.name);
    await assertMenuSectionAndItems(accountsAndCards, ApplicationMenu.accountsAndCards);

    const moveMoney = await basePage.navigationMenu.getMenuSection(ApplicationMenu.moveMoney.name);
    await assertMenuSectionAndItems(moveMoney, ApplicationMenu.moveMoney);

    const financeManagement = await basePage.navigationMenu.getMenuSection(ApplicationMenu.financeManagement.name);
    await assertMenuSectionAndItems(financeManagement, ApplicationMenu.financeManagement);

    const personal = await basePage.navigationMenu.getMenuSection(ApplicationMenu.personal.name);
    await assertMenuSectionAndItems(personal, ApplicationMenu.personal);

    const companyAdministration = await basePage.navigationMenu.getMenuSection(
      ApplicationMenu.companyAdministration.name,
    );
    await assertMenuSectionAndItems(companyAdministration, ApplicationMenu.companyAdministration);
  });
});

async function assertMenuSectionAndItems(actual: NavigationMenuSection, expected: { name: string; items: string[] }) {
  await expect.soft(actual.name).toBeVisible();
  await expect.soft(actual.name).toHaveText(expected.name);

  const labelsAsPromises = actual.items.map(async (actualItem) => await actualItem.textContent());
  const actualLabels: (string | null)[] = [];
  Promise.all(labelsAsPromises).then((value) => {
    value.forEach((label) => actualLabels.push(label));
  });

  for (let item = 0; item < actual.items.length; item++) {
    await expect.soft(actual.items[item]).toBeVisible();
    expect.soft(actual.items.length).toBe(expected.items.length);
    expect(
      actualLabels.every((l) => expected.items.includes(l as string)),
      `${await actual.name.textContent()} menu section missing a menu item`,
    ).toBe(true);
  }
}
