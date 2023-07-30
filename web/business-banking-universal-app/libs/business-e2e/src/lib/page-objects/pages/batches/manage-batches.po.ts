import { Page } from '@playwright/test';
import { BATCHES_MANAGE_PAGE_PATH } from '../../../data';
import { BasePage } from '../base-page.po';
import {
  BatchInfo,
  fields,
  FormFieldType,
  ManualBatchType,
  Step,
  StepSelectors,
  TransferDetails,
} from '../../../data/model/batches.data';
import { locators } from '../../../locators/manual-batch.locators';
import { ManageBatchesTable } from '../../fragments/batches/manage-batches-table';
import { BATCHES_PATHS } from '../../urls.data';

export interface ManualPageObjectConfiguration {
  page: Page;
  batchType: ManualBatchType;
}

export class ManageBatchesPage extends BasePage {
  url = BATCHES_PATHS.CREATE_MANUAL_BATCH;
  url_manage_batches_list = BATCHES_PATHS.MANAGE_BATCHES_LIST;
  batchTypeSelectorIndex = 0;
  fields = fields;
  stepFields: any = fields[ManualBatchType.INTRACOMPANY_PAYMENT_CREDIT_USA] as StepSelectors<
    BatchInfo | TransferDetails
  >;
  locators: Record<any, any> = locators;
  readonly manageBatchesTable = new ManageBatchesTable(this.page.locator('bb-batch-manager-list'));

  readonly journeyUi = this.page.locator('bb-batch-manager-list');

  constructor(page: Page) {
    super(page);
  }

  transactionSigningHeader() {
    return this.page.locator('bb-transaction-signing-header');
  }

  async navigateTo() {
    await super.navigateTo(BATCHES_MANAGE_PAGE_PATH);
  }

  waitForAngular() {
    return this.page.evaluate(async () => {
      // @ts-expect-error getAllAngularTestabilities not found
      if (window.getAllAngularTestabilities) {
        // @ts-expect-error getAllAngularTestabilities not found
        await Promise.all(window.getAllAngularTestabilities().map(whenStable));
        // eslint-disable-next-line
        async function whenStable(testability: any) {
          return new Promise((res) => testability.whenStable(res));
        }
      }
    });
  }

  async goto(wait = true) {
    await this.page.goto(this.url);
    wait && (await this.waitForAngular());
  }

  async goToManageBatchesList(wait = true) {
    await this.page.goto(this.url_manage_batches_list);
    wait && (await this.waitForAngular());
  }

  static from(config: ManualPageObjectConfiguration) {
    const pageObject: ManageBatchesPage = new ManageBatchesPage(config.page);

    switch (config.batchType) {
      case ManualBatchType.INTRACOMPANY_PAYMENT_CREDIT_USA:
        pageObject.stepFields = fields[config.batchType] as StepSelectors<BatchInfo | TransferDetails>;
        pageObject.batchTypeSelectorIndex = 0;
        break;
    }

    return pageObject;
  }

  batchTypeSelector() {
    return this.page.locator(this.locators.batchTypeSelector);
  }

  async clickOnBatchType() {
    await this.batchTypeSelector().nth(this.batchTypeSelectorIndex).click();
  }

  async fillFormData(step: Step) {
    const stepFields = this.stepFields[step];
    for (const key of Object.keys(stepFields)) {
      const locator = this.page.locator(this.locators.fields[key]);
      const value = stepFields[key].value;
      switch (stepFields[key].type) {
        case FormFieldType.Select:
          await locator.selectOption(value);
          break;
        case FormFieldType.Text:
        default:
          await locator.fill(value);
          break;
      }
    }
  }

  gotoNextStep() {
    return this.page.locator(this.locators.nextButton).click();
  }

  async selectBeneficiaryAccount(itemIndex = 0) {
    await this.page.locator(this.locators.fields.fromAccount).click();
    await this.page.locator(this.locators.fromAccountListItem).nth(itemIndex).click();
  }

  async selectDebitorAccount(counterparty = { paymentIndex: 0, accountIndex: 0 }) {
    const { paymentIndex, accountIndex } = counterparty;
    await this.page.locator(this.locators.fields.counterparty.menu).nth(paymentIndex).click();
    await this.page.locator(this.locators.fields.counterparty.menuItemButton).nth(accountIndex).click();
  }

  async fillCounterpartyAmount(counterpartyAmount = { paymentIndex: 0, amount: '0' }) {
    const { paymentIndex, amount } = counterpartyAmount;
    await this.page.locator(this.locators.fields.amount).nth(paymentIndex).fill(amount);
  }

  async fillTransferData(paymentIndex: number, payments: { accountIndex: number; amount: string }[]) {
    const { accountIndex, amount } = payments[paymentIndex];
    await this.selectDebitorAccount({ paymentIndex, accountIndex });
    await this.fillCounterpartyAmount({ paymentIndex, amount });
  }

  addNewTransfer() {
    return this.page.locator(this.locators.addNewPaymentBtn).click();
  }

  submitBatchOrder() {
    return this.page.locator(this.locators.submitButton).click();
  }

  successMessage() {
    return this.page.locator('bb-status-card');
  }
}
