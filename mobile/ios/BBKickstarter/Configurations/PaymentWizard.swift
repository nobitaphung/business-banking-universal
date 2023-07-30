//
//  Created by Backbase R&D B.V. on 18/05/2021.
//

import BusinessOmniPaymentsJourney
import BackbaseDesignSystem
import FlagKit
import UIKit
import BusinessJourneyCommon
import Resolver
import Backbase

// MARK: - PaymentWizard configuration object

// swiftlint:disable file_length
extension JourneysConfiguration.OmniPaymentsConfiguration {

    public static let paymentWizard: OmniPayments.Business.Configuration.Payment = {
        let paymentWizardSupport = PaymentWizardSupport()

        var wildcard = BankCodeLabelUtil.wildcard

        let bankCodesMapping: [Pair: String] = [
            Pair("AU", "bsb"): localized("omnipayments.paymentWizard.bankCodes.bsb")(),
            Pair(wildcard, "routing-number"): localized("omnipayments.paymentWizard.bankCodes.routingNumber.CA")(),
            Pair("GB", "sort-code"): localized("omnipayments.paymentWizard.bankCodes.sortCode")(),
            Pair("GB", "clearing"): localized("omnipayments.paymentWizard.bankCodes.clearing")(),
            Pair("IN", "ifsc"): localized("omnipayments.paymentWizard.bankCodes.ifsc")(),
            Pair("RU", "bik"): localized("omnipayments.paymentWizard.bankCodes.bik")(),
            Pair("US", "routing-number"): localized("omnipayments.paymentWizard.bankCodes.routingNumber.USA")(),
            Pair("ZA", "za-code"): localized("omnipayments.paymentWizard.bankCodes.zaCode")()
        ]

        var paymentWizard = OmniPayments.Business.Configuration.Payment()

        paymentWizard.title = localized("omniPayments.paymentWizard.title")()
        paymentWizard.subtitle = localized("omniPayments.paymentWizard.subtitle")()
        paymentWizard.icon = UIImage.named(DesignSystem.Assets.icAddCircleOutline, in: .design) ?? UIImage()

        paymentWizard.configuration = {
            enum Steps: Int {
                case fromAccounts = 0
                case toAccounts
                case editBeneficiary
                case paymentDetails
                case paymentOptions
                case paymentTypeSpecifics
                case paymentReview
            }

            var config = OmniPayments.Configuration()
            config.confirmationResult.uiDataMapper.shouldResolveImageWithIconName = true
            config.shouldPreloadSanctionedCountries = true
            
            let validators = Validators()
            config.steps = [{
                var accountsStep = Step()
                accountsStep.title = localized("omniPayments.paymentWizard.steps.fromStep.title")()
                accountsStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.fromAccount.rawValue }
                accountsStep.layoutBuilder = { model in
                    let listLayout = AccountsStepLayout()
                    var accountParameters = AccountsStepLayout.Configuration.AccountFetchParams(
                        businessFunction: PaymentWizardSupport.Constants.businessFunction,
                        resourceName: PaymentWizardSupport.Constants.resourceName,
                        privilege: PaymentWizardSupport.Constants.privilege,
                        accountType: .debit)
                    listLayout.configuration.accountFetchParams = accountParameters

                    return listLayout
                }

                accountsStep.didInitiate = { (navigation, paymentModel) in
                    return AccountsStep.build(with: accountsStep,
                                              omnipaymentsNavigation: navigation,
                                              paymentModel: paymentModel)
                }

                accountsStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let nextStep = config.steps[Steps.toAccounts.rawValue]

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return accountsStep
            }(), {

                var toStep = Step()
                toStep.title = localized("omniPayments.domestic.steps.toStep.title")()
                toStep.analyticsLabel = { _ in
                    OmniPayments.ObservabilityTracking.Screen.toAccount.rawValue }
                toStep.layoutBuilder = { paymentModel in

                    var accountParameters = TabbedAccountsListLayout.AccountFetchParams(
                        businessFunction: PaymentWizardSupport.Constants.businessFunction,
                        resourceName: PaymentWizardSupport.Constants.resourceName,
                        privilege: PaymentWizardSupport.Constants.privilege,
                        accountType: .credit)

                    let listLayout = BeneficiarySelectionStepLayout()
                    listLayout.configuration.accountsStepLayout.configuration.strings.emptyResultTitle = localized("omniPayments.paymentWizard.ToAccountScreen.error.title")
                    listLayout.configuration.accountsStepLayout.configuration.strings.emptyResultMessage = localized("omniPayments.paymentWizard.ToAccountScreen.error.description")
                    listLayout.configuration.accountsStepLayout.configuration.accountFetchParams = accountParameters
                    listLayout.configuration.contactsStepLayout.configuration.listButton = (isVisible: false, onClick: { _,_ in })

                    listLayout.configuration.contactsStepLayout.configuration.strings.listButtonText = localized("omniPayments.international.contactsList.listButtonText")()
                    listLayout.configuration.contactsStepLayout.configuration.images.listButtonImage = UIImage(named: DesignSystem.Assets.icPersonAdd,
                                                                             in: .design,
                                                                             compatibleWith: nil)
                    listLayout.configuration.contactsStepLayout.configuration.listButton = (isVisible: true, onClick: { omnipaymentsNavigation, viewController in
                        //Navigate to beneficiary screen
                        let nextStep = config.steps[Steps.editBeneficiary.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(omnipaymentsNavigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    })
                    
                    return listLayout
                }

                toStep.didInitiate = { (navigation, paymentModel) in
                    return BeneficiarySelectionStep.build(with: toStep,
                                                          omnipaymentsNavigation: navigation,
                                                          paymentModel: paymentModel)
                }

                toStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in

                    var nextStep = config.steps[Steps.paymentDetails.rawValue]

                    PaymentWizardSupport.setDefaultCountryAsRecipient(from: paymentModel)

                    if PaymentWizardSupport.shouldPresentEditBeneficiaryScreen(using: paymentModel,
                                                                               mandatoryExtraFields: .init()) {
                        nextStep = config.steps[Steps.editBeneficiary.rawValue]
                    } else {
                        if let countryCode = paymentModel.toAccount.accountBank?.postalAddress?.country,
                           let country = paymentModel.sanctionedCountries.first(where: { $0.country == countryCode }) {
                            paymentModel.toAccount.country = country
                        }
                    }

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return toStep
            }(), {
                var beneficiaryStep = Step()
                beneficiaryStep.title = localized("omniPayments.beneficiary.title")()
                beneficiaryStep.prefersLargeTitles = false

                beneficiaryStep.analyticsLabel = { paymentModel in
                    
                    if paymentModel.toAccount.isNew {
                        return OmniPayments.ObservabilityTracking.Screen.newBeneficiary.rawValue
                    } else {
                        return OmniPayments.ObservabilityTracking.Screen.editBeneficiary.rawValue
                    }
                }
                
                beneficiaryStep.layoutBuilder = { paymentModel in
                    
                    var fieldMapping : [String: UIView] = [:]
                    let initials = paymentModel.toAccount.initials

                    // Avatar field
                    let avatar = AvatarView.build(initials: initials)

                    // Name field
                    let nameLabel = localized("omniPayments.paymentWizard.beneficiary.accountName")()
                    let nameField =  InlineTextInput.build(
                        primaryLabel: nameLabel,
                        secondaryLabel: nil,
                        initialInput: paymentModel.toAccount.contactName,
                        onValidatedInput: { newValue in
                            let trimmedValue = newValue.trimmingCharacters(in: .whitespacesAndNewlines)
                            if paymentModel.toAccount.isOwnAccount {
                                paymentModel.toAccount.accountName = trimmedValue
                            } else {
                                paymentModel.toAccount.contactName = trimmedValue
                            }
                        },
                        didInputChange: { text in
                            avatar.initials = text
                        },
                        focusLostValidators: [Validators.requiredValidator(for: nameLabel)],
                        submitValidators: [Validators.requiredValidator(for: nameLabel)])

                    // Account name field
                    let accountNameLabel = localized("omniPayments.beneficiary.accountInfo")()
                    let accountNameMargin = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)


                    var conf = Text.Configuration()

                    conf.design.text = { label in
                        label.textColor = DesignSystem.shared.colors.text.default
                        label.font = DesignSystem.shared.fonts.preferredFont(.title2, .semibold)
                    }

                    let accountName = Text.build(textValue: accountNameLabel,
                                                 configuration: conf,
                                                 margin: accountNameMargin)

                    // Account number field
                    let accountNumberLabel = localized("omniPayments.paymentWizard.beneficiary.accountNumber")()

                    let accountNumberValidators = [Validators.nonEmptyRegexValidator(
                                                    for: accountNumberLabel,
                                                    with: paymentModel.accountNumberRegexPattern)]

                    let accountNumberField =  InlineTextInput.build(
                        primaryLabel: accountNumberLabel,
                        secondaryLabel: nil,
                        initialInput: paymentModel.toAccount.accountNumber,
                        onValidatedInput: { accountNumber in
                            let accountFormat = paymentModel
                                .firstMatching(field: PaymentWizardSupport.Constants.accountNumberKey)?
                                .format ?? "BBAN"

                            if accountFormat == "BBAN" {
                                paymentModel.toAccount.bban = accountNumber
                                paymentModel.toAccount.iban = ""
                            } else {
                                paymentModel.toAccount.iban = accountNumber
                                paymentModel.toAccount.bban = ""
                            }
                        },
                        focusLostValidators: accountNumberValidators,
                        submitValidators: accountNumberValidators)

                    // Bank branch code field
                    let bankBranchCodeField =  InlineTextInput.build(
                        primaryLabel: "",
                        secondaryLabel: nil,
                        initialInput: paymentModel.toAccount.bankCode,
                        onValidatedInput: { bankBranchCode in
                            paymentModel.toAccount.bankCode = bankBranchCode

                            paymentModel.toAccount.createAccountBankIfNeeded()
                            
                            paymentModel.toAccount.accountBank?.bankBranchCode = bankBranchCode.isEmpty ? nil : bankBranchCode
                        },
                        focusLostValidators: [],
                        submitValidators: [],
                        shouldBeVisible: { false })

                    // Extra beneficiary details

                    let isExtraFieldsInitialyVisible = PaymentWizardSupport.shouldDisplayExtraBeneficiaryDetails(paymentModel: paymentModel)

                    // Swift/BIC code field
                    let swiftCodeTitle = localized("omniPayments.paymentWizard.bankCodes.swiftBicCode")()

                    // Change this to update validators for Swift/BIC field in order to make it mandatory for example
                    func swiftCodeValidators(isHidden: Bool) -> [(String) -> (ValidationResult)] {
                        isHidden
                        ? []
                        : [Validators.nonEmptyRegexValidator(for: swiftCodeTitle,
                                                             with: Constants.swiftBICRegex)]
                    }

                    let swiftCodeField = InlineTextInput.build(
                        primaryLabel: swiftCodeTitle,
                        secondaryLabel: nil,
                        initialInput: paymentModel.toAccount.accountBank?.bic,
                        onValidatedInput: { swiftBIC in
                            paymentModel.toAccount.createAccountBankIfNeeded()
                            paymentModel.toAccount.accountBank?.bic = swiftBIC
                        },
                        focusLostValidators: swiftCodeValidators(isHidden: !isExtraFieldsInitialyVisible),
                        submitValidators: swiftCodeValidators(isHidden: !isExtraFieldsInitialyVisible))

                    // Bank name field

                    let bankNameLabel = localized("omniPayments.paymentWizard.beneficiary.bankName")()
                    let bankNameSecondaryLabel = localized("omniPayments.paymentWizard.beneficiary.bankNameSecondaryTitle")()

                    // Change this to update validators for name field in order to make it mandatory for example
                    func bankNameValidators() -> [(String) -> (ValidationResult)] {
                        return []
                    }

                    let bankNameField = InlineTextInput.build(
                        primaryLabel: bankNameLabel,
                        secondaryLabel: bankNameSecondaryLabel,
                        initialInput: paymentModel.toAccount.accountBank?.name,
                        onValidatedInput: { name in
                            paymentModel.toAccount.createAccountBankIfNeeded()
                            paymentModel.toAccount.accountBank?.name = name
                        },
                        focusLostValidators: bankNameValidators(),
                        submitValidators: bankNameValidators())

                    // Initial visibility state for extra dynamic field
                    swiftCodeField.isHidden = !isExtraFieldsInitialyVisible

                    // Sanctioned Countries Picker field
                    let countryNameHandler: (String) -> (String?) = {
                        Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
                    }
                    let countryFlagHandler: (String) -> (UIImage?) = { Flag(countryCode: $0)?.originalImage }

                    let sanctionedPickerConfiguration = SanctionedCountriesPicker.ConfigurationV2()

                    let countryRequiredValidator: (String) -> (ValidationResult) = { textValue in
                        let label = sanctionedPickerConfiguration.strings.label.value
                        guard textValue.isEmpty else {
                            return ValidationResult(isValid: true)
                        }

                        let errorMessage = localized("omniPayments.requirementErrorLabel")()
                        let formattedErrorMessage = String(format: errorMessage,
                                                           locale: Locale.current, label)
                        return ValidationResult(isValid: false, errorMessage: formattedErrorMessage)
                    }

                    let countrySupportedValidator: (String) -> (ValidationResult) = { textValue in
                        let isSupported = paymentModel.sanctionedCountries.contains(where: {
                            return countryNameHandler($0.code) == textValue
                        })

                        guard isSupported else {
                            let errorMessage = localized("omniPayments.paymentWizard.beneficiary.unsupportedCountryErrorLabel")()
                            let formattedErrorMessage = String(format: errorMessage,
                                                               locale: Locale.current,
                                                               textValue)

                            return ValidationResult(isValid: false, errorMessage: formattedErrorMessage)
                        }

                        return ValidationResult(isValid: true)
                    }

                    let sanctionedCountriesPicker = SanctionedCountriesPicker.build(
                        configuration: sanctionedPickerConfiguration,
                        isEnabled: { true },
                        initialValue: {
                            var country = paymentModel.toAccount.sanctionedCountry
                            country?.imageHandler = countryFlagHandler
                            country?.titleHandler = countryNameHandler
                            return country
                        },
                        isSearchEnabled: { true },
                        countryNameHandler: countryNameHandler,
                        countryFlagHandler: countryFlagHandler,
                        didSelectCountry: { country in
                            paymentModel.toAccount.country = country

                            PaymentWizardSupport.willUpdateAccountNumber(
                                with: country.code,
                                paymentModel: paymentModel,
                                fieldMapping: fieldMapping,
                                label: accountNumberLabel)

                            PaymentWizardSupport.willUpdateBankCode(
                                with: country.code,
                                paymentModel: paymentModel,
                                fieldMapping: fieldMapping,
                                pairs: bankCodesMapping)

                            let isExtraFieldsHidden = !PaymentWizardSupport.shouldDisplayExtraBeneficiaryDetails(paymentModel: paymentModel)
                            swiftCodeField.isHidden = isExtraFieldsHidden
                            (swiftCodeField as? InlineTextInputView)?.updateValidators(
                                submitValidators: swiftCodeValidators(isHidden: isExtraFieldsHidden),
                                focusLostValidators: swiftCodeValidators(isHidden: isExtraFieldsHidden))
                        },
                        didFetchCountries: { countries in
                            paymentModel.sanctionedCountries = countries
                        },
                        submitValidators: [countryRequiredValidator, countrySupportedValidator],
                        margin: UIEdgeInsets(top: 32, left: 16, bottom: 8, right: 16))

                    fieldMapping[PaymentWizardSupport.Constants.accountBankCodeKey] = bankBranchCodeField
                    fieldMapping[PaymentWizardSupport.Constants.accountNumberKey] = accountNumberField

                    let stackView = StackStepLayout()
                    stackView.configuration.fields = [avatar,
                                                      sanctionedCountriesPicker,
                                                      nameField,
                                                      accountName,
                                                      accountNumberField,
                                                      bankBranchCodeField,
                                                      swiftCodeField,
                                                      bankNameField]

                    // Shows initial error if contact uses not supported country
                    if let country = paymentModel.toAccount.accountBank?.postalAddress?.country,
                       !PaymentWizardSupport.isCountrySupported(paymentModel: paymentModel, countryISO: country) {
                        _ = (sanctionedCountriesPicker as? ValidatableField)?.validate()
                    }

                    // Update bank code and account number fields with bank country code selection
                    if let countryCode = paymentModel.toAccount.bankCountryIsoCode {
                        PaymentWizardSupport.willUpdateAccountNumber(
                            with: countryCode,
                            paymentModel: paymentModel,
                            fieldMapping: fieldMapping,
                            label: accountNumberLabel)

                        PaymentWizardSupport.willUpdateBankCode(
                            with: countryCode,
                            paymentModel: paymentModel,
                            fieldMapping: fieldMapping,
                            pairs: bankCodesMapping)
                    } else {
                        paymentModel.toAccount.accountBank = .init()
                    }

                    return stackView
                }

                beneficiaryStep.didInitiate = { (navigation, paymentModel) in
                    let isNewContact = paymentModel.toAccount.accountName.isEmpty && paymentModel.toAccount.contactName.isEmpty

                    return StackStep.build(with: beneficiaryStep,
                                           omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel,
                                           shouldValidateFieldsWhenInitialised: !isNewContact)
                }

                beneficiaryStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let nextStep = config.steps[Steps.paymentDetails.rawValue]

                    if !PaymentWizardSupport.shouldDisplayBankCodeField(paymentModel: paymentModel) {
                        paymentModel.toAccount.bankCode = ""
                    }

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return beneficiaryStep
            }(), {
                var beneficiaryDetails = Step()
                beneficiaryDetails.title = localized("omniPayments.paymentWizard.beneficiary.title")()
                beneficiaryDetails.prefersLargeTitles = false
                beneficiaryDetails.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.transferDetails.rawValue }
                beneficiaryDetails.layoutBuilder = { paymentModel in
                    let stackView = StackStepLayout()

                    var fromIcon: DetailedTransferAccountPreview.AccountImage? = nil

                    if let image = UIImage(named: DesignSystem.Assets.icCreditCard,
                                       in: .design,
                                       compatibleWith: nil) {
                        fromIcon = .icon(image)
                    }

                    let fromAccount = DetailedTransferAccountPreview.FromAccountViewData(
                        name: paymentModel.fromAccount.displayName,
                        accountNumber: paymentModel.fromAccount.getAvailableAccountNumber(),
                        amount: paymentModel.fromAccount.availableFunds,
                        avatar: fromIcon)

                    let accountNameInitials = paymentModel.toAccount.initials ?? ""
                    var toIcon: DetailedTransferAccountPreview.AccountImage? = .initials(accountNameInitials)

                    var defaultOwnAccountCountryCode = paymentModel.sanctionedCountries
                        .first { $0.isDefault == true }?
                        .code

                    var countryCode = paymentModel.toAccount.bankCountryIsoCode
                    if paymentModel.toAccount.isOwnAccount {
                        countryCode = defaultOwnAccountCountryCode
                        toIcon = fromIcon
                    }

                    let toAccount = DetailedTransferAccountPreview.ToAccountViewData(
                        name: paymentModel.toAccount.displayName,
                        accountNumber: paymentModel.toAccount.getAvailableAccountNumber(),
                        amount: paymentModel.toAccount.availableFunds,
                        countryISOCode: countryCode,
                        avatar: toIcon)

                    var configuration = DetailedTransferAccountPreview.Configuration()

                    let countryNameHandler: (String) -> (String?) = {
                        Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
                    }

                    let countryFlagHandler: (String) -> (UIImage?) = {
                        Flag(countryCode: $0)?.originalImage
                    }

                    configuration.countryImageHandler = countryFlagHandler
                    configuration.countryNameHandler = countryNameHandler
                    configuration.design.margin = .init(top: DesignSystem.shared.spacer.md,
                                                        left: 0,
                                                        bottom: DesignSystem.shared.spacer.sm,
                                                        right: 0)

                    let transferAccountPreview = DetailedTransferAccountPreview.build(
                        fromAccount: fromAccount,
                        toAccount: toAccount,
                        configuration: configuration)

                    var amountConfiguration = AdaptiveAmount.Configuration()

                    amountConfiguration.design.margin = .init(
                        top: DesignSystem.shared.spacer.md,
                        left: DesignSystem.shared.spacer.md,
                        bottom: DesignSystem.shared.spacer.md,
                        right: DesignSystem.shared.spacer.md
                    )
                    
                    let currencyNameHandler: (String) -> (String?) = { code in
                        Locale.autoupdatingCurrent.localizedString(forCurrencyCode: code)
                    }

                    let currencyImageHandler: (String) -> (UIImage?) = { code in
                        Flag(countryCode: String(code.prefix(2)))?.originalImage
                    }

                    func amountValidator(_ amount: String) -> ValidationResult {
                        let decimalNumber = NSDecimalNumber(string: amount,
                                                            locale: Locale.autoupdatingCurrent)
                        guard !decimalNumber.decimalValue.isNaN, decimalNumber.doubleValue > 0 else {
                            return .init(isValid: false, errorMessage: amountConfiguration.strings.amountRequiredErrorLabel())
                        }

                        return .init(isValid: true)
                    }

                    let amountView = AdaptiveAmount.build(paymentModel: paymentModel,
                                                          configuration: amountConfiguration,
                                                          didSelectCurrency: { _ in },
                                                          currencyNameHandler: currencyNameHandler,
                                                          currencyImageHandler: currencyImageHandler,
                                                          didValidateInput: { amount, currencyCode, exchangeRate in
                        paymentModel.amount = amount
                        paymentModel.toAccount.currencyCode = currencyCode
                        paymentModel.exchangeRate = exchangeRate
                    },
                                                          submitValidators: [amountValidator])

                    var scheduleConfig = TransferScheduleInputPreview.Configuration()
                    scheduleConfig.scheduleLayoutStyle = .card
                    let transferScheduleInputPreviewView = TransferScheduleInputPreview.build(
                        configuration: scheduleConfig,
                        schedule: .today,
                        didSelectSchedule: { executionSchedule in
                            paymentModel.executionSchedule = executionSchedule
                        })

                    var paymentDescriptionConfig = TransferTextInputPreview.Configuration()
                    paymentDescriptionConfig.textInputLayoutStyle = .card
                    paymentDescriptionConfig.strings.previewSubtitle = localized("omniPayments.stack.views.paymentDescription.optional")()
                    let messageComposerCardView = TransferTextInputPreview.build(
                        textType: .description,
                        paymentModel: paymentModel,
                        configuration: paymentDescriptionConfig,
                        allowedCharacters: try? NSRegularExpression(pattern: Constants.paymentDescriptionAllowedCharacters),
                        didTextValueChangeHandler: { text in
                            paymentModel.description = text
                        },
                        maxInputLength: Constants.paymentDescriptionCharacterLimit)

                    stackView.configuration.fields = [
                        transferAccountPreview,
                        amountView,
                        transferScheduleInputPreviewView,
                        messageComposerCardView]
                    return stackView
                }

                beneficiaryDetails.didInitiate = { (navigation, paymentModel) in
                    return StackStep.build(with: beneficiaryDetails,
                                           omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel)
                }

                beneficiaryDetails.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let loadingView = viewController as? LoadingViewProtocol

                    loadingView?.showLoadingView()
                    PaymentWizardSupport.handleBeneficiaryStepOutput(navigation: navigation,
                                                                     paymentModel: paymentModel) { showPaymentOptionsStep in
                        loadingView?.hideLoadingView()

                        let nextStep: Step

                        if showPaymentOptionsStep {
                            nextStep = config.steps[Steps.paymentOptions.rawValue]
                        } else if PaymentWizardSupport.shouldDisplayInternationalScreen(using: paymentModel) {
                            nextStep = config.steps[Steps.paymentTypeSpecifics.rawValue]
                        } else {
                            nextStep = config.steps[Steps.paymentReview.rawValue]

                            PaymentWizardSupport.showReviewStep(step: nextStep,
                                                                navigation: navigation,
                                                                paymentModel: paymentModel,
                                                                viewController: viewController)

                            return
                        }

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(navigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    }
                }

                return beneficiaryDetails
            }(), {
                var paymentOptionStep = Step()
                paymentOptionStep.title = localized("omniPayments.paymentWizard.paymentOptions.title")()
                paymentOptionStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.paymentOptions.rawValue }
                paymentOptionStep.prefersLargeTitles = false

                paymentOptionStep.layoutBuilder = { paymentModel in
                    var configuration = PaymentOptionsLayout.Configuration()

                    configuration.errorState = { error in
                        var errorStateView = PaymentOptionsLayout.ErrorViewState()
                        errorStateView.configuration.strings.title = localized("omniPayments.paymentWizard.paymentOptions.errorTitle")()
                        errorStateView.configuration.strings.description = localized("omniPayments.paymentWizard.paymentOptions.errorDescription")()
                        errorStateView.configuration.strings.primaryButtonTitle = localized("omniPayments.paymentWizard.paymentOptions.retry")()

                        if case .notConnected = error {
                            errorStateView.configuration.strings.title = localized("omniPayments.paymentWizard.paymentOptions.noInternetErrorTitle")()
                            errorStateView.configuration.strings.description = localized("omniPayments.paymentWizard.paymentOptions.noInternetErrorMessage")()
                        }

                        return errorStateView
                    }

                    configuration.chargeBearer.options = [
                        "OUR": SingleChoiceModel(
                                id: "OUR",
                                title: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.our.title")(),
                                description: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.our.desc")()
                        ),
                        "BEN": SingleChoiceModel(
                                id: "BEN",
                                title: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.ben.title")(),
                                description: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.ben.desc")()
                        ),
                        "SHA": SingleChoiceModel(
                                id: "SHA",
                                title: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.sha.title")(),
                                description: localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.sha.desc")()
                        )
                    ]

                    return PaymentOptionsLayout(configuration: configuration)
                }

                paymentOptionStep.didInitiate = { (navigation, paymentModel) in
                    PaymentOptionsStep.build(with: paymentOptionStep,
                                             omnipaymentsNavigation: navigation,
                                             paymentModel: paymentModel)
                }

                paymentOptionStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    if PaymentWizardSupport.shouldDisplayInternationalScreen(using: paymentModel) {
                        let nextStep = config.steps[Steps.paymentTypeSpecifics.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(navigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    } else {
                        PaymentWizardSupport.showReviewStep(
                            step: config.steps[Steps.paymentReview.rawValue],
                            navigation: navigation,
                            paymentModel: paymentModel,
                            viewController: viewController)
                    }
                }

                return paymentOptionStep
            }(), {
                var internationalStep = Step()
                internationalStep.title = localized("omniPayments.international.title")()
                internationalStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.international.rawValue }
                internationalStep.prefersLargeTitles = false

                internationalStep.layoutBuilder = { paymentModel in
                    let stepLayout = StackStepLayout()

                    let paymentPurpose = PaymentPurpose.build(
                        configuration: .init(),
                        paymentModel: paymentModel,
                        didChangeMessageText: { text in
                            paymentModel.messageToBank = text
                        },
                        didChangePurposeOfPayment: { purposeOfPayment in
                            paymentModel.purposeOfPayment = purposeOfPayment
                        })

                    var config = PaymentRoutingPreview.Configuration()
                    config.design.descriptionLabel = { label in
                        label.font = DesignSystem.shared.fonts.preferredFont(.subheadline, .regular)
                    }
                    let paymentRouting = PaymentRoutingProvider.build(
                        configuration: config,
                        didUpdateCorrespondentBank: { correspondentBank in
                            paymentModel.correspondentBank = correspondentBank
                        },
                        didUpdateIntermediaryBank: { intermediaryBank in
                            paymentModel.intermediaryBank = intermediaryBank
                        })

                    stepLayout.configuration.fields = [paymentPurpose, paymentRouting]
                    stepLayout.configuration.design.backgroundColor = DesignSystem.shared.colors.foundation.default
                    return stepLayout
                }

                internationalStep.didInitiate = { navigation, paymentModel in
                    return StackStep.build(with: internationalStep,
                                           omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel)
                }

                internationalStep.didCompleteV2 = { (navigation, paymentModel, viewController, response) in
                    PaymentWizardSupport.showReviewStep(
                        step: config.steps[Steps.paymentReview.rawValue],
                        navigation: navigation,
                        paymentModel: paymentModel,
                        viewController: viewController)
                }

                return internationalStep
            }(), {
                var reviewStep = Step()
                reviewStep.title = localized("omniPayments.review.title")()
                reviewStep.analyticsLabel = { paymentModel in
                    guard case .success(let data) = paymentModel.paymentOptionState?.response,
                          let paymentType = data.paymentOptions?.first?.paymentType
                    else { return "" }

                    switch paymentType {
                    case "SEPA_CREDIT_TRANSFER", "SEPA_CT_CLOSED":
                        return "payment_review_sepa"
                    case "INTERNAL":
                        return "payment_review_own"
                    case "INTERNATIONAL_TRANSFER":
                        return "payment_review_international"
                    default:
                        return ""
                    }
                }
                reviewStep.prefersLargeTitles = false

                reviewStep.layoutBuilder = { paymentModel in
                    let stepLayout = PaymentReviewLayout()

                    let paymentTitle = PaymentTitle.build(paymentModel: paymentModel)

                    let accountReviewConfig = DetailedTransferAccountReview.Configuration()
                    accountReviewConfig.uiDataMapper.countryNameHandler = {
                        Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
                    }
                    accountReviewConfig.uiDataMapper.countryImageHandler = {
                        Flag(countryCode: $0)?.originalImage
                    }
                    let accountReview = DetailedTransferAccountReview.build(
                        configuration: accountReviewConfig,
                        paymentModel: paymentModel)

                    var paymentRoutingViews: [UIView] = []

                    if paymentModel.correspondentBank != nil {
                        let view = PaymentRoutingReview.build(
                            configuration: .init(),
                            paymentModel: paymentModel,
                            contentType: .correspondentBank,
                            showBottomSeparator: paymentModel.intermediaryBank != nil)

                        paymentRoutingViews.append(view)
                    }

                    if paymentModel.intermediaryBank != nil {
                        let view = PaymentRoutingReview.build(
                            configuration: .init(),
                            paymentModel: paymentModel,
                            contentType: .intermediaryBank,
                            showBottomSeparator: false)

                        paymentRoutingViews.append(view)
                    }

                    let transferDetails = TransferDetailsReview.build(
                        configuration: .init(),
                        paymentModel: paymentModel,
                        customViews: paymentRoutingViews)

                    var timeZoneConfiguration = Text.Configuration()
                    timeZoneConfiguration.design.text = { label in
                        label.textColor = DesignSystem.shared.colors.text.support
                        label.adjustsFontForContentSizeCategory = true
                        label.font = DesignSystem.shared.fonts.preferredFont(.footnote, .regular)
                        label.textAlignment = .center
                        label.numberOfLines = 0
                    }
                    let timezoneInsets = UIEdgeInsets(
                        top: DesignSystem.shared.spacer.xl,
                        left: DesignSystem.shared.spacer.md,
                        bottom: DesignSystem.shared.spacer.md,
                        right: DesignSystem.shared.spacer.md
                        )

                    let warningView = DuplicatePaymentWarning.build(
                        paymentModel: paymentModel,
                        configuration: .init(),
                        shownFieldsInDetailsScreen: { response in

                            let paymentModel = response.toOmniPaymentModelForDuplicatePaymentCheck(
                                currentPaymentOmniPaymentModel: paymentModel
                            )

                            let duplicatePaymentViewHeader = SharedViews.duplicateViewHeader(
                                paymentOrdersResponse: response
                            )

                            let accountReviewConfig = DetailedTransferAccountReview.Configuration()
                            accountReviewConfig.uiDataMapper.fromAccountName = { _ in
                                response.originator?.name
                            }
                            
                            accountReviewConfig.uiDataMapper.fromAccountNumber = { _ in
                                response.originatorAccount?.identification.identifier
                            }
                            
                            accountReviewConfig.uiDataMapper.fromAccountIcon = { _ in
                                let icon = UIImage(
                                    named: DesignSystem.Assets.icCreditCard,
                                    in: .design,
                                    compatibleWith: nil)

                                return .icon(icon!)
                            }
                            
                            accountReviewConfig.uiDataMapper.toAccountName = { _ in
                                response.transferTransactionInformation?.counterparty.name
                            }
                            
                            accountReviewConfig.uiDataMapper.toAccountNumber = { _ in
                                response.transferTransactionInformation?.counterpartyAccount.identification.identifier
                            }
                            
                            accountReviewConfig.uiDataMapper.countryNameHandler = { _ in
                                guard let countryISO = response.transferTransactionInformation?.counterparty.postalAddress?.country else { return "" }
                                return Locale.autoupdatingCurrent.localizedString(forRegionCode: countryISO)
                            }
                            
                            accountReviewConfig.uiDataMapper.countryImageHandler = { _ in
                                guard let countryISO = response.transferTransactionInformation?.counterparty.postalAddress?.country else { return nil }
                                return Flag(countryCode: countryISO)?.originalImage
                            }
                            
                            accountReviewConfig.uiDataMapper.countryNameHandler = {
                                Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
                            }
                            
                            accountReviewConfig.uiDataMapper.countryImageHandler = {
                                Flag(countryCode: $0)?.originalImage
                            }
                            
                            let accountReview = DetailedTransferAccountReview.build(
                                configuration: accountReviewConfig,
                                paymentModel: paymentModel)
                            
                            var configuration = TransferDetailsReview.Configuration()
                            configuration.visibility.frequency = false

                            let transferDetails = TransferDetailsReview.build(
                                configuration: configuration,
                                paymentModel: paymentModel)
                            
                            return [
                                duplicatePaymentViewHeader,
                                accountReview,
                                transferDetails]
                        },
                        margin: .init(top: 0,
                                      left: DesignSystem.shared.spacer.md,
                                      bottom: DesignSystem.shared.spacer.md,
                                      right: DesignSystem.shared.spacer.md))
                    
                    stepLayout.configuration.fields = [paymentTitle,
                                                       warningView,
                                                       accountReview,
                                                       transferDetails].compactMap { $0 }
                    
                    stepLayout.configuration.strings.continueButtonTitle = localized("omniPayments.stack.views.submitButton.title")
                    return stepLayout
                }

                reviewStep.didInitiate = { navigation, paymentModel in
                    return StackStep.build(with: reviewStep,
                                           omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel)
                }

                reviewStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    if paymentModel.canBeApprovedByUser {
                        var configuration = BottomSheet.Configuration()
                        configuration.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.paymentSubmitAndApprove.rawValue
                        let alertViewController = BottomSheet.build(with: configuration)

                        let submitAction = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.submit")(),
                            style: .default, handler: { _ in
                                paymentModel.canBeApprovedByUser = false
                                let universalPaymentOrder = UniversalPaymentOrder(with: paymentModel)
                                navigation.persist(universalPaymentOrder, contact: nil)
                            }
                        )
                        alertViewController.addAction(submitAction)

                        let submitAndApprove = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.submitAndApprove")(),
                            style: .default, handler: { _ in
                                paymentModel.canBeApprovedByUser = true
                                navigation.persist(UniversalPaymentOrder(with: paymentModel), contact: nil)
                            }
                        )
                        alertViewController.addAction(submitAndApprove)

                        let cancelAction = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.cancel")(),
                            style: .cancel, handler: nil)
                        alertViewController.addAction(cancelAction)

