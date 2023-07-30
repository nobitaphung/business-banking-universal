import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { ENTITLEMENTS_CONFIG, EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { PubSubService, SetLocaleService } from '@backbase/foundation-ang/web-sdk';
import { BACKBASE_APP_VERSION, versionPrinterFactory } from './version-printer.factory';

export function concatUrl(...items: Array<string>) {
  return items
    .map((item) => (item.trim().endsWith('/') ? item.slice(0, -1) : item))
    .map((item) => (item.trim().startsWith('/') ? item.slice(1) : item))
    .filter((item) => !!item)
    .join('/');
}

export type CommonConfig = {
  production: boolean;
  apiRoot: string;
  baseHref: string;
  localize?: boolean;
  disableEntitlements?: boolean;
  appVersion?: string;
  calendarVersion?: string;
};

@NgModule({
  imports: [EntitlementsModule],
  providers: [
    PubSubService,
    SetLocaleService,
    {
      provide: APP_INITIALIZER,
      useFactory: versionPrinterFactory,
      multi: true,
    },
  ],
})
export class SharedAppCoreModule {
  static forRoot(config: CommonConfig): ModuleWithProviders<SharedAppCoreModule> {
    return {
      ngModule: SharedAppCoreModule,
      providers: [
        {
          provide: ENTITLEMENTS_CONFIG,
          useValue: {
            forceResolved: !!config.disableEntitlements,
            accessControlBasePath: `${config.apiRoot}/access-control`,
          },
        },
        {
          provide: BACKBASE_APP_VERSION,
          useValue: {
            calendarVersion: config.calendarVersion,
            appVersion: config.appVersion,
          },
        },
      ],
    };
  }
}
