# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2023.02]

### Added

- Update identity journeys to provide RTL support.
- `@backbase/accounts-journey` add placeholders in `CommunicationService` to configure navigations to `Statements` and `Payments`.

### Changed

- Bump `@backbase/identity-self-service-journey-ang` to version `3.0.0`
- **Identity Auth** - Issuer URLs beginning with `auth` will no longer be transformed incorrectly when the user responds to a Step Up challenge
- **Shared Auth** - All usages of `revokeTokenAndLogout` have been changed to `logOut` as the `LOGOUT` event was not being generated in the Identity Audit logs.
- Bump `@backbase/accounts-journey-ang` to version `4.22.4` and `@backbase/transactions-journey-ang` to version `4.21.0`. Disable proof of transaction / Support RTL.
- Bump `@backbase/cards-management-journey-ang` to `3.1.7`.
  - Fixed unexpected form submission on enter key press. [NVCTS-1720]
  - Fixed card limit error message formatting ignoring the currency [NVCTS-1395]
- Bump `@backbase/initiate-loans-payment-journey`,`@backbase/loans-journey-ang` and `@backbase/retail-loans-journey-ang` to fix Visibility Service injection error
- Bump `@backbase/messages-client-inbox-journey-ang` to `3.4.0`
- Removed `MessageCenter.ManageMessages.view` permission from permissions check [DLRN-4906]
- Bump `@backbase/batch-journey-ang` to version `2.3.2`
- Bump `@backbase/batch-templates-journey-ang` to version `2.3.3`
- Bump Entitlements capabilities for release 2023.02
- Bump `@backbase/initiate-payment-journey-ang` to version `2.6.4`, `@backbase/manage-payment-templates-journey-ang` to version `4.6.1`, `@backbase/manage-payments-journey-ang` to version `3.6.2`. and `@backbase/stop-checks-journey-ang` to version `3.6.1`
- Bump `@backbase/initiate-loans-payment-journey` to version `2.3.4`
- Bump `@backbase/loans-journey-ang` to version `4.4.6`
- Bump `@backbase/cash-flow-journey-ang` to version `3.3.0`
- Bump `@backbase/company-permissions-journey-ang` to version `2.10.2`

## [2023.01]

### Deprecated

- `bb-session-timeout-modal` is deprecated and will be removed in 2023.9 release. Please use `bb-activity-monitor` instead.

### Added

- Replaced usage of `bb-session-timeout-modal` with `bb-activity-monitor` fixing an issue with logouts not occurring after long inactivity when the web app is run in a background tab.

### Changed

- Bump `@backbase/notifications-ang` to `2.2.0`, `@backbase/actions-business-notification-preferences-journey-ang` to `3.6.0`, `@backbase/messages-client-inbox-journey-ang` to `3.1.0`
- Bump `@backbase/batch-journey-ang` to version `2.2.3`
- Bump `@backbase/accounts-journey-ang` to version `4.20.1`
- Bump `@backbase/transactions-journey-ang` to version `4.17.0`
- Bump `@backbase/authorized-users-journey-ang` and `@backbase/places-journey-ang` to `2.1.0` - apply nx executor for handling peer deps.
- Bump `@backbase/messages-client-inbox-journey-ang` to `3.2.0`.
- Bump `@backbase/ui-ang` to `8.9.0`.
- Bump `@backbase/initiate-payment-journey-ang` to version `2.5.0`, `@backbase/manage-payment-templates-journey-ang` to version `4.5.0`, `@backbase/manage-payments-journey-ang` to version `3.5.1`. and `@backbase/stop-checks-journey-ang` to version `3.5.0`
- **Shared Auth** - All usages of `revokeTokenAndLogout` have been changed to `logOut` as the `LOGOUT` event was not being generated in the Identity Audit logs.
- Bump `@backbase/accounts-journey-ang` to version `4.19.4` and `@backbase/transactions-journey-ang` to version `4.15.4`. Fix translation issues.

## [2022.12]

### Changed

