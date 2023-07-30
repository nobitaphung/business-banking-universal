/*
 *
 * The content of this file can be edited freely, but to maintain upgradability
 * this file should not be renamed and should always export an Angular module named
 * `AppDataModule`.
 *
 *
 */
import { InjectionToken, NgModule } from '@angular/core';
import { ACCESS_CONTROL_BASE_PATH } from '@backbase/data-ang/accesscontrol';
import { ACCESS_CONTROL_BASE_PATH as ACCESS_CONTROL_V3_BASE_PATH } from '@backbase/accesscontrol-v3-http-ang';
import { ACCOUNT_STATEMENT_BASE_PATH } from '@backbase/data-ang/account-statements';
import { ACTIONS_BASE_PATH } from '@backbase/data-ang/actions';
import { APPROVAL_BASE_PATH } from '@backbase/data-ang/approvals';
import { ARRANGEMENT_MANAGER_BASE_PATH } from '@backbase/data-ang/arrangements';
import { CARDS_BASE_PATH } from '@backbase/data-ang/cards';
import { CASH_FLOW_BASE_PATH } from '@backbase/data-ang/cash-flow';
import { CASH_MANAGEMENT_BASE_PATH } from '@backbase/data-ang/cash-management';
import { CONTACT_MANAGER_BASE_PATH } from '@backbase/data-ang/contact-manager';
import { DEVICE_BASE_PATH } from '@backbase/data-ang/device';
import { LETTER_OF_CREDIT_BASE_PATH } from '@backbase/data-ang/letter-of-credit';
import { LIMIT_BASE_PATH } from '@backbase/data-ang/limits';
import { LOANS_BASE_PATH } from '@backbase/data-ang/loans';
import { PAYMENT_ORDER_BASE_PATH } from '@backbase/data-ang/payment-order';
import { PAYMENT_ORDER_A2A_BASE_PATH } from '@backbase/data-ang/payment-order-a2a';
import { PAYMENT_ORDER_OPTIONS_BASE_PATH } from '@backbase/data-ang/payment-order-options';
import { PAYMENT_TEMPLATE_BASE_PATH } from '@backbase/data-ang/payment-template';
import { PLACES_BASE_PATH } from '@backbase/data-ang/places';
import { STOP_CHECKS_BASE_PATH } from '@backbase/data-ang/stop-checks';
import { FOREX_BASE_PATH } from '@backbase/data-ang/trading-fx';
import { TRANSACTIONS_BASE_PATH } from '@backbase/data-ang/transactions';
import { USER_BASE_PATH } from '@backbase/data-ang/user';
import { environment } from '../environments/environment';
import { IMPERSONATION_BASE_PATH } from '@backbase/data-ang/impersonation-v1';

/**
 * Service paths for the individual data modules.
 *
 * The values provided here are mapped to FactoryProviders in the AppDataModules
 * module below, using the servicePathFactory function above to create the
 * factory for each injection token.
 *
 * If for some reason you do not want to use the servicePathFactory to provide
 * the base path for a service, remove it from this array and add a separate
 * provider for it to the AppDataModules module, below.
 *
 * The entries in this array may be edited, added or removed as required, but
 * deleting or renaming the array itself may prevent future upgrades being
 * correctly applied.
 */
const dataModulePaths: [InjectionToken<string>, string][] = [
  [ACCESS_CONTROL_BASE_PATH, '/access-control'],
  [ACCESS_CONTROL_V3_BASE_PATH, '/access-control'],
  [ACCOUNT_STATEMENT_BASE_PATH, '/account-statement'],
  [ACTIONS_BASE_PATH, '/action'],
  [APPROVAL_BASE_PATH, '/approval-service'],
  [ARRANGEMENT_MANAGER_BASE_PATH, '/arrangement-manager'],
  [CARDS_BASE_PATH, '/cards-presentation-service'],
  [CASH_FLOW_BASE_PATH, '/cashflow-service'],
  [CASH_MANAGEMENT_BASE_PATH, '/cash-management-presentation-service'],
  [CONTACT_MANAGER_BASE_PATH, '/contact-manager'],
  [DEVICE_BASE_PATH, '/device-management-service'],
  [FOREX_BASE_PATH, '/tradingfx-presentation-service'],
  [LETTER_OF_CREDIT_BASE_PATH, '/letter-of-credit'],
  [LIMIT_BASE_PATH, '/limit'],
  [LOANS_BASE_PATH, '/loan'],
  [PAYMENT_ORDER_A2A_BASE_PATH, '/payment-order-a2a'],
  [PAYMENT_ORDER_BASE_PATH, '/payment-order-service'],
  [PAYMENT_ORDER_OPTIONS_BASE_PATH, '/payment-order-options'],
  [PAYMENT_TEMPLATE_BASE_PATH, '/payment-order-service'],
  [PLACES_BASE_PATH, '/places-presentation-service'],
  [STOP_CHECKS_BASE_PATH, '/stop-checks'],
  [TRANSACTIONS_BASE_PATH, '/transaction-manager'],
  [USER_BASE_PATH, '/user-manager'],
  [IMPERSONATION_BASE_PATH, '/orchestration'],
];

/**
 * This module is added to the `imports` array of the AppModule in app.module.ts.
 *
 * Service configuration may be customised by modifying the relevant
 * `*_BASE_PATH` provider token value or by adding a `ModuleWithProvider`
 * as an import to this module by calling `.forRoot` on an API module:
 *
 * ```
 * @NgModule({
 *   providers: [...],
 *   imports: [
 *     AuditApiModule.forRoot(() => new AuditConfiguration({ ... }))
 *   ]
 * })
 * export class AppDataModules {}
 * ```
 */
@NgModule({
  providers: [
    ...dataModulePaths.map(([token, servicePath]) => ({
      provide: token,
      useValue: `${environment.apiRoot}${servicePath}`,
    })),
  ],
})
export class AppDataModule {}
