import { Locator } from '@playwright/test';

export class RadioGroup {
  private readonly optionsLocator = '[data-role="radio-group-option"]';

  constructor(private root: Locator) {}

  public async select(value: string): Promise<void> {
    const optionToSelect = this.root.locator(`${this.optionsLocator}:has-text('${value}')`);
    await optionToSelect.click();
  }

  async getSelected(): Promise<string | null> {
    return this.root.locator(`${this.optionsLocator}.selected`).textContent();
  }

  async isSelected(value: string): Promise<boolean> {
    const selectedOptionText = await this.getSelected();
    return selectedOptionText !== null && selectedOptionText.includes(value);
  }

  public async getOptionsText(): Promise<string[]> {
    return this.root.locator(this.optionsLocator).allInnerTexts();
  }
}
