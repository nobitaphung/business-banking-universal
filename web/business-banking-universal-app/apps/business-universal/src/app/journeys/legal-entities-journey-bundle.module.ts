import { NgModule } from '@angular/core';
import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import {
  LegalEntitiesJourneyConfiguration,
  LegalEntitiesJourneyConfigurationToken,
  LegalEntitiesJourneyModule,
  LEGAL_ENTITY_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  LEGAL_ENTITY_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  LEGAL_ENTITY_JOURNEY_CONTACT_MANAGER_BASE_PATH,
  LEGAL_ENTITY_JOURNEY_USER_BASE_PATH,
  LEGAL_ENTITY_JOURNEY_LIMIT_BASE_PATH,
} from '@backbase/legal-entities-journey-ang';
import {
  APP_ACCESS_CONTROL_V3_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_CONTACT_MANAGER_BASE_PATH,
  APP_LIMIT_BASE_PATH,
  APP_USER_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  declarations: [],
  imports: [LegalEntitiesJourneyModule.forRoot(), EntitlementsModule],
  providers: [
    {
      provide: LegalEntitiesJourneyConfigurationToken,
      useValue: {} as Partial<LegalEntitiesJourneyConfiguration>,
    },
    {
      provide: LEGAL_ENTITY_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_V3_BASE_PATH,
    },
    {
      provide: LEGAL_ENTITY_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: LEGAL_ENTITY_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: LEGAL_ENTITY_JOURNEY_USER_BASE_PATH,
      useExisting: APP_USER_BASE_PATH,
    },
    {
      provide: LEGAL_ENTITY_JOURNEY_LIMIT_BASE_PATH,
      useExisting: APP_LIMIT_BASE_PATH,
    },
  ],
})
export class LegalEntitiesJourneyBundleModule {}
