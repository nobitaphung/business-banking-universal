//
//  Created by Backbase R&D B.V. on 02/04/2021.
//

import BackbaseDesignSystem
import BusinessOmniPaymentsJourney
import FlagKit
import Foundation
import UIKit

// swiftlint:disable file_length
extension JourneysConfiguration.OmniPaymentsConfiguration {
    public static let sepa: OmniPayments.Business.Configuration.Payment = {
        var sepaPayment = OmniPayments.Business.Configuration.Payment()

        struct Constants {
            public init() {}
            public static let paymentsResource = "Payments"
            public static let sepaBusinessFunction = "SEPA CT"
            public static let createPrivilege = "create"
        }

        sepaPayment.title = localized("omniPayments.sepa.title")()
        sepaPayment.subtitle = localized("omniPayments.sepa.subtitle")()
        sepaPayment.icon = UIImage(named: DesignSystem.Assets.icAccountBalance,
                                   in: .design,
                                   compatibleWith: nil) ?? UIImage()
        sepaPayment.configuration = {
            enum Steps: Int {
                case fromAccounts = 0
                case toAccounts
                case createBeneficiary
                case preview
                case review
            }

            var config = OmniPayments.Configuration()
            config.confirmationResult.uiDataMapper.shouldResolveImageWithIconName = true
            let validators = Validators()

            config.steps = [{
                var fromAccountsStep = Step()
                fromAccountsStep.title = localized("omniPayments.domestic.steps.fromStep.title")()
                fromAccountsStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.fromAccount.rawValue }
                fromAccountsStep.layoutBuilder = { _ in
                    let listLayout = AccountsStepLayout()
                    var accountParameters = AccountsStepLayout.Configuration.AccountFetchParams(
                        businessFunction: Constants.sepaBusinessFunction,
                        resourceName: Constants.paymentsResource,
                        privilege: Constants.createPrivilege,
                        accountType: .debit)
                    listLayout.configuration.accountFetchParams = accountParameters
                    return listLayout
                }

                fromAccountsStep.didInitiate = { (navigation, paymentModel) in
                    return AccountsStep.build(with: fromAccountsStep,
                                              omnipaymentsNavigation: navigation,
                                              paymentModel: paymentModel)
                }

                fromAccountsStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let nextStep = config.steps[Steps.toAccounts.rawValue]

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return fromAccountsStep
            }(), {
                var contactsStep = Step()
                contactsStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.toAccount.rawValue }
                contactsStep.title = localized("omniPayments.domestic.steps.toStep.title")()

                contactsStep.layoutBuilder = { paymentModel in
                    let listLayout = ContactsStepLayout()
                    listLayout.configuration.strings.listButtonText = localized("omniPayments.domestic.contactsList.listButtonText")()
                    listLayout.configuration.images.listButtonImage = UIImage(named: DesignSystem.Assets.icPersonAdd,
                                                                              in: .design,
                                                                              compatibleWith: nil)
                    listLayout.configuration.listButton = (isVisible: true, onClick: { omnipaymentsNavigation, viewController in
                        let nextStep = config.steps[Steps.createBeneficiary.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(omnipaymentsNavigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    })

                    return listLayout
                }

                contactsStep.didInitiate = { (navigation, paymentModel) in
                    return ContactsStep.build(with: contactsStep,
                                              omnipaymentsNavigation: navigation,
                                              paymentModel: paymentModel)
                }

                contactsStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let nextStep = config.steps[Steps.preview.rawValue]

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return contactsStep
            }(), {
                var createBeneficiaryStep = Step()
                createBeneficiaryStep.title = localized("omniPayments.sepa.contactsList.listButtonText")()
                createBeneficiaryStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.newBeneficiary.rawValue }
                createBeneficiaryStep.prefersLargeTitles = false

                createBeneficiaryStep.layoutBuilder = { paymentModel in
                    let layout = StackStepLayout()

                    let avatar = AvatarView.build(initials: nil)

                    let nameField = InlineTextInput.build(
                        primaryLabel: localized("omniPayments.sepa.createBeneficiary.beneficiaryNameTitle")(),
                        secondaryLabel: nil,
                        initialInput: nil,
                        onValidatedInput: { text in
                            paymentModel.toAccount.contactName = text

                            var initials: String?
                            if !text.isEmpty {
                                let components = text.components(separatedBy: " ")
                                if components.count > 1 {
                                    initials = String(components[0].prefix(1)).uppercased() +
                                        String(components[1].prefix(1)).uppercased()
                                } else {
                                    initials = String(text.prefix(1)).uppercased()
                                }
                            }
                            avatar.initials = initials
                        },
                        focusLostValidators: [validators.beneficiaryNameMustNotBeEmpty],
                        submitValidators: [validators.beneficiaryNameMustNotBeEmpty],
                        inputMaxLength: 140 // DBS defined max length for the Contact name
                    )

                    let ibanField = InlineTextInput.build(
                        primaryLabel: localized("omniPayments.sepa.createBeneficiary.ibanTitle")(),
                        secondaryLabel: nil,
                        initialInput: nil,
                        onValidatedInput: { iban in
                            paymentModel.toAccount.iban = iban.uppercased()
                        },
                        focusLostValidators: [validators.ibanMustBeValid],
                        submitValidators: [validators.ibanMustBeValid]
                    )

                    let checkbox = CheckboxView.build(
                        title: localized("omniPayments.sepa.createBeneficiary.saveAsContactTitle")(),
                        onValueChanged: { checked in
                        paymentModel.saveBeneficiaryToContacts = checked
                    })

                    // Build the view elements
                    layout.configuration.fields = [avatar, checkbox, nameField, ibanField]

                    return layout
                }

                createBeneficiaryStep.didInitiate = { (navigation, paymentModel) in
                    return StackStep.build(with: createBeneficiaryStep, omnipaymentsNavigation:
                                            navigation, paymentModel: paymentModel)
                }

                createBeneficiaryStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                    let nextStep = config.steps[Steps.preview.rawValue]

                    if let routingFunction = nextStep.didInitiate {
                        let nextViewController = routingFunction(navigation, paymentModel)
                        viewController.navigationController?.pushViewController(nextViewController, animated: true)
                    }
                }

                return createBeneficiaryStep
            }(), {
                var previewStep = Step()
                previewStep.title = localized("omniPayments.sepa.title")()
                previewStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.transferDetails.rawValue }
                previewStep.prefersLargeTitles = false

                previewStep.layoutBuilder = { paymentModel in
                    let stackStepLayout = StackStepLayout()
                    var paymentModel = paymentModel

                    var amountConfiguration = Amount.Configuration()
                    amountConfiguration.strings.label = localized("omniPayments.stack.views.amount.title")

                    let currencyNameHandler: (String) -> (String?) = { code in
                        Locale.autoupdatingCurrent.localizedString(forCurrencyCode: code)
                    }

                    let currencyFlagHandler: (String) -> (UIImage?) = { code in
                        Flag(countryCode: String(code.prefix(2)))?.originalImage
                    }

                    // SEPA Payments allow only EUR, however, the filtering of accounts based on currency
                    // still is not implemented. We force here the currency to be displayed in EUR
                    //let currencyCode = paymentModel.toAccount.currencyCode
                    let currencyCode = "EUR"

                    let intraCompanyAmountView = Amount.build(
                        initialAmountValue: paymentModel.amount,
                        placeholder: "0.00",
                        initialCurrencyIso: currencyCode,
                        configuration: amountConfiguration,
                        availableFunds: { nil },
                        isCurrencyPickerEnabled: { false },
                        isCurrencySearchEnabled: { false },
                        didSelectCurrency: { _ in },
                        currencyNameHandler: currencyNameHandler,
                        currencyFlagHandler: currencyFlagHandler,
                        onValidatedInput: {
                            paymentModel.amount = $0
                            paymentModel.toAccount.currencyCode = currencyCode
                        },
                        submitValidators: [validators.amountNotEmpty, validators.amountIsPositive],
                        margin: UIEdgeInsets(top: 0, left: 16, bottom: 4, right: 16))

                    //Description Field
                    let descriptionTransferTextInputPreviewView: UIView = {
                        //Description Field
                        var descriptionStrings = TransferTextInputPreview.Strings()
                        descriptionStrings.previewTitle = localized("omniPayments.stack.views.paymentDescription.previewTitle")()
                        let subtitleInDescription = localized("omniPayments.stack.views.paymentDescription.previewSubtitle")()
                        descriptionStrings.previewSubtitle = subtitleInDescription
                        descriptionStrings.inputTitle = localized("omniPayments.stack.views.paymentDescription.title")()
                        descriptionStrings.inputDescription = localized("omniPayments.stack.views.paymentDescription.subtitle")()
                        descriptionStrings.inputSaveButton = localized("omniPayments.stack.views.paymentMessageComposer.saveButton")()
                        descriptionStrings.inputCancelButton = localized("omniPayments.stack.views.paymentMessageComposer.cancelButton")()

                        let allowedCharsDesc = localized("omniPayments.stack.views.paymentDescription.messageAllowedCharacters")()
                        descriptionStrings.inputAllowedCharactersDescription = allowedCharsDesc
                        descriptionStrings.inputSuggestions = [localized("omniPayments.stack.views.paymentDescription.suggestions.one")(),
                                                               localized("omniPayments.stack.views.paymentDescription.suggestions.two")(),
                                                               localized("omniPayments.stack.views.paymentDescription.suggestions.three")()]

                        var configuration = TransferTextInputPreview.Configuration()
                        configuration.strings = descriptionStrings
                        configuration.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.description.rawValue

                        return TransferTextInputPreview.build(
                            textType: .description,
                            paymentModel: paymentModel,
                            configuration: configuration,
                            value: paymentModel.description ?? "",
                            requiredValue: false,
                            didTextValueChangeHandler: { newValue in
                                paymentModel.description = newValue
                            },
                            showDotEnterLine: true,
                            showDotExitLine: true,
                            showArrow: true,
                            maxInputLength: 140)
                    }()

                    let transferScheduleInputPreviewView = TransferScheduleInputPreview.build(
                        configuration: .init(),
                        schedule: paymentModel.executionSchedule,
                        didSelectSchedule: { executionSchedule in
                            paymentModel.executionSchedule = executionSchedule
                        })

                    // Funds
                    let currency = paymentModel.fromAccount.currencyCode

                    let formatterType: DesignSystem.Formatting.AmountFormatType = .currency(isISO: true, code: currency)
                    let numberFormatter = NumberFormatter()
                    DesignSystem.shared.styles.numberFormatter(formatterType)(numberFormatter)

                    let fundsTranslation = localized("omniPayments.config.fields.availableFunds.text")()
                    let localisedAvailableFunds = paymentModel.fromAccount.availableFunds
                    let transferAccountPreviewView = TransferAccountPreview.build(
                        fromAccountName: paymentModel.fromAccount.displayName,
                        toAccountName: paymentModel.toAccount.contactName,
                        margin: UIEdgeInsets(top: 32, left: 16, bottom: 8, right: 16))

                    var configuration = Text.Configuration()
                    configuration.design.text = { label in
                        label.textColor = DesignSystem.shared.colors.text.support
                        label.font = DesignSystem.shared.fonts.preferredFont(.footnote, .light)
                    }

                    let availableFundsTextView = Text.build(textValue: String(format: fundsTranslation, localisedAvailableFunds),
                                                           configuration: configuration)

                    stackStepLayout.configuration.fields = [
                        transferAccountPreviewView,
                        availableFundsTextView,
                        intraCompanyAmountView,
                        descriptionTransferTextInputPreviewView,
                        transferScheduleInputPreviewView
                    ]

                    return stackStepLayout
                }

                previewStep.didInitiate = { (navigation, paymentModel) in
                    return StackStep.build(with: previewStep, omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel)
                }

                previewStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in

                    let completion: (Result<OmniPayment.PaymentOrderValidationResponse, OmniPayments.Error>) -> Void = { result in
                        switch result {
                        case .success(let response):
                            paymentModel.canBeApprovedByUser = response.canApprove
                            
                            paymentModel.warnings.removeAll()
                            
                            if let warnings = response.warnings {
                                paymentModel.warnings = warnings
                            }
                            
                        case .failure:
                            paymentModel.canBeApprovedByUser = false
                        }

                        let nextStep = config.steps[Steps.review.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(navigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    }

                    navigation.validate(SEPAPaymentOrder(with: paymentModel), completion: completion)
                }

                return previewStep
            }(), {
                var reviewStep = Step()
                reviewStep.title = localized("omniPayments.config.steps.reviewStep.title")()
                reviewStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.review.rawValue }
                reviewStep.layoutBuilder = { (paymentModel) -> StackStepLayout in

                    let stackStepLayout = StackStepLayout()
                    var fields: [UIView] = []
                    stackStepLayout.configuration.strings.continueButtonTitle =
                        localized("omniPayments.config.steps.reviewStep.continueButton.title")

                    let transferAccountReviewView = TransferAccountReview.build(
                        fromLabel: localized("omniPayments.config.fields.transferAccountReview.fromTitle")(),
                        fromAccountName: paymentModel.fromAccount.displayName,
                        fromAccountNumber: paymentModel.fromAccount.accountNumber,
                        toLabel: localized("omniPayments.config.fields.transferAccountReview.toTitle")(),
                        toAccountName: paymentModel.toAccount.contactAccountName,
                        toAccountNumber: paymentModel.toAccount.accountNumber)

                    let amountTransferTitleSubtitlePreviewView = TransferTitleSubtitlePreview.build(
                        title: localized("omniPayments.stack.views.amount.title")(),
                        subtitle: { () -> (String) in
                            let amount = paymentModel.amount
                            let currency = paymentModel.toAccount.currencyCode

                            let formatterType: DesignSystem.Formatting.AmountFormatType = .currency(isISO: true, code: currency)
                            let numberFormatter = NumberFormatter()
                            DesignSystem.shared.styles.numberFormatter(formatterType)(numberFormatter)

                            return numberFormatter.string(from: amount) ?? ""
                        }, subtitleTextAppearance: DesignSystem.shared.fonts.preferredFont(.title2, .semibold),
                        hideBottomSeparator: false, blankSubtitlePlaceholder: "-")

                    let dateTransferTitleSubtitlePreviewView = TransferTitleSubtitlePreview.build(
                        title: localized("omniPayments.stack.views.executionDate.title")(),
                        subtitle: { () -> (String) in
                            let text = TransferScheduleInputPreview.Strings()
                            if paymentModel.executionDate.bb.isToday {
                                return text.today() + ", " + paymentModel.executionDate.bb.formatted(dateStyle: .medium)
                            } else {
                                return paymentModel.executionDate.bb.formatted(dateStyle: .medium)
                            }
                        }, subtitleTextAppearance: DesignSystem.shared.fonts.preferredFont(.headline, .semibold),
                        hideBottomSeparator: false, blankSubtitlePlaceholder: "-")

                    let frequencyTransferTitleSubtitlePreviewView = TransferTitleSubtitlePreview.build(
                        title: localized("omniPayments.stack.views.frequency.title")(),
                        subtitle: { () -> (String) in
                            let text = TransferScheduleInputPreview.Strings()
                            switch paymentModel.transferFrequency {
                            case .once: return text.once()
                            case .daily: return text.daily()
                            case .weekly: return text.weekly()
                            case .biweekly: return text.biweekly()
                            case .monthly: return text.monthly()
                            case .quarterly: return text.quarterly()
                            case .yearly: return text.yearly()
                            default: return ""
                            }
                        }, subtitleTextAppearance: DesignSystem.shared.fonts.preferredFont(.headline, .semibold),
                        hideBottomSeparator: false,
                        blankSubtitlePlaceholder: "-")

                    let paymentDescriptionTransferTitleSubtitlePreviewView = TransferTitleSubtitlePreview.build(
                        title: localized("omniPayments.stack.views.paymentDescription.title")(),
                        subtitle: { () -> (String) in
                            return paymentModel.description ?? ""
                        }, subtitleTextAppearance: DesignSystem.shared.fonts.preferredFont(.headline, .semibold),
                        hideBottomSeparator: true,
                        blankSubtitlePlaceholder: "")

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

                            let duplicateViewHeader = SharedViews.duplicateViewHeader(
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
                                duplicateViewHeader,
                                accountReview,
                                transferDetails]
                        },
                        margin: .init(top: DesignSystem.shared.spacer.md,
                                      left: DesignSystem.shared.spacer.md,
                                      bottom: 0,
                                      right: DesignSystem.shared.spacer.md))
                    
