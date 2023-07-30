import { BaseElement } from '../../../elements';

export class AccountsTableRow extends BaseElement {
  readonly favoriteButton = this.root.locator('[data-role="favorite-icon"]');
  readonly displayName = this.root.locator('[data-role="table-view-display-name"]');
  readonly accountNumber = this.root.locator('[data-role="table-view-account-number"]');
  readonly currency = this.root.locator('[data-role="table-view-currency"]');
  readonly availableBalance = this.root.locator('[data-role="available-balance"] [data-role="bb-amount-value"]');
  readonly bookedBalance = this.root.locator('[data-role="booked-balance"] [data-role="bb-amount-value"]');
}