                        viewController.present(alertViewController, animated: true, completion: nil)
                    } else {
                        navigation.persist(UniversalPaymentOrder(with: paymentModel), contact: nil)
                    }
                }

                return reviewStep
            }()]

            return config
        }()

        return paymentWizard
    }()

    private enum Constants {

        static let paymentDescriptionAllowedCharacters = "[a-zA-Z0-9=:;\\-().&@,*#'?/ ]+"
        static let paymentDescriptionCharacterLimit: Int = 140

        static let swiftBICRegex = "[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$"
    }
}

// MARK: - Support object for this payment configuration / PaymentWizardSupport

fileprivate struct PaymentWizardSupport {

    // Payment validation response
    var paymentValidationState: OmniPayment.PaymentValidationState?

    // Triggers an update on the UI for the account number field and updates the account number in the payment
    // model according to the sanctioned countries selection.
    static func willUpdateAccountNumber(with countryCode: String,
                                        paymentModel: OmniPayment,
                                        fieldMapping: [String: UIView],
                                        label: String) {
        paymentModel.toAccount.updateBankAddress(with: countryCode)

        let accountNumberValidators = [JourneysConfiguration.OmniPaymentsConfiguration.Validators.nonEmptyRegexValidator(
                                            for: label,
                                            with: paymentModel.accountNumberRegexPattern)]

        (fieldMapping[PaymentWizardSupport.Constants.accountNumberKey] as? InlineTextInputView)?.update(
                        submitValidators: accountNumberValidators,
                        focusLostValidators: accountNumberValidators)
    }

    // Triggers an update on the UI for the bank code field and updates bank code in the payment
    // model according to the sanctioned countries selection.
    static func willUpdateBankCode(with countryCode: String,
                                   paymentModel: OmniPayment,
                                   fieldMapping: [String: UIView],
                                   pairs: [Pair: String]) {

        let bankCodeInputField = paymentModel.firstMatching(field: Constants.accountBankCodeKey)

        let label = bankCodeInputField?.label
        let bankCodeRegex = bankCodeInputField?.regex
        let isMandatory = bankCodeInputField?.mandatory ?? false

        let bankCodeLabel = BankCodeLabelUtil.getBankCodeLabel(key: label?.keys.first,
                                                               countryCode: countryCode,
                                                               defaultFallbackLabel: label?.values.first ?? "",
                                                               textConfiguration: pairs)

        let isVisible = shouldDisplayBankCodeField(paymentModel: paymentModel)

        var bankCodeValidators = [JourneysConfiguration.OmniPaymentsConfiguration.Validators.nonEmptyRegexValidator(
                                    for: bankCodeLabel,
                                    with: bankCodeRegex)]

        if !isMandatory {
            bankCodeValidators = []
        }

        paymentModel.toAccount.updateBankAddress(with: countryCode)
        
        (fieldMapping[Constants.accountBankCodeKey] as? InlineTextInputView)?
            .update(primaryLabel: bankCodeLabel,
                    shouldBeVisible: { isVisible },
                    submitValidators: bankCodeValidators,
                    focusLostValidators: bankCodeValidators)
    }

    static func handleBeneficiaryStepOutput(navigation: OmniPaymentsNavigable,
                                            paymentModel: OmniPayment,
                                            completionHandler: @escaping (Bool) -> Void) {

        let originatorAccount: PostPaymentOptionsRequest.Identification = .init(
            identifier: paymentModel.fromAccount.accountId,
            schemeName: .id,
            additions: paymentModel.fromAccount.additions)

        let toScheme = paymentModel.toAccount.accountSchemeName.toUseCaseSchemeName()
        let counterparyAccount: PostPaymentOptionsRequest.CounterpartyAccount = {
            if paymentModel.toAccount.isOwnAccount {
                return .init(
                    bankBranchCode: nil,
                    identification: paymentModel.toAccount.accountId,
                    schemeName: .id,
                    additions: paymentModel.toAccount.additions)
            }

            return .init(
                bankBranchCode: paymentModel.toAccount.bankCode,
                identification: paymentModel.toAccount.accountNumber,
                schemeName: toScheme,
                additions: paymentModel.toAccount.additions)
        }()

        let amount = PaymentOption.Currency(amount: paymentModel.amount.stringValue,
                                            currencyCode: paymentModel.toAccount.currencyCode,
                                            additions: nil)
        let request = PostPaymentOptionsRequest(originatorAccount: originatorAccount,
                                                counterpartyAccount: counterparyAccount,
                                                counterpartyCountry: paymentModel.toAccount.bankCountryIsoCode,
                                                instructedAmount: amount,
                                                requestedExecutionDate: paymentModel.executionDate,
                                                additions: nil)

        paymentModel.paymentOptionState = .init(request: request)

        navigation.postPaymentOptions(paymentOptionsRequest: request) { result in

            var pushNext = false

            switch result {
            case let .failure(error):
                paymentModel.paymentOptionState?.response = .failure(error)
                pushNext = true
            case let .success(paymentOption):
                paymentModel.paymentOptionState?.response = .success(paymentOption)
                pushNext = shouldShowPaymentOptionsStep(with: paymentOption.paymentOptions)

                updatePaymentType(in: paymentModel)
            }

            completionHandler(pushNext)
        }
    }

    static func updatePaymentType(in paymentModel: OmniPayment) {
        guard case .success(let paymentOption) = paymentModel.paymentOptionState?.response,
              let paymentOptions = paymentOption.paymentOptions,
              paymentOptions.count == 1,
              let firstPaymentOption = paymentOptions.first,
              firstPaymentOption.paymentOptions?.count == 1,
              let firstOption = firstPaymentOption.paymentOptions?.first
        else { return }

        paymentModel.paymentType = .init(
            paymentTypeIdentifier: firstPaymentOption.paymentType,
            paymentOption: firstOption)
    }

    static func shouldShowPaymentOptionsStep(with paymentOptions: [PaymentOption]?) -> Bool {

        guard let paymentOptions = paymentOptions else {
            return false
        }
        var totalOptionCount = 0
        paymentOptions.forEach { option in
            totalOptionCount += option.paymentOptions?.count ?? 0
        }
        // Comment the next three lines to show payment options selector regardless of option count
        if totalOptionCount <= 1 {
            return false
        }
        return true
    }

    // Whether the current selection of sanctioned country should make the UI display a bank code field
    static func shouldDisplayBankCodeField(paymentModel: OmniPayment) -> Bool {
        let bankCodeInputField = paymentModel.firstMatching(field: Constants.accountBankCodeKey)

        let label = bankCodeInputField?.label
        let labelKey = label?.keys.first
        let isApplicable = !(bankCodeInputField?.notApplicable ?? false)
        let defaultLabel = label?.values.first ?? ""

        return labelKey != nil && !defaultLabel.isEmpty && isApplicable
    }

    // Whether beneficiary details screen should display extra input fields
    // Equals to the reverse value of country's `isDefault` property
    static func shouldDisplayExtraBeneficiaryDetails(paymentModel: OmniPayment) -> Bool {
        guard let country = paymentModel.toAccount.country else {
            return false
        }
        return !(country.isDefault ?? false)
    }

    // Checks wether selected account country is supported by sanctioned countries
    static func isCountrySupported(paymentModel: OmniPayment, countryISO: String?) -> Bool {
        return paymentModel.sanctionedCountries.contains(where: {
            $0.country == countryISO
        })
    }

    // Stores info about mandatory extra fields for beneficiary details
    struct MandatoryBeneficiaryExtraFields {
        var isSwiftMandatory = true
        var isNameMandatory = false
    }

    static func areAllBeneficiaryExtraFieldsValid(
        paymentModel: OmniPayment,
        mandatoryExtraFields: MandatoryBeneficiaryExtraFields
    ) -> Bool {
        var areAllExtraFieldsFilled = true
        if shouldDisplayExtraBeneficiaryDetails(paymentModel: paymentModel) {
            let isSwiftEmpty = paymentModel.toAccount.accountBank?.bic?.isEmpty ?? true

            let isSwiftValid = !mandatoryExtraFields.isSwiftMandatory || !isSwiftEmpty

            areAllExtraFieldsFilled = isSwiftValid
        }
        return areAllExtraFieldsFilled
    }

    /// Uses default country code from account bank address to set concrete sanctioned country
    static func setDefaultCountryAsRecipient(from paymentModel: OmniPayment) {
        if let countryCode = paymentModel.toAccount.accountBank?.postalAddress?.country,
           let country = paymentModel.sanctionedCountries.first(where: { $0.country == countryCode }) {
            paymentModel.toAccount.country = country
        }
    }

    // The logic on this function makes sure that:
    // - There are no missing fields
    // - Skipping the display of the edit beneficiary screen for own accounts
    // - Selected country is supported (if exists)
    // The logic within this function can be easily redefined as the user pleases
    static func shouldPresentEditBeneficiaryScreen(
        using paymentModel: OmniPayment,
        mandatoryExtraFields: MandatoryBeneficiaryExtraFields
    ) -> Bool {

        if paymentModel.toAccount.isOwnAccount {
            return false
        }

        let accountNumber = paymentModel.toAccount.accountNumber

        var isAccountNumberValid = !accountNumber.isEmpty
        if let regex = paymentModel.accountNumberRegexPattern {
            isAccountNumberValid = accountNumber.range(of: regex, options: .regularExpression) != nil
        }

        let contactNameIsNotEmpty = !paymentModel.toAccount.contactAccountName.isEmpty

        let isCountrySelected = !(paymentModel.toAccount.country == nil)

        let isCountrySupported = isCountrySelected && isCountrySupported(paymentModel: paymentModel,
                                                                         countryISO: paymentModel.toAccount.accountBank?.postalAddress?.country)

        let isBankNameEmpty = paymentModel.toAccount.accountBank?.name?.isEmpty ?? true
        let isBankNameValid = !mandatoryExtraFields.isNameMandatory || !isBankNameEmpty

        let isAllExtraFieldsFilled = areAllBeneficiaryExtraFieldsValid(paymentModel: paymentModel,
                                                                       mandatoryExtraFields: mandatoryExtraFields)

        return !(isAccountNumberValid && contactNameIsNotEmpty && isCountrySelected && isCountrySupported && isBankNameValid && isAllExtraFieldsFilled)
    }

    static func shouldDisplayInternationalScreen(using paymentModel: OmniPayment) -> Bool {
        return paymentModel.isInternationalPayment
    }

    static func validatePayment(navigation: OmniPaymentsNavigable,
                                paymentModel: OmniPayment,
                                completionHandler: @escaping (OmniPayment.PaymentValidationState) -> Void) {
        navigation.validate(UniversalPaymentOrder(with: paymentModel)) { result in
            switch result {
            case .success(let response):
                paymentModel.warnings.removeAll()
                
                if case let .success(response) = result, let warnings = response.warnings {
                    paymentModel.warnings = warnings
                }
                
                paymentModel.canBeApprovedByUser = response.canApprove
            case .failure:
                paymentModel.canBeApprovedByUser = false
            }

            completionHandler(result)
        }
    }

    static func showReviewStep(step: Step,
                               navigation: OmniPaymentsNavigable,
                               paymentModel: OmniPayment,
                               viewController: UIViewController) {
        PaymentWizardSupport.validatePayment(navigation: navigation,
                                             paymentModel: paymentModel) { result in
            let reviewViewController = PaymentReviewStep.build(
                with: step,
                omnipaymentsNavigation: navigation,
                paymentModel: paymentModel,
                paymentValidationState: result)

            viewController.navigationController?.pushViewController(reviewViewController, animated: true)
        }
    }

    struct Constants {
        public static let privilege = "create"
        public static let businessFunction = "SEPA CT,UK CHAPS,UK Foreign Wire,US Domestic Wire,ACH Credit Transfer"
        public static let resourceName = "Payments"

        public static let accountNumberKey = "account-number"
        public static let accountBankCodeKey = "bank-code"
    }
}

