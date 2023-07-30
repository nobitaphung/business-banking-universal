/*
 *
 * The content of this file can be edited freely, but to maintain upgradability
 * this file should not be renamed and should always export an Angular module named
 * `AppRoutingModule`.
 *
 *
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitlementsGuard } from '@backbase/foundation-ang/entitlements';
import { AuthGuard } from '@backbase/shared/feature/auth';
import { SharedUserContextGuard } from '@backbase/shared/feature/user-context';
import { entitlementFallbacks, PERMISSIONS } from './auth/permissions';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'accounts',
  },
  {
    path: 'select-context',
    loadChildren: () => import('./user-context/user-context.module').then((m) => m.UserContextModule),
    data: {
      title: $localize`:@@context-selection.nav.item.title:Select Context`,
    },
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'accounts',
      },

      /**
       * Accounts & Cards
       */
      {
        path: 'accounts',
        loadChildren: () =>
          import('./journeys/accounts-journey-bundle.module').then((m) => m.AccountsJourneyBundleModule),
        data: {
          title: $localize`:@@accounts.nav.item.title:Accounts`,
          entitlements: PERMISSIONS.canViewAccounts,
          redirectTo: entitlementFallbacks,
        },
      },
      {
        path: 'cards',
        loadChildren: () =>
          import('./journeys/cards-management-journey-bundle.module').then((m) => m.CardsManagementJourneyBundleModule),
        data: {
          title: $localize`:@@cards.nav.item.title:Cards`,
          entitlements: PERMISSIONS.canViewCards,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'loans',
        loadChildren: () => import('./journeys/loans-journey-bundle.module').then((m) => m.LoansJourneyBundleModule),
        data: {
          title: $localize`:@@loans.nav.item.title:Loans`,
          entitlements: PERMISSIONS.canViewLoans,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'account-statements',
        loadChildren: () =>
          import('./journeys/account-statement-business-journey-bundle.module').then(
            (m) => m.AccountStatementBusinessJourneyBundleModule,
          ),
        data: {
          title: $localize`:@@account-statements.nav.item.title:Account Statements`,
          entitlements: PERMISSIONS.canViewAccountStatements,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'manage-statements',
        loadChildren: () =>
          import('./journeys/manage-statements-journey.module').then((m) => m.ManageStatementsJourneyBundleModule),
        data: {
          title: $localize`:@@manage-statements.nav.item.title:Manage Statements`,
          entitlements: PERMISSIONS.canViewManageStatements,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./journeys/transactions-journey-bundle.module').then((m) => m.TransactionsJourneyBundleModule),
        data: {
          title: $localize`:@@transactions.nav.item.title:Transactions`,
          entitlements: PERMISSIONS.canViewTransactions,
          redirectTo: 'accounts',
        },
      },

      /**
       * Move Money
       */
      {
        path: 'transfers',
        loadChildren: () =>
          import('./journeys/transfers-bundle.module').then((m) => m.ManagePaymentsJourneyBundleModule),
        data: {
          entitlements: PERMISSIONS.canViewTransfers,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'batches',
        loadChildren: () =>
          import('./journeys/batches-journey-bundle.module').then((m) => m.BatchesJourneyBundleModule),
        data: {
          entitlements: PERMISSIONS.canViewBatches,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'stop-check-payments',
        loadChildren: () => import('./journeys/stop-checks-bundle.module').then((m) => m.StopChecksJourneyBundleModule),
        data: {
          title: $localize`:@@stop-check.nav.item.title:Stop check payments`,
          entitlements: PERMISSIONS.canViewStopChecks,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'templates',
        loadChildren: () =>
          import('./journeys/payment-templates-bundle.module').then((m) => m.PaymentTemplatesJourneyBundleModule),
        data: {
          title: $localize`:@@templates.nav.item.title:Templates`,
          entitlements: PERMISSIONS.canViewPaymentTemplates,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'contacts',
        loadChildren: () => import('./journeys/contact-bundle.module').then((m) => m.ContactJourneyBundleModule),
        data: {
          entitlements: PERMISSIONS.canViewContacts,
          redirectTo: 'accounts',
        },
      },

      /**
       * Finance Management
       */
      {
        path: 'cash-flow',
        loadChildren: () =>
          import('./journeys/cash-flow-journey-bundle.module').then((m) => m.CashFlowJourneyBundleModule),
        data: {
          title: $localize`:@@cash-flow.nav.item.title:Cash Flow`,
        },
      },
      {
        path: 'sweeping',
        loadChildren: () =>
          import('./journeys/cash-management-journey-bundle.module').then((m) => m.CashManagementJourneyBundleModule),
        data: {
          title: $localize`:@@sweeping.nav.item.title:Sweeping`,
        },
      },
      {
        path: 'forex',
        loadChildren: () =>
          import('./journeys/tradingfx-journey-bundle.module').then((m) => m.TradingfxJourneyBundleModule),
      },

      {
        path: 'trade-finance',
        loadChildren: () =>
          import('./journeys/trade-finance-journey-bundle.module').then((m) => m.TradeFinanceJourneyBundleModule),
        data: {
          title: $localize`:@@trade-finance.nav.item.title:Trade Finance`,
        },
      },

      /**
       * Personal
       */
      {
        path: 'messages',
        loadChildren: () =>
          import('./journeys/messages-client-inbox-journey-bundle.module').then(
            (m) => m.MessagesClientInboxJourneyBundleModule,
          ),
      },
      {
        path: 'my-profile',
        loadChildren: () =>
          import('./journeys/my-profile/my-profile-bundle.module').then((m) => m.MyProfileBundleModule),
      },
      {
        path: 'find-atm-branch',
        loadChildren: () => import('./journeys/places-bundle.module').then((m) => m.PlacesJourneyBundleModule),
      },

      /**
       * Company Administration
       */
      {
        path: 'audit',
        loadChildren: () => import('./journeys/audit-journey-bundle.module').then((m) => m.AuditJourneyBundleModule),
        data: {
          title: $localize`:@@audit.nav.item.title:Audit`,
          entitlements: PERMISSIONS.canViewAudit,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'company-permissions',
        loadChildren: () =>
          import('./journeys/company-permissions-journey-bundle.module').then(
            (m) => m.CompanyPermissionsJourneyBundleModule,
          ),
        data: {
          entitlements: PERMISSIONS.canViewCompanyPermissions,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'service-agreements',
        loadChildren: () =>
          import('./journeys/service-agreements-journey-bundle.module').then(
            (m) => m.ServiceAgreementsJourneyBundleModule,
          ),
        data: {
          title: $localize`:@@service-agreements.nav.item.title:Service Agreements`,
          entitlements: PERMISSIONS.canViewServiceAgreements,
          redirectTo: 'accounts',
        },
      },
      {
        path: 'legal-entities',
        loadChildren: () =>
          import('./journeys/legal-entities-journey-bundle.module').then((m) => m.LegalEntitiesJourneyBundleModule),
        data: {
          title: $localize`:@@legal-entities.nav.item.title:Legal Entities`,
          entitlements: PERMISSIONS.canViewLegalEntities,
          redirectTo: 'accounts',
        },
      },
    ],
    canActivate: [AuthGuard, SharedUserContextGuard],
    canActivateChild: [EntitlementsGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'accounts',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
