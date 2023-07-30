import { DropDownMenu } from './drop-down-menu.po';
import { Locator } from '@playwright/test';

export class CurrencyAmountSelector {
  private readonly currencySelect = new DropDownMenu(this.root.locator('bb-currency-selector'));
  private readonly integerInput = this.root.locator('[data-role="currency-input-integer-input"]');
  private readonly decimalInput = this.root.locator('[data-role="input-currency-decimals"]');

  constructor(private root: Locator) {}

  async setAmount(amount: string): Promise<void> {
    const [integer, decimal] = amount.split('.');
    await this.integerInput.fill(integer);
    await this.decimalInput.fill(decimal);
  }

  async getAmount(): Promise<string> {
    const integer = await this.integerInput.inputValue();
    const decimal = await this.decimalInput.inputValue();
    return decimal ? `${integer}.${decimal}` : integer;
  }

  selectCurrency(option: string): Promise<void> {
    return this.currencySelect.select(option);
  }

  getSelectedCurrency(): Promise<string | null> {
    return this.currencySelect.getSelectedOption();
  }
}
