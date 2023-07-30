import { Locator } from '@playwright/test';

export abstract class BaseTable<TRow> {
  protected headers: Locator;
  protected rows: Locator;

  protected constructor(
    protected rowConstructor: (row: Locator) => TRow,
    public root: Locator,
    selectors?: { header?: string; rows?: string },
  ) {
    this.headers = this.root.locator(selectors?.header || 'thead th');
    this.rows = this.root.locator(selectors?.rows || 'tbody tr');
  }

  async getRow(value: number | string | ((row: TRow) => Promise<boolean>)): Promise<TRow> {
    await this.rows.first().waitFor();

    let result: TRow | null;

    if (typeof value === 'number') {
      const totalRows = await this.rows.count();
      result = value < totalRows ? this.rowConstructor(this.rows.nth(value)) : null;
    } else if (typeof value === 'string') {
      const elementWithValue = this.rows.filter({ hasText: value });
      result = this.rowConstructor(elementWithValue);
    } else {
      result = await this.findRow(value);
    }
    if (!result) {
      throw new Error(`Table row cannot be found by given predicate ${value}`);
    }
    return result;
  }

  async getRows(search: (row: TRow) => Promise<boolean>): Promise<TRow[]> {
    await this.rows.first().waitFor();
    const result: TRow[] = [];
    const rowsAmount = await this.rows.count();
    for (let i = 0; i < rowsAmount; i++) {
      const row: TRow = this.rowConstructor(this.rows.nth(i));
      if (await search(row)) {
        result.push(row);
      }
    }
    return result;
  }

  async findRow(search: (row: TRow) => Promise<boolean>): Promise<TRow | null> {
    await this.rows.first().waitFor();
    const rowsAmount = await this.rows.count();
    for (let i = 0; i < rowsAmount; i++) {
      const row: TRow = this.rowConstructor(this.rows.nth(i));
      if (await search(row)) {
        return row;
      }
    }
    return null;
  }
}
