import { CommonFixtures, UseFunction } from '../../fixtures';
import {
  AccountsPage,
  AccountStatementsPage,
  AllContactsPage,
  AllPayeesPage,
  AuditPage,
  BasePage,
  CardsPage,
  ContactDetailsPage,
  CurrenciesPage,
  FindAtmBranchPage,
  IdentityLoginPage,
  ImportPage,
  InboxPage,
  LegalEntitiesPage,
  LinkPlatformPage,
  LoansPage,
  ManageBatchesPage,
  OneOffTransfersPage,
  PaymentsTemplatesPage,
  ReviewBatchesPage,
  SelectContextPage,
  ServiceAgreementsPage,
  StopCheckPaymentsPage,
  SweepingPage,
  TransactionsPage,
  UserAndPermissionsPage,
} from '../page-objects';

export interface PageFixtures {
  accountStatementsPage: AccountStatementsPage;
  accountsPage: AccountsPage;
  allContactsPage: AllContactsPage;
  allPayeesPage: AllPayeesPage;
  auditPage: AuditPage;
  basePage: BasePage;
  cardsPage: CardsPage;
  contactDetailsPage: ContactDetailsPage;
  currenciesPage: CurrenciesPage;
  findAtmBranchPage: FindAtmBranchPage;
  identityLogInPage: IdentityLoginPage;
  importPage: ImportPage;
  inboxPage: InboxPage;
  legalEntitiesPage: LegalEntitiesPage;
  linkPlatformPage: LinkPlatformPage;
  loansPage: LoansPage;
  manageBatchesPage: ManageBatchesPage;
  reviewBatchesPage: ReviewBatchesPage;
  oneOffTransfersPage: OneOffTransfersPage;
  selectContextPage: SelectContextPage;
  serviceAgreementsPage: ServiceAgreementsPage;
  stopCheckPaymentsPage: StopCheckPaymentsPage;
  sweepingPage: SweepingPage;
  paymentsTemplatesPage: PaymentsTemplatesPage;
  transactionsPage: TransactionsPage;
  userAndPermissionsPage: UserAndPermissionsPage;
}

export const pageFixtures = {
  accountStatementsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new AccountStatementsPage(page));
  },
  accountsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new AccountsPage(page));
  },
  allContactsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new AllContactsPage(page));
  },
  allPayeesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new AllPayeesPage(page));
  },
  auditPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new AuditPage(page));
  },
  basePage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new BasePage(page));
  },
  cardsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new CardsPage(page));
  },
  contactDetailsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new ContactDetailsPage(page));
  },
  currenciesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new CurrenciesPage(page));
  },
  findAtmBranchPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new FindAtmBranchPage(page));
  },
  identityLogInPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new IdentityLoginPage(page));
  },
  importPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new ImportPage(page));
  },
  inboxPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new InboxPage(page));
  },
  legalEntitiesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new LegalEntitiesPage(page));
  },
  linkPlatformPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new LinkPlatformPage(page));
  },
  loansPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new LoansPage(page));
  },
  manageBatchesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new ManageBatchesPage(page));
  },
  oneOffTransfersPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new OneOffTransfersPage(page));
  },
  selectContextPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new SelectContextPage(page));
  },
  serviceAgreementsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new ServiceAgreementsPage(page));
  },
  stopCheckPaymentsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new StopCheckPaymentsPage(page));
  },
  sweepingPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new SweepingPage(page));
  },
  paymentsTemplatesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new PaymentsTemplatesPage(page));
  },
  transactionsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new TransactionsPage(page));
  },
  userAndPermissionsPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new UserAndPermissionsPage(page));
  },
  reviewBatchesPage: async ({ page }: CommonFixtures, use: UseFunction) => {
    await use(new ReviewBatchesPage(page));
  },
};