// MARK: - Helper functions for OmniPayment model
private extension OmniPayment.SchemeNames {
    func toUseCaseSchemeName() -> PostPaymentOptionsRequest.SchemeNames {
        switch self {
        case .iban:
            return .iban
        case .bban:
            return .bban
        case .id, .mobile, .email:
            return .id
        case .externalId:
            return .externalId
        @unknown default:
            return .id
        }
    }
}

private extension OmniPayment {
    func firstMatching(field: String) -> SanctionedCountry.InputFormField? {
        let selectedCountry = toAccount.bankCountryIsoCode

        return sanctionedCountries
            .first { $0.country == selectedCountry }?
            .inputFormSettings?
            .first { $0.key == field }
    }

    var accountNumberRegexPattern: String? {
        return firstMatching(field: PaymentWizardSupport.Constants.accountNumberKey)?.regex
    }

    var bankBranchCodeIsMandatory: Bool {
        return firstMatching(field: PaymentWizardSupport.Constants.accountBankCodeKey)?.mandatory ?? false
    }
}

// MARK: - Helper functions for PaymentAccount object

private extension PaymentAccount {

    var sanctionedCountry: SanctionedCountry? {
        if let countryISO = bankCountryIsoCode {
            return SanctionedCountry(country: countryISO)
        }

        return nil
    }
}
