import { Locator } from '@playwright/test';

export class UploadBatchModal {
  readonly nextButton = this.root.locator('[data-role="next-button"]');
  readonly cancelButton = this.root.locator('[data-role="cancel-button"]');
  readonly selectedBatchFiles = this.root.locator('bb-confirm-batch-submit').locator('li');

  private readonly batchTypeListItemLocator = '[data-role="batch-types"]';
  private readonly batchFileInput = this.root.locator('input[type="file"]');

  constructor(private root: Locator) {}

  async selectBatchType(batchType: string): Promise<void> {
    await this.root.locator(`${this.batchTypeListItemLocator}:has-text("${batchType}")`).click();
  }

  async selectBatchFile(localPath: string): Promise<void> {
    await this.batchFileInput.setInputFiles(localPath);
  }
}