- Change configuration of Account Statements to allow selecting multiple accounts
- fixed `approval-journey-ang` currency dropdown default configuration
- Bump `@backbase/ui-ang` to version `8.6.0-pr.11`
- Bump `@backbase/arrangement-manager-http-ang` to version `3.2.0`
- Bump `@backbase/accounts-journey-ang` to version `4.16.0`
- Bump `@backbase/transactions-journey-ang` to version `4.12.0`
- Bump `@backbase/identity-auth` to `1.4.0` - New header for transaction signing for reverse a batch
- Bump `@backbase/payment-batch-http-ang` to version `4.10.0`
- Bump `@backbase/batch-journey-ang` to version `2.2.0`
- Bump `@backbase/batch-templates-journey-ang` to version `2.2.0`
- Bump `@backbase/initiate-loans-payment-journey` to version `2.1.2`
- Bump `@backbase/loans-journey-ang` to version `4.2.2`
- Bump `@backbase/loans-http-ang` to version `1.0.0`,
- Bump `@backbase/identity-self-service-journey-ang` to version `2.2.0`
- Bump `@backbase/initiate-payment-journey-ang` to version `2.4.3`, `@backbase/manage-payment-templates-journey-ang` to version `4.4.2`, `@backbase/manage-payments-journey-ang` to version `3.4.2`. and `@backbase/stop-checks-journey-ang` to version `3.4.2`
- Bump Entitlements capabilities for release 2022.12

### Fixed

- Incorrectly placed focus for manage templates page

## [2022.11]

### Changed

- Bump `@backbase/cards-management-journey-ang` to `3.1.3` - Exposed `CardDetailsComponent`, `CardsListComponent`, `CardsTravelNoticeComponent`, `PaymentCardComponent` [MAINT-18406]
- Bump Entitlements capabilities for release 2022.11
- Bump `@backbase/account-statement-business-journey-ang` to version `3.2.0`
- Bump `@backbase/account-statements-http-ang` to version `2.3.0`
- Allow notifications to route to Account Statements Download view [CONT-754]
- Bump `@backbase/contact-journey-ang` to `2.2.0`
- Bump `@backbase/manage-pockets-journey-ang` - Fixed aria attributes not being bound to a value. [NVCTS-1281]
- Bump `@backbase/cards-management-journey-ang` - Added misssing exports to the public exportable apis. [MAINT-18406]
- `@backbase/cards-management-journey-ang`- Fixed the issue with plain texts being focusable via tab key. [NVCTS-1553]
- Bump `@backbase/loans-journey-ang` to version `4.0.5` - Fix dispay amount options on create loan payment [CME-2504]
- Bump `@backbase/initiate-loans-payment-journey` to version `2.0.6` - Fix dispay amount options on create loan payment [CME-2504]
- Bump `@backbase/ui-ang` to version `8.3.0` - fix displaying of "initiate payment" dialog [MAINT-18078]
- Bump `@backbase/actions-business-notification-preferences-journey-ang` to version `3.3.1`
- Add new ENV variable `notificationPreferencesApiMode`
- Extend config for `@backbase/actions-business-notification-preferences-journey-ang` which support `apiMode` value
- `@backbase/actions-business-notification-preferences-journey-ang` from now on responds to the `notificationPreferencesApiMode` value
- Bump `@backbase/ui-ang` to version `~8.4.0-pr.1` and `@backbase/places-journey-ang` to fix [MAINT-14722]
- Bump `@backbase/income-spending-analysis-journey-ang` to `2.1.0` - limit donut chart for one month view in spending|income analysis [NVCTS-1432]
- `@backbase/income-spending-analysis-journey-ang` - Align month-selector buttons with design-works [NVCTS-1432]
- Bump `@backbase/turnovers-journey-ang` to `2.0.1` - Align month-selector buttons with design-works [NVCTS-1432]
- Bump `@backbase/places-journey-ang` to `2.0.4` - Fix work-time UI inconsistency on tablet screen [WEB2-1737]
- Bump `@backbase/authorized-users-journey-ang` to `2.0.1` - expose assets path token [MAINT-18518]
- Bump `@backbase/accounts-journey-ang` to version `4.10.0` and `@backbase/transactions-journey-ang` to version `4.9.0`. - Update structure of `@backbase/accounts-journey-ang` shared internal packages, Add Api docs for `transactions-journey-ang`, Upkeeps and bugfixes.
- Bump `@backbase/identity-self-service-journey-ang` to `2.1.0` - Secondary addresses for address autocomplete [IDULS-1185]
- Bump `@backbase/actions-business-notification-preferences-journey-ang` to version `3.5.1`
- Bump `@backbase/notifications-ang` to version `2.1.17`
- Bump `@backbase/initiate-loans-payment-journey` to version `2.0.7`
- Bump `@backbase/loans-journey-ang` to version `4.1.0`
- Bump `@backbase/@backbase/ui-ang` to version `8.5.0-pr.8`
- Bump `@backbase/initiate-payment-journey-ang` to version `2.3.1`, `@backbase/manage-payment-templates-journey-ang` to version `4.3.1`, `@backbase/manage-payments-journey-ang` to version `3.3.1`. and `@backbase/stop-checks-journey-ang` to version `3.3.1`
- Removed explicit dependencies on `@backbase/identity-user-profile-journey-ang`, `@backbase/identity-device-management-journey-ang`, `@backbase/identity-login-security-journey-ang`, `@backbase/identity-common-ang` and imports from them, `identity-self-service-journey-ang` updated to `2.1.1`.
- Bump `@backbase/accounts-journey-ang` to version `4.15.0` and `@backbase/transactions-journey-ang` to version `4.11.0`. - Display accounts required status accounts list [PRSUM-8797], Added edit alias list view test plus visual tests for both views [PRSUM-8824].
- Bump `@backbase/contact-journey-ang` to `2.4.0` - optional account name
- Bump `@backbase/account-statement-business-journey-ang` to `3.4.1` - navigation to the new journey Manage Statements

