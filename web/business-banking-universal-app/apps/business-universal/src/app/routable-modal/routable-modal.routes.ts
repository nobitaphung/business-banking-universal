import { Routes } from '@angular/router';
import { RoutableModalOutletName } from '@backbase/shared/feature/routable-modal';
import { PERMISSIONS } from '../auth/permissions';

export const ROUTABLE_MODAL_ROUTES: Routes = [
  {
    path: '',
    outlet: RoutableModalOutletName,
    children: [
      {
        path: 'new-transfer-sepa',
        loadChildren: () =>
          import('../journeys/new-transfer/new-transfer-sepa-bundle.module').then(
            (m) => m.NewTransferSepaJourneyBundleModule,
          ),
        data: {
          showHeader: false,
          entitlements: PERMISSIONS.canCreateSEPA,
        },
      },
      {
        path: 'edit-transfer',
        loadChildren: () =>
          import('../journeys/new-transfer/new-transfer-easy-bundle.module').then(
            (m) => m.NewTransferEasyJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'edit-payment-template',
        loadChildren: () =>
          import('../journeys/new-transfer/new-transfer-easy-bundle.module').then(
            (m) => m.NewTransferEasyJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'new-template-sepa',
        loadChildren: () =>
          import('../journeys/new-payment-template/create-sepa-template-bundle.module').then(
            (m) => m.CreateSepaTemplateJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'new-template-international-wire',
        loadChildren: () =>
          import('../journeys/new-payment-template/create-international-template-bundle.module').then(
            (m) => m.NewTemplateInternationalWireJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'new-payment-from-template',
        loadChildren: () =>
          import('../journeys/new-payment-template/new-payment-from-template-bundle.module').then(
            (m) => m.NewPaymentFromTemplateJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'new-transfer-international',
        loadChildren: () =>
          import('../journeys/new-transfer/new-transfer-international-bundle.module').then(
            (m) => m.NewTransferInternationalJourneyBundleModule,
          ),
        data: {
          showHeader: false,
          entitlements: PERMISSIONS.canCreateInternational,
        },
      },
      {
        path: 'new-transfer-easy',
        loadChildren: () =>
          import('../journeys/new-transfer/new-transfer-easy-bundle.module').then(
            (m) => m.NewTransferEasyJourneyBundleModule,
          ),
        data: {
          showHeader: false,
          entitlements: PERMISSIONS.canCreateUniversalWizard,
        },
      },
      {
        path: 'loans-advance',
        loadChildren: () =>
          import('../journeys/loan-payments/new-loans-advance-bundle.module').then(
            (m) => m.NewLoansAdvanceJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
      {
        path: 'loans-payment',
        loadChildren: () =>
          import('../journeys/loan-payments/new-loans-payment-bundle.module').then(
            (m) => m.NewLoansPaymentJourneyBundleModule,
          ),
        data: {
          showHeader: false,
        },
      },
    ],
  },
];
