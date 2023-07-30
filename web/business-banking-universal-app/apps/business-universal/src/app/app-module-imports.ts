/*
 *
 * The content of this file can be edited freely, but to maintain upgradability
 * this file should not be renamed and should always export an array named
 * `appModuleImports`.
 *
 */

import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { StepUpModule } from '@backbase/identity-auth/step-up';
import { TransactionSigningModule } from '@backbase/identity-auth/transaction-signing';
import { AuthModule } from '@backbase/shared/feature/auth';
import { SharedAppCoreModule } from '@backbase/shared/util/app-core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { authConfig, environment } from '../environments/environment';
import { AppDataModule } from './app-data.module';
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import { RoutableModalModule } from './routable-modal/routable-modal.module';
import { UserContextModule } from './user-context/user-context.module';

/**
 * Modules in this array are added to the `imports` array of the AppModule
 * in app.module.ts.
 */
export const appModuleImports = [
  SharedAppCoreModule.forRoot(environment),
  StoreModule.forRoot({}),
  EffectsModule.forRoot([]),
  AppDataModule,
  AuthModule.forRoot(environment.apiRoot, authConfig),
  TransactionSigningModule,
  StepUpModule.withConfig({
    contactAdvisorPhoneNumber: '01234556677',
  }),
  LayoutModule,
  RoutableModalModule,
  EntitlementsModule,
  AppRoutingModule,
  UserContextModule,
];
