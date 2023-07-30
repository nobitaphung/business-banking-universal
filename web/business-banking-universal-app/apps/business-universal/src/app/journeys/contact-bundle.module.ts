import { NgModule } from '@angular/core';
import {
  BB_CONTACT_BANK_ACCOUNT_TYPES_LIST,
  BB_CONTACT_IBAN_COUNTRIES_LIST,
  ContactJourneyModule,
  CONTACTS_JOURNEY_APPROVAL_BASE_PATH,
  CONTACTS_JOURNEY_CONTACT_MANAGER_BASE_PATH,
} from '@backbase/contact-journey-ang';
import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { APP_APPROVAL_BASE_PATH, APP_CONTACT_MANAGER_BASE_PATH } from '../service-paths.module';

export const CONTACT_ACCOUNT_TYPE = [
  $localize`:@@contact-create-account-type-list-us.saving:Savings`,
  $localize`:@@contact-create-account-type-list-us.checking:Checking`,
];

@NgModule({
  imports: [EntitlementsModule, ContactJourneyModule.forRoot()],
  providers: [
    {
      provide: BB_CONTACT_IBAN_COUNTRIES_LIST,
      useValue: {},
    },
    {
      provide: BB_CONTACT_BANK_ACCOUNT_TYPES_LIST,
      useValue: CONTACT_ACCOUNT_TYPE,
    },
    {
      provide: CONTACTS_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: CONTACTS_JOURNEY_APPROVAL_BASE_PATH,
      useExisting: APP_APPROVAL_BASE_PATH,
    },
  ],
})
export class ContactJourneyBundleModule {}
