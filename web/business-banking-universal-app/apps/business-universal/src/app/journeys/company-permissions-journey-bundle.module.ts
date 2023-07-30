import { NgModule } from '@angular/core';
import { ServiceAgreementCompanyPermissionCommunication } from '@backbase/business/feature/communication';
import {
  CompanyPermissionCommunicationService,
  CompanyPermissionsJourneyConfiguration,
  CompanyPermissionsJourneyConfigurationToken,
  CompanyPermissionsJourneyModule,
  COMPANY_PERMISSION_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_APPROVAL_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_CONTACT_MANAGER_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_LIMIT_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_PAYMENT_ORDER_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_USER_BASE_PATH,
  COMPANY_PERMISSION_JOURNEY_ACCESS_CONTROL_V3_BASE_PATH,
} from '@backbase/company-permissions-journey-ang';
import {
  APP_ACCESS_CONTROL_BASE_PATH,
  APP_APPROVAL_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_CONTACT_MANAGER_BASE_PATH,
  APP_LIMIT_BASE_PATH,
  APP_PAYMENT_ORDER_BASE_PATH,
  APP_USER_BASE_PATH,
  APP_ACCESS_CONTROL_V3_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [CompanyPermissionsJourneyModule.forRoot()],
  providers: [
    {
      provide: CompanyPermissionsJourneyConfigurationToken,
      useValue: {
        companyPermission: {
          notificationDismissTime: 2,
          pageSize: 10,
          enableSelfApproval: true,
          selfApprovalDefaultBehavior: 'enable',
          deElevatedHeading: true,
          displayHeading: true,
          showFindOutMoreDialog: true,
        },
        accountGroup: {
          dataGroupsType: 'ARRANGEMENTS',
        },
        jobRoles: {
          limitsRetrievalConsumptions: 100,
          approvalLevelEnabled: true,
        },
        payeeGroup: {
          dataGroupsType: 'CONTACTS',
        },
        approvalWorkflow: {
          complexBF: ['Payments', 'Batch'],
          complexBFCurrencies: [] as string[],
          enableRuleMode: false,
          quickFilterView: 'assig-pen-unassig',
        },
      } as CompanyPermissionsJourneyConfiguration,
    },
    {
      provide: CompanyPermissionCommunicationService,
      useExisting: ServiceAgreementCompanyPermissionCommunication,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_LIMIT_BASE_PATH,
      useExisting: APP_LIMIT_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_PAYMENT_ORDER_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_APPROVAL_BASE_PATH,
      useExisting: APP_APPROVAL_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_ACCESS_CONTROL_V3_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_V3_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: COMPANY_PERMISSION_JOURNEY_USER_BASE_PATH,
      useExisting: APP_USER_BASE_PATH,
    },
  ],
})
export class CompanyPermissionsJourneyBundleModule {}