                    fields = [
                        warningView,
                        transferAccountReviewView,
                        amountTransferTitleSubtitlePreviewView,
                        dateTransferTitleSubtitlePreviewView,
                        frequencyTransferTitleSubtitlePreviewView].compactMap { $0 }

                    if let description = paymentModel.description, !description.isEmpty {
                        fields.append(paymentDescriptionTransferTitleSubtitlePreviewView)
                    }
                    
                    stackStepLayout.configuration.fields = fields
                    return stackStepLayout
                }

                reviewStep.didInitiate = { (navigation, paymentModel) in
                    return StackStep.build(with: reviewStep,
                                           omnipaymentsNavigation: navigation,
                                           paymentModel: paymentModel)
                }

                reviewStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in

                    var contact: Contact?
                    if paymentModel.saveBeneficiaryToContacts {
                        var contactAccount = AccountInformation(name: paymentModel.toAccount.accountName,
                                                                IBAN: paymentModel.toAccount.iban.uppercased())
                        contact = Contact(id: "", accounts: [contactAccount], name: paymentModel.toAccount.contactName)
                    }

                    if paymentModel.canBeApprovedByUser {
                        var configuration = BottomSheet.Configuration()
                        configuration.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.submitAndApprove.rawValue
                        let alertViewController = BottomSheet.build(with: configuration)

                        let submitAction = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.submit")(),
                            style: .default, handler: { _ in
                                paymentModel.canBeApprovedByUser = false
                                navigation.persist(SEPAPaymentOrder(with: paymentModel), contact: contact)
                            }
                        )
                        alertViewController.addAction(submitAction)

                        let submitAndApprove = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.submitAndApprove")(),
                            style: .default, handler: { _ in
                                paymentModel.canBeApprovedByUser = true
                                navigation.persist(SEPAPaymentOrder(with: paymentModel), contact: contact)
                            }
                        )
                        alertViewController.addAction(submitAndApprove)

                        let cancelAction = UIAlertAction(
                            title: localized("omniPayments.config.steps.reviewStep.actionSheet.cancel")(),
                            style: .cancel, handler: nil)
                        alertViewController.addAction(cancelAction)

                        viewController.present(alertViewController, animated: true, completion: nil)
                    } else {
                        navigation.persist(SEPAPaymentOrder(with: paymentModel), contact: contact)
                    }
                }
                return reviewStep
            }()]

            return config

        }()

        return sepaPayment
    }()
}
