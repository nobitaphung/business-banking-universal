//
//  Created by Backbase R&D B.V. on 30/10/2020.
//

import Foundation
import BusinessOmniPaymentsJourney
import BackbaseDesignSystem
import FlagKit

extension JourneysConfiguration.OmniPaymentsConfiguration {
    static let international: OmniPayments.Business.Configuration.Payment = {
        var internationalPayment = OmniPayments.Business.Configuration.Payment()

        struct Constants {
            public init() {}
            public static let foreignWire = "US Foreign Wire"
            public static let payments = "Payments"
            public static let createPrivilege = "create"
        }

        internationalPayment.title = localized("omniPayments.international.title")()
        internationalPayment.subtitle = localized("omniPayments.international.subtitle")()
        internationalPayment.icon = UIImage.named(DesignSystem.Assets.icLanguage, in: .design) ?? .init()
        internationalPayment.configuration = {
            enum Steps: Int {
                case fromAccounts = 0
                case toAccounts
                case beneficiary
                case preview
                case review
            }

            var config = OmniPayments.Configuration()
            config.confirmationResult.uiDataMapper.shouldResolveImageWithIconName = true
            config.shouldPreloadSanctionedCountries = true
            let validators = Validators()

            config.steps = [
                {
                    var fromAccountsStep = Step()
                    fromAccountsStep.title = localized("omniPayments.international.steps.fromStep.title")()
                    fromAccountsStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.fromAccount.rawValue }
                    fromAccountsStep.layoutBuilder = { _ in
                        let listLayout = AccountsStepLayout()
                        var accountParameters = AccountsStepLayout.Configuration.AccountFetchParams(
                            businessFunction: Constants.foreignWire,
                            resourceName: Constants.payments,
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
                }(),
                {
                    var contactsStep = Step()
                    contactsStep.title = localized("omniPayments.international.steps.toStep.title")()
                    contactsStep.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.toAccount.rawValue }
                    contactsStep.layoutBuilder = { paymentModel in
                        let listLayout = ContactsStepLayout()
                        listLayout.configuration.listButton = (isVisible: true, onClick: { omnipaymentsNavigation, viewController in
                            //Navigate to beneficiary screen
                            paymentModel.toAccount = .init()
                            paymentModel.beneficiary = nil
                            var nextStep = config.steps[Steps.beneficiary.rawValue]
                            if let routingFunction = nextStep.didInitiate {
                                let nextViewController = routingFunction(omnipaymentsNavigation, paymentModel)
                                viewController.navigationController?.pushViewController(nextViewController, animated: true)
                            }
                        })

                        listLayout.configuration.contactMapper.IBAN = { _, _ in return "4332DNEKD" }

                        listLayout.configuration.strings.listButtonText = localized("omniPayments.international.contactsList.listButtonText")()
                        listLayout.configuration.images.listButtonImage = UIImage(named: DesignSystem.Assets.icPersonAdd,
                                                                                 in: .design,
                                                                                 compatibleWith: nil)

                        listLayout.configuration.filter = { item in
                            return item.id != paymentModel.fromAccount.accountId
                        }
                        return listLayout
                    }

                    contactsStep.didInitiate = { (navigation, paymentModel) in
                        return ContactsStep.build(with: contactsStep,
                                                  omnipaymentsNavigation: navigation,
                                                  paymentModel: paymentModel)
                    }

                    contactsStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                        var nextStep = config.steps[Steps.beneficiary.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(navigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    }
                    return contactsStep
                }(),
                {
                    var beneficiaryStep = Step()
                    beneficiaryStep.title = localized("omniPayments.beneficiary.title")()
                    beneficiaryStep.analyticsLabel = { paymentModel in
                        if paymentModel.toAccount.isNew {
                            return OmniPayments.ObservabilityTracking.Screen.newBeneficiary.rawValue
                        } else {
                            return OmniPayments.ObservabilityTracking.Screen.editBeneficiary.rawValue
                        }
                    }
                    beneficiaryStep.layoutBuilder = { paymentModel in
                        return beneficiaryStepLayout()
                    }
                    beneficiaryStep.didInitiate = { (navigation, paymentModel) in

                        return BeneficiaryStep.build(with: beneficiaryStep,
                                                     omnipaymentsNavigation: navigation,
                                                     paymentModel: paymentModel)
                    }

                    beneficiaryStep.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                        let nextStep = config.steps[Steps.preview.rawValue]

                        if let routingFunction = nextStep.didInitiate {
                            let nextViewController = routingFunction(navigation, paymentModel)
                            viewController.navigationController?.pushViewController(nextViewController, animated: true)
                        }
                    }

                    return beneficiaryStep
                }(),
                {
                    var step = Step()
                    step.title = localized("omniPayments.config.steps.previewStep.title")()
                    step.analyticsLabel = { _ in OmniPayments.ObservabilityTracking.Screen.transferDetails.rawValue}
                    step.layoutBuilder = { paymentModel in
                        var paymentDetailsLayout = InternationalLayouts.PaymentDetailsStepLayout()

                        var bottomSheet = InternationalLayouts.ViewConfigurators.PaymentDetailsBottomSheet()

                        bottomSheet.transferAmount.title = localized("omniPayments.stack.views.bottomSheet.amountView.amount.title")()

                        let plainTextStyle: (UILabel) -> Void = { label in
                            label.font = DesignSystem.shared.fonts.preferredFont(.subheadline, .regular)
                            label.textColor = DesignSystem.shared.colors.text.default
                        }

                        bottomSheet.transferAmountConverted.configuration.design.titleStyle = plainTextStyle
                        bottomSheet.transferAmountConverted.configuration.design.subtitleStyle = plainTextStyle
                        bottomSheet.transferAmountConverted.title = localized("omniPayments.stack.views.bottomSheet.amountView.convertedAmount.title")()

                        bottomSheet.transferFee.configuration.design.titleStyle = plainTextStyle
                        bottomSheet.transferFee.configuration.design.subtitleStyle = plainTextStyle
                        bottomSheet.transferFee.title = localized("omniPayments.stack.views.bottomSheet.transferFee.title")()

                        paymentDetailsLayout.configuration.bottomSheet = bottomSheet

                        paymentDetailsLayout.configuration.fromAccount = { paymentModel.fromAccount.displayName }
                        paymentDetailsLayout.configuration.beneficiaryAccount = { paymentModel.toAccount.contactName }

                        paymentDetailsLayout.configuration.amount.initialAmountValue = {
                            paymentModel.amount
                        }
                        paymentDetailsLayout.configuration.amount.initialCurrencyIso = { paymentModel.fromAccount.currencyCode }
                        paymentDetailsLayout.configuration.amount.availableFunds = {
                            let fundsTranslation = localized("omniPayments.config.fields.availableFunds.text")()
                            let localisedAvailableFunds = paymentModel.fromAccount.availableFunds
                            return String(format: fundsTranslation, localisedAvailableFunds)
                        }

                        let currencyNameHandler: (String) -> (String?) = { code in
                            Locale.autoupdatingCurrent.localizedString(forCurrencyCode: code)
                        }

                        let currencyFlagHandler: (String) -> (UIImage?) = { code in
                            Flag(countryCode: String(code.prefix(2)))?.originalImage
                        }

                        paymentDetailsLayout.configuration.amount.currencyFlagHandler = currencyFlagHandler
                        paymentDetailsLayout.configuration.amount.currencyNameHandler = currencyNameHandler

                        paymentDetailsLayout.configuration.amount.submitValidators = [
                            validators.amountNotEmpty,
                            validators.amountIsPositive
                        ]

                        paymentDetailsLayout.configuration.paymentChargeBearer.submitValidators = [
                            validators.paymentFeeSelectionMustNotEmpty
                        ]

                        let paymentChargeBearerMapper: (String) -> (SingleChoiceModel?) = { item in
                            switch item {
                            case "OUR":
                                let title = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.our.title")()
                                let desc = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.our.desc")()

                                return SingleChoiceModel(id: "OUR", title: title, description: desc)
                            case "BEN":
                                let title = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.ben.title")()
                                let desc = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.ben.desc")()

                                return SingleChoiceModel(id: "BEN", title: title, description: desc)
                            case "SHA":
                                let title = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.sha.title")()
                                let desc = localized("omniPayments.international.paymentDetails.paymentFeeSelector.list.opt.sha.desc")()

                                return SingleChoiceModel(id: "SHA", title: title, description: desc)
                            default:
                                return nil
                            }
                        }
                        paymentDetailsLayout.configuration.paymentChargeBearer.initialValue = {
                            return paymentChargeBearerMapper(paymentModel.chargeBearer ?? "")
                        }

                        paymentDetailsLayout.configuration.paymentChargeBearer.didValidateInput = { item in
                            paymentModel.chargeBearer = item.id
                        }

                        paymentDetailsLayout.configuration.paymentChargeBearer.optionListMapHandler = paymentChargeBearerMapper
                        
                        paymentDetailsLayout.configuration.paymentPurpose.configuration = .init()
                        
                        paymentDetailsLayout.configuration.paymentPurpose.didChangeMessageText = { text in
                            paymentModel.messageToBank = text
                        }
                        
                        paymentDetailsLayout.configuration.paymentPurpose.didChangePurposeOfPayment = { purposeOfPayment in
                            paymentModel.purposeOfPayment = purposeOfPayment
                        }

                        var descriptionStrings = TransferTextInputPreview.Strings()

                        descriptionStrings.previewTitle = localized("omniPayments.stack.views.paymentDescription.previewTitle")()
                        descriptionStrings.previewSubtitle = localized("omniPayments.stack.views.paymentDescription.previewSubtitle")()
                        descriptionStrings.inputTitle = localized("omniPayments.stack.views.paymentDescription.title")()
                        descriptionStrings.inputDescription = localized("omniPayments.stack.views.paymentDescription.subtitle")()
                        descriptionStrings.inputSaveButton = localized("omniPayments.stack.views.paymentMessageComposer.saveButton")()
                        descriptionStrings.inputCancelButton = localized("omniPayments.stack.views.paymentMessageComposer.cancelButton")()

                        let allowedCharsDesc = localized("omniPayments.stack.views.paymentDescription.messageAllowedCharacters")()
                        descriptionStrings.inputAllowedCharactersDescription = allowedCharsDesc
                        descriptionStrings.inputSuggestions = [localized("omniPayments.stack.views.paymentDescription.suggestions.one")(),
                                                               localized("omniPayments.stack.views.paymentDescription.suggestions.two")(),
                                                               localized("omniPayments.stack.views.paymentDescription.suggestions.three")()]

                        var paymentDescription = InternationalLayouts.ViewConfigurators.PaymentDescription()
                        paymentDescription.configuration.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.description.rawValue
                        paymentDescription.allowedCharacters = RegularExpressions.allowedCharactersRegexp
                        paymentDescription.value = { return paymentModel.description ?? "" }
                        paymentDescription.maxInputLength = 140
                        paymentDescription.configuration.strings = descriptionStrings
                        paymentDescription.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.description.rawValue
                        paymentDetailsLayout.configuration.paymentDescription = paymentDescription

                        var paymentRoutingConfig = InternationalLayouts.ViewConfigurators.PaymentRouting()

                        let countryNameHandler: (String) -> (String?) = { code in
                            Locale.autoupdatingCurrent.localizedString(forRegionCode: code)
                        }

                        paymentRoutingConfig.configuration.correspondentBankAddress.countryPicker.countryNameHandler = countryNameHandler
                        paymentRoutingConfig.configuration.correspondentBankAddress.countryPicker.countryFlagHandler = currencyFlagHandler

                        paymentRoutingConfig.configuration.intermediaryBankAddress.countryPicker.countryNameHandler = countryNameHandler
                        paymentRoutingConfig.configuration.intermediaryBankAddress.countryPicker.countryFlagHandler = currencyFlagHandler

                        paymentDetailsLayout.configuration.paymentRouting = paymentRoutingConfig

                        return paymentDetailsLayout
                    }

                    step.didInitiate = { (navigation, paymentModel) in
                        return InternationalLayouts.PaymentDetailsStep.build(with: step,
                                                                             omnipaymentsNavigation: navigation,
                                                                             paymentModel: paymentModel)
                    }

                    step.didCompleteV2 = { (navigation, paymentModel, viewController, _) in
                        let completion: (Result<OmniPayment.PaymentOrderValidationResponse, OmniPayments.Error>) -> Void = { result in
                            
                            paymentModel.warnings.removeAll()
                            
                            if case let .success(response) = result, let warnings = response.warnings {
                                paymentModel.warnings = warnings
                            }

                            let nextStep = config.steps[Steps.review.rawValue]

                            if let routingFunction = nextStep.didInitiate {
                                let nextViewController = routingFunction(navigation, paymentModel)
                                viewController.navigationController?.pushViewController(nextViewController, animated: true)
                            }
                            
                        }

                        navigation.validate(InternationalPaymentOrder(with: paymentModel), completion: completion)
                    }

                    return step
                }(),
                InternationalPayment.reviewStep
            ]

            return config
        }()

        return internationalPayment
    }()

