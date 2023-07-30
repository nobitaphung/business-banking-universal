import { Locator } from '@playwright/test';

export class AccountInfoLabelValuePair {
  readonly label = this.root.locator(`[data-role*='${this.rootDataRole}-title']`);
  readonly value = this.root.locator(`[data-role*='${this.rootDataRole}-value']`);

  constructor(public root: Locator, private rootDataRole: string) {}
}
