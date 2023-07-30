import { ResolveEntitlements } from '@backbase/foundation-ang/entitlements';

export const canViewManageNotifications =
  'CommunicationPreferences.GeneralNotificationPreferences.view AND CommunicationPreferences.GeneralNotificationPreferences.create AND CommunicationPreferences.GeneralNotificationPreferences.edit';

export const PERMISSIONS = {
  canCreateACHCreditTransfer: 'Payments.ACHCreditTransfer.create',
  canCreateA2A: 'Payments.A2ATransfer.create',
  canCreateDomesticWire: 'Payments.USDomesticWire.create',
  canCreateInternational: 'Payments.USForeignWire.create',
  canCreateSEPA: 'Payments.SEPACT.create OR Payments.SEPACT-closed.create OR Payments.SEPACT-Intracompany.create',
  canCreateWire: 'Payments.USDomesticWire.create OR Payments.USForeignWire.create',
  canCreateUniversalWizard:
    'Payments.SEPACT.create OR Payments.SEPACT-closed.create OR Payments.SEPACT-Intracompany.create OR Payments.USForeignWire.create',
  canViewAccounts: 'ProductSummary.ProductSummary.view OR ProductSummary.ProductSummaryLimitedView.view',
  canViewAudit: 'Audit.Audit.view',
  canViewAccountStatements: 'AccountStatements.ManageStatements.view',
  canViewManageStatements: 'AccountStatements.ManageStatements.view AND AccountStatements.ManageStatements.edit',
  canViewBatches: 'Batch.Batch-IntracompanyPayments.view OR Batch.Batch-ACHCredit.view OR Batch.Batch-ACHDebit.view',
  canViewCards:
    'ProductSummary.ProductSummary.view OR ProductSummary.ProductSummaryLimitedView.view OR ' +
    'AccountStatements.ManageStatements.view OR Transactions.Transactions.view',
  canViewContacts: 'Contacts.Contacts.view OR Contacts.Contacts.create',
  canViewLegalEntities: 'ServiceAgreement.ManageServiceAgreements.view',
  canViewLoans: 'ProductSummary.ProductSummary.view OR ProductSummary.ProductSummaryLimitedView.view',
  canViewCompanyPermissions:
    'ServiceAgreement.AssignPermissions.view OR Entitlements.ManageFunctionGroups.view OR ' +
    'Entitlements.ManageDataGroups.view OR Approvals.AssignApprovalPolicies.view',
  canViewPaymentTemplates: 'Payments.PaymentTemplates.view OR Batch.BatchTemplates.view',
  canViewServiceAgreements: 'ServiceAgreement.ManageServiceAgreements.view',
  canViewStopChecks: 'Payments.StopChecks.view',
  canViewTransactions: 'Transactions.Transactions.view',
  canViewTransfers:
    'Payments.SEPACT.view OR Payments.SEPACT-closed.view OR Payments.SEPACT-Intracompany.view OR Payments.USForeignWire.view',
  canViewAccountsAndCards:
    'ProductSummary.ProductSummary.view OR ProductSummary.ProductSummaryLimitedView.view OR AccountStatements.ManageStatements.view OR Transactions.Transactions.view',
  canViewMoveMoney:
    'Payments.SEPACT.view OR Payments.SEPACT-closed.view OR Payments.SEPACT-Intracompany.view OR Batch.Batch-SEPACT.view OR Payments.StopChecks.view OR Contacts.Contacts.view OR Contacts.Contacts.create OR Payments.PaymentTemplates.view',
  canViewCompanyAdministration:
    'Audit.Audit.view OR ServiceAgreement.AssignPermissions.view OR Entitlements.ManageFunctionGroups.view OR Entitlements.ManageDataGroups.view OR Approvals.AssignApprovalPolicies.view OR ServiceAgreement.ManageServiceAgreements.view OR Limits.ManageGlobalLimits.view',
};

export const entitlementFallbacks = async (resolveEntitlements: ResolveEntitlements) => {
  if (await resolveEntitlements(PERMISSIONS.canViewCards)) return 'cards';
  if (await resolveEntitlements(PERMISSIONS.canViewLoans)) return 'loans';
  if (await resolveEntitlements(PERMISSIONS.canViewAccountStatements)) return 'account-statements';
  if (await resolveEntitlements(PERMISSIONS.canViewTransactions)) return 'transactions';
  if (await resolveEntitlements(PERMISSIONS.canViewTransfers)) return 'transfers';
  if (await resolveEntitlements(PERMISSIONS.canViewBatches)) return 'batches';
  if (await resolveEntitlements(PERMISSIONS.canViewStopChecks)) return 'stop-check-payments';
  if (await resolveEntitlements(PERMISSIONS.canViewPaymentTemplates)) return 'templates';
  if (await resolveEntitlements(PERMISSIONS.canViewAudit)) return 'audit';
  if (await resolveEntitlements(PERMISSIONS.canViewCompanyPermissions)) return 'company-permissions';
  if (await resolveEntitlements(PERMISSIONS.canViewServiceAgreements)) return 'service-agreements';
  if (await resolveEntitlements(PERMISSIONS.canViewLegalEntities)) return 'legal-entities';

  return 'error'; // TODO: we should add error page in case the user doesnt have any permissions
};
