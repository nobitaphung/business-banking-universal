import { BaseElement } from './base-element.po';

export class SearchBox extends BaseElement {
  readonly searchInput = this.root.locator('[data-role="search-input"]');
  readonly searchIcon = this.root.locator('[data-role="bb-search-button"]');
  readonly clearIcon = this.root.locator('[data-role="bb-clear-button"]');

  async searchFor(value: string): Promise<void> {
    await this.searchInput.fill(value);
    await this.searchIcon.click();
  }
}