    static func beneficiaryStepLayout() -> BeneficiaryStepLayout {
        
        let countryNameHandler: (String) -> (String?) = {
            Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
        }
        let countryFlagHandler: (String) -> (UIImage?) = { Flag(countryCode: $0)?.originalImage }

        //Name TextInput
        let name = localized("omniPayments.paymentRouting.nameLabel")()
        let nameInputConfig = BeneficiaryStepLayout.TextInputConfiguration(primaryLabel: name)

        //Account number TextInput
        let accountNumber = localized("omniPayments.beneficiaryAccount.accountNumber.BBAN")()
        let accountNumberInputConfig = BeneficiaryStepLayout.TextInputConfiguration(primaryLabel: accountNumber)

        //Bank name TextInput
        let bankName = localized("omniPayments.beneficiaryAccount.bankName")()
        let optional = localized("omniPayments.beneficiaryAccount.optional")()
        let bankNameInputConfig = BeneficiaryStepLayout.TextInputConfiguration(
            primaryLabel: bankName,
            secondaryLabel: optional)

        //Bank Swift / BIC TextInput
        let swiftCode = localized("omniPayments.paymentRouting.swiftCodeLabel")()
        let bankSwiftBICInputConfig = BeneficiaryStepLayout.TextInputConfiguration(primaryLabel: swiftCode)

        //Beneficiary Address
        let beneficiaryCountryPickerConfig = BeneficiaryStepLayout.SanctionedCountriesPickerConfiguration(
            strings: SanctionedCountriesPicker.Strings(),
            isSearchEnabled: { return true },
            countryFlagHandler: countryFlagHandler,
            countryNameHandler: countryNameHandler)

        var beneficiaryAddressInputStrings = AddressInput.Configuration.Strings()
        beneficiaryAddressInputStrings.newAddressTitle = localized("omniPayments.address.newBeneficiaryAddressTitle")()
        beneficiaryAddressInputStrings.editAddressTitle = localized("omniPayments.address.editAddressTitle")()
        var beneficiaryAddressConfig = BeneficiaryStepLayout.AddressInputConfiguration(
            strings: beneficiaryAddressInputStrings,
            countryPicker: beneficiaryCountryPickerConfig)
        beneficiaryAddressConfig.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.address.rawValue

        // Bank Address
        let bankCountryPickerConfig = BeneficiaryStepLayout.SanctionedCountriesPickerConfiguration(
            strings: SanctionedCountriesPicker.Strings(),
            isSearchEnabled: { return true },
            countryFlagHandler: countryFlagHandler,
            countryNameHandler: countryNameHandler)

        var bankAddressInputStrings = AddressInput.Configuration.Strings()
        bankAddressInputStrings.newAddressTitle = localized("omniPayments.address.addAddress")()
        bankAddressInputStrings.editAddressTitle = localized("omniPayments.address.bankAddress")()

        var bankAddressConfig = BeneficiaryStepLayout.AddressInputConfiguration(
            strings: bankAddressInputStrings,
            countryPicker: bankCountryPickerConfig)
        bankAddressConfig.analyticsLabel = OmniPayments.ObservabilityTracking.Screen.bankAddress.rawValue

        //Country Picker
        var countriesPickerConfig = BeneficiaryStepLayout.SanctionedCountriesPickerConfiguration(
            strings: SanctionedCountriesPicker.Strings(),
            isSearchEnabled: { return true },
            countryFlagHandler: countryFlagHandler,
            countryNameHandler: countryNameHandler)
        
        let beneficiaryStepLayoutConfig = BeneficiaryStepLayout.Configuration(
            strings: BeneficiaryStepLayout.Strings(),
            countryPicker: countriesPickerConfig,
            nameTextInput: nameInputConfig,
            accountNumberTextInput: accountNumberInputConfig,
            beneficiaryAddress: beneficiaryAddressConfig,
            bankAddress: bankAddressConfig,
            bankNameTextInput: bankNameInputConfig,
            bankSwiftBICTextInput: bankSwiftBICInputConfig)

        return BeneficiaryStepLayout(configuration: beneficiaryStepLayoutConfig)
    }
}
