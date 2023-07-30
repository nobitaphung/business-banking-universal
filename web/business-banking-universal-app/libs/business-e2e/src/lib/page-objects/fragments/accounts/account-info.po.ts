import { Locator } from '@playwright/test';
import { AccountInfoLabelValuePair } from './account-info-label-value-pair.po';

export class AccountInfo {
  readonly name = this.getLabelValueElement('name');
  readonly accountType = this.getLabelValueElement('productTypeName');
  readonly bic = this.getLabelValueElement('bic');
  readonly currency = this.getLabelValueElement('currency');
  readonly availableBalance = this.getLabelValueElement('availableBalance');
  readonly bookedBalance = this.getLabelValueElement('bookedBalance');
  readonly creditLimit = this.getLabelValueElement('creditLimit');
  readonly creditLimitInterest = this.getLabelValueElement('creditLimitInterestRate');
  readonly creditLimitUsage = this.getLabelValueElement('creditLimitUsage');
  readonly accruedInterest = this.getLabelValueElement('accruedInterest');
  readonly interestRate = this.getLabelValueElement('accountInterestRate');
  readonly branchCode = this.getLabelValueElement('bankBranchCode');
  readonly openingDate = this.getLabelValueElement('accountOpeningDate');
  readonly lastUpdatedDate = this.getLabelValueElement('lastUpdateDate');
  readonly debitCardNumber = this.getLabelValueElement('debitCardNumber');
  readonly debitCardExpiryDate = this.getLabelValueElement('debitCardExpiryDate');

  readonly bban = {
    label: this.root.locator('[data-role*="bban"] [data-role$="bban-title"]'),
    value: this.root.locator('[data-role*="bban"] [data-role="product-number"]'),
  };

  readonly accountUnMaskingToggle = this.root.locator('[data-role="product-number-unmask-button"]');
  readonly accountMaskingToggle = this.root.locator('[data-role="product-number-mask-button"]');

  constructor(public root: Locator) {}

  getNumericFields(): AccountInfoLabelValuePair[] {
    return [
      this.availableBalance,
      this.bookedBalance,
      this.creditLimit,
      this.creditLimitUsage,
      this.creditLimitInterest,
      this.accruedInterest,
    ];
  }

  private getLabelValueElement(dataRole: string) {
    return new AccountInfoLabelValuePair(this.root.locator(`[data-role$=${dataRole}]`), dataRole);
  }
}