### Fixed

- Fix header colours in My Profile journey [BUS-423]

### Added

- Add `BB_TIMEZONE_CONFIG_TOKEN` from ui-ang with the default timezone of Lisbon [BUS-348]
- Add new journey `@backbase/manage-statements-business-journey-ang` for managing account statement preferences

## [2022.10]

### Changed

- Bump Entitlements capabilities for release 2022.10
- Entitlements minor fixes for release 2022.10
- Bump `@backbase/cards-management-journey-ang` - Implemented new journey configuration named `cardPinLength`. [NVCTS-1353]
- Bump Batch Journey fixes for release 2022.10
- Bump Payments Journeys for release 2022.10 - contains bank timezone configuration for payment submit
- Bump `@backbase/loans-journey-ang` to version `4.0.3`
- Bump `@backbase/initiate-loans-payment-journey` to version `2.0.5`
- Entitlements approvals fixes for release 2022.10

### Added

- International transfers and enable wizard mode [PAYM-2006]
- Added support of International(SWIFT) Payment Templates [PAYM-2007]
- New app version display to the `bb-user-context-menu-widget` from environment variables [NOJIRA]

## [2022.09]

### Changed

- USER_CONTEXT cookie was replaced with X-User-Context header
- Bump `@backbase/initiate-payment-journey-ang`, `@backbase/manage-payment-templates-journey-ang`, `@backbase/manage-payments-journey-ang` and `@backbase/stop-checks-journey-ang` versions (Fixes the date-picker timezone issue on edit flow)
- Bump `@backbase/cards-management-journey-ang`. Fixed i18n repeated keys and removed `data-ang` dependency
- Bump `@backbase/loans-journey-ang`. Fixed (bumped) account-statement libs versions.
- Update `@backbase/identity-auth` to version `0.1.0`
- Angular update to v13.
- Bump `@backbase/places-journey-ang` - Angular v13 update + add full path to markerUrl assets.
- Bump `@backbase/account-statement-business-journey-ang`.
- Deprecated `PUBSUB` and `SET_LOCALE` replaced with services compatible with `foundation-ang` v7
- Bump `@backbase/actions-business-notification-preferences-journey-ang` to version `4.0.1`
- Bump `@backbase/messages-client-inbox-journey-ang` to version `3.0.2`
- Bump `@backbase/notifications-ang` to version `2.0.2`
- Bump `@backbase/trade-finance-journey-ang` to version `1.0.0-beta.75`
- Bump `@backbase/places-journey-ang` for a small bugfix.
- Bump Entitlements capabilities (Angular 13)
- Bump `@backbase/accounts-journey-ang` to version `3.9.0` and `@backbase/transactions-journey-ang` to version `3.9.0`.
- Bump `@backbase/initiate-payment-journey-ang` to version `2.0.0`, `@backbase/manage-payment-templates-journey-ang` to version `4.0.0`, `@backbase/manage-payments-journey-ang` to version `3.0.0`. and `@backbase/stop-checks-journey-ang` to version `3.0.0`
- Bump `@backbase/loans-journey-ang` to version `3.0.3`, `@backbase/initiate-loans-payment-journey` to version `2.0.4` and `@backbase/cash-flow-journey-ang` to version `3.1.0`.
- Bump `@backbase/arrangement-manager-http-ang` to version `2.5.0`
- Bump `@backbase/cards-management-journey-ang` - Angular 13 update and i18n bugfixes
- Bump `@backbase/accounts-journey-ang` to version `4.0.0` and `@backbase/transactions-journey-ang` to version `4.0.0`.
- Bump `@backbase/loans-journey-ang` to version `4.0.1`.
- Bump `@backbase/batch-journey-ang` to version `2.1.0`.
- Bump `@backbase/batch-templates-journey-ang` to version `2.1.0`.
- Bump `@backbase/payment-batch-http-ang` to version `4.5.1`.
- Bump `@backbase/identity-auth` to version `1.2.0`.
- Patch ranges allowed for Backbase dependencies
- Bump `@backbase/actions-business-notification-preferences-journey-ang` to version `3.1.4`
- Bump `@backbase/notifications-ang` to version `2.1.3`

