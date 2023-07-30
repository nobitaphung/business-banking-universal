import { BasePage } from '../base-page.po';
import { TRANSFERS_ONE_OFF_PAGE_PATH } from '../../../data';
import { SearchBox } from '../../elements';
import { ApprovePaymentModal, ManagePaymentsTable } from '../../fragments';

export class OneOffTransfersPage extends BasePage {
  readonly managePaymentTable: ManagePaymentsTable = new ManagePaymentsTable(
    this.page.locator('.bb-manage-payments-table'),
  );
  readonly newTransferButton = this.page.locator('button', { hasText: 'New transfer' });
  readonly approvePaymentModal = new ApprovePaymentModal(this.page.locator('.modal-dialog'));
  readonly searchBox = new SearchBox(this.page.locator('bb-payments-search'));

  readonly emptyState = this.page.locator('bb-empty-manage-payments-list');
  readonly journeyUi = this.page.locator('bb-manage-payments-journey');

  async navigateTo() {
    await super.navigateTo(TRANSFERS_ONE_OFF_PAGE_PATH);
  }

  async searchForPayment(searchCriteria: string): Promise<void> {
    await this.searchBox.searchFor(searchCriteria);
    await this.page.locator('.bb-loading-indicator-container').waitFor({ state: 'attached' });
    await this.page.locator('.bb-loading-indicator-container').waitFor({ state: 'detached' });
  }
}
