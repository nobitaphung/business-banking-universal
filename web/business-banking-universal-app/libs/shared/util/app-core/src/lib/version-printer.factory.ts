import { InjectionToken } from '@angular/core';
import packageJson from '../../../../../../package.json';

export function versionPrinterFactory() {
  return () => {
    // eslint-disable-next-line no-restricted-syntax
    console.info(`App: ${packageJson.backbase.appVersion} with version: ${packageJson.version}`);
  };
}

export const BACKBASE_APP_VERSION = new InjectionToken<BackbaseVersionConfig>('BACKBASE_APP_VERSION');

export interface BackbaseVersionConfig {
  appVersion: string;
  calendarVersion: string;
}