### Added

- **Step Up** integrated via `@backbase/identity-auth/step-up` [IDWOJ-1241]
- **AuthEventsHandlerService** Added example version of how auth events could be handled [IDWOJ-1261]
- **AuthInterceptor** Updated implementation to align with recommendation from Identity. If an action is rejected with a 401 `invalid_token` error, attempt to refresh the user's token and replay the original request. Otherwise surface the original error. [IDWOJ-1259]
- **AuthGuard** Updated implementation to align with recommendation from Identity. If the user is not logged in, redirect them to the login flow. [IDWOJ-1260]
- Add missing BASE_PATHs to `transactions-journey-ang`
- New app version display to the `bb-user-context-menu-widget`

### Fixed

- Stop calling `initLoginFlow` after `revokeTokenAndLogout`, to prevent unwanted side-effect of cancelling `/logout` page request.
- Wrong routing of payments types ending in `_ILE` and `_CLOSED`
- Fixed `accounts-journey-ang`, `transactions-journey-ang` to read `apiKey` from an environment variable.
- `progress-tracker` aligned with ui-ang v8.
- Fixed mapping of "SEPA CT - closed" and "SEPA CT - Intracompany" business functions [PAYM-3565]

## [2022.08]

### Changed

- Update batches journeys
- Bump contacts ui package version
- Bump entitlements journeys versions
- Manage templates has no Frequency fields
- `@backbase/accounts-journey-ang` - move http clients to peer dependencies
- `@backbase/transactions-journey-ang` - move http clients to peer dependencies
- Bump entitlements journeys versions (minor fixes and removal of mock providers)
- Bump payments journeys
- Bump `@backbase/loans-journey-ang` (translations ids fix)
- Bump `@backbase/manage-payments-journey-ang` (Edit flow fix)
- Bump `@backbase/loans-journey-ang` (manual payments status fix [CME-2266])
- Bump `@backbase/manage-payments-journey-ang` (Sorting with pagination fix [PAYM-3459])
- Bump entitlements journeys versions (minor fixes)
- Bump `@backbase/identity-self-service-journey-ang` (Address autocomplete [IDULS-352])
- Bump `@backbase/identity-device-management-journey-ang` [IDULS-352]
- Downgraded `@backbase/cards-management-journey-ang` and reintroduced dependency to `data-ang`

### Added

- Changelog check + an automatic versioning
- `@backbase/initiate-loans-payment-journey` - added new dependencies to avoid breaking changes during rebuild of initiate payments journey
