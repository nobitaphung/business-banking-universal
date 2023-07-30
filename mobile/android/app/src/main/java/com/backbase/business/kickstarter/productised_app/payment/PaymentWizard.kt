package com.backbase.business.kickstarter.productised_app.payment

import android.content.Context
import androidx.annotation.IdRes
import androidx.navigation.NavController
import com.backbase.android.business.journey.common.extensions.getDimensionFromAttr
import com.backbase.android.business.journey.common.extensions.navigateSafe
import com.backbase.android.business.journey.omnipayments.configuration.*
import com.backbase.android.business.journey.omnipayments.configuration.AccountFetchParameters.BusinessFunction
import com.backbase.android.business.journey.omnipayments.configuration.international.PaymentChargeBearer
import com.backbase.android.business.journey.omnipayments.configuration.international.PaymentPriority
import com.backbase.android.business.journey.omnipayments.model.*
import com.backbase.android.business.journey.omnipayments.model.OmniPayment
import com.backbase.android.business.journey.omnipayments.model.OmniPaymentResult
import com.backbase.android.business.journey.omnipayments.model.PaymentAccount
import com.backbase.android.business.journey.omnipayments.model.SanctionedEntry
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.CREATE_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.EDIT_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.INTERNATIONAL
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_ORIGINATOR
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Bank
import com.backbase.android.business.journey.omnipayments.model.paymentoption.ChargeBearer
import com.backbase.android.business.journey.omnipayments.model.paymentoption.CounterpartyIdentification
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Currency
import com.backbase.android.business.journey.omnipayments.model.paymentoption.PaymentOption
import com.backbase.android.business.journey.omnipayments.model.paymentoption.PostPaymentOptionRequest
import com.backbase.android.business.journey.omnipayments.model.paymentoption.PostPaymentOptionResponse
import com.backbase.android.business.journey.omnipayments.model.paymentoption.PostalAddress
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Schedule
import com.backbase.android.business.journey.omnipayments.model.paymentoption.TitleDescriptionModel
import com.backbase.android.business.journey.omnipayments.model.usecase.*
import com.backbase.android.business.journey.omnipayments.model.usecase.paymentorderoptions.SanctionedCountry
import com.backbase.android.business.journey.omnipayments.model.usecase.response.GetPaymentOrderResponse
import com.backbase.android.business.journey.omnipayments.state.CallState
import com.backbase.android.business.journey.omnipayments.util.BankCodeLabelUtil
import com.backbase.android.business.journey.omnipayments.util.FormatterUtil.getFormattedAccountNumber
import com.backbase.android.business.journey.omnipayments.validation.ValidationResult
import com.backbase.android.business.journey.omnipayments.view.epoxy.model.*
import com.backbase.android.business.journey.omnipayments.view.epoxy.viewdata.AccountImage
import com.backbase.android.business.journey.omnipayments.view.epoxy.viewdata.FromAccountViewData
import com.backbase.android.business.journey.omnipayments.view.epoxy.viewdata.ToAccountViewData
import com.backbase.android.business.journey.omnipayments.view.util.DateFormatter
import com.backbase.android.common.utils.formatter.SepaFormatter
import com.backbase.android.core.errorhandling.ErrorCodes
import com.backbase.android.design.amount.AmountFormat
import com.backbase.android.design.state.template.LoadingFailed
import com.backbase.android.design.state.template.NoInternetConnection
import com.backbase.android.utils.net.response.Response
import com.backbase.business.kickstarter.productised_app.CountryResolver.buildCountryImageResolver
import com.backbase.business.kickstarter.productised_app.CountryResolver.buildCountryNameResolver
import com.backbase.business.kickstarter.productised_app.R
import com.backbase.business.kickstarter.productised_app.defaultBankCodeKeyLabel
import com.backbase.business.kickstarter.productised_app.payment.shared.PaymentReviewScreenTextProvider
import com.backbase.deferredresources.DeferredColor
import com.backbase.deferredresources.DeferredDrawable
import com.backbase.deferredresources.DeferredText
import com.backbase.deferredresources.text.resolveToString
import com.mynameismidori.currencypicker.ExtendedCurrency
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.FormatStyle
import java.util.*

/**
 * Created by Backbase R&D B.V on 19/05/2021
 * Payment wizard configurations
 */
object PaymentWizard {

    private const val AVATAR_ADDITION_KEY = "avatar"
    private const val ACCOUNT_NUMBER_ADDITION_KEY = "account-number"
    private const val ACCOUNT_BANK_CODE_KEY = "bank-code"
    private const val ACCOUNT_EXTRA_BENEFICIARY_SWIFT = "extra-beneficiary_swift"
    private const val ACCOUNT_EXTRA_BENEFICIARY_BANK_NAME = "extra-beneficiary_bank_name"
    private const val IBAN = "IBAN"
    private const val BBAN = "BBAN"

    private val businessFunctions = listOf(
        BusinessFunction.PRODUCT_SUMMARY,
        BusinessFunction.SEPA_CT,
        BusinessFunction.US_DOMESTIC_WIRE,
        BusinessFunction.US_FOREIGN_WIRE,
    ).joinToString(separator = ",")

    private var selectedPaymentType: String = ""
    private var selectedTransferFee: Currency? = null

    val payment = Payment {
        icon = DeferredDrawable.Resource(R.drawable.ic_baseline_add_payment)
        title = DeferredText.Resource(R.string.payment_wizard)
        subtitle = DeferredText.Resource(R.string.payment_wizard_desc)
        routerName = "payment_wizard"
        configuration = OmniPaymentsConfiguration {
            navigationGraph = R.navigation.navigation_payment_wizard
            shouldPreloadSanctionedCountries = true
            steps = Steps {
                +Step {
                    id = R.id.fromAccount
                    analyticsLabel = { SELECT_ORIGINATOR }
                    subTitle = DeferredText.Resource(R.string.from_account)
                    layoutBuilder = { context, fragmentManager, navController, omniPayment ->
                        AccountsListLayout {
                            enableSearch = true
                            accountFetchParameters = AccountFetchParameters {
                                businessFunction = businessFunctions
                                resourceName = AccountFetchParameters.ResourceName.PAYMENTS
                                accountType = AccountFetchParameters.AccountType.UNSPECIFIED
                                privilege = AccountFetchParameters.Privilege.CREATE
                                accountType = AccountFetchParameters.AccountType.DEBIT
                            }
                            text = AccountsListTextConfiguration {
                                searchHint = DeferredText.Resource(R.string.accounts_search)
                            }
                            accountMapper = AccountMapper { }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            navController.navigateSafe(R.id.action_fromAccount_to_transferTo)
                        }
                }

                fun defaultSchedule() = Schedule {
                    transferFrequency = Schedule.TransferFrequency.ONCE
                    on = 1
                    startDate = DateFormatter.getBankLocaleDate()
                    every = Schedule.Every._2
                }

                var temporarySchedule: Schedule? = null

                +Step {
                    id = R.id.transferTo
                    analyticsLabel = { SELECT_BENEFICIARY }
                    subTitle = DeferredText.Resource(R.string.transfer_to)
                    layoutBuilder = { _, _, navController, omniPaymentModel ->
                        BeneficiarySelectionLayout {
                            accountsStepLayout = TabbedAccountsListLayout {
                                accountFetchParameters = AccountFetchParameters {
                                    businessFunction = businessFunctions
                                    resourceName = AccountFetchParameters.ResourceName.PAYMENTS
                                    accountType = AccountFetchParameters.AccountType.CREDIT
                                    privilege = AccountFetchParameters.Privilege.CREATE
                                }
                                shouldLoadSanctionedCountries = true
                                analyticsLabel = "select_beneficiary_own_accounts"
                                filter = { productSummary ->
                                    productSummary.id != omniPaymentModel.fromAccount.accountId
                                }
                            }
                            contactsStepLayout = TabbedContactsListLayout {
                                text = ContactsListTextConfiguration {
                                    listButtonText = DeferredText.Resource(R.string.add_beneficiary)
                                }
                                image = ContactsListImageConfiguration {
                                    listButtonImage =
                                        DeferredDrawable.Resource(R.drawable.ic_outline_person_add_24)
                                }
                                listButton = { isVisible, onClick ->
                                    isVisible(true)
                                    onClick {
                                        omniPaymentModel.toAccount = PaymentAccount()
                                        navController.navigateSafe(R.id.action_transferTo_to_editBeneficiary)
                                    }
                                }
                                analyticsLabel = "select_beneficiary_contacts"
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            handleBankBranchCode(omniPaymentModel)
                            temporarySchedule = defaultSchedule()
                            if (omniPaymentModel.toAccount.isOwnAccount || shouldSkipBeneficiaryDetailsStep(
                                    omniPaymentModel,
                                    MandatoryBeneficiaryExtraFields()
                                )
                            ) {
                                navController.navigateSafe(R.id.action_transferTo_to_paymentDetails)
                            } else {
                                navController.navigateSafe(R.id.action_transferTo_to_editBeneficiary)
                            }

                        }
                }

                +Step {
                    id = R.id.newBeneficiary
                    analyticsLabel = { omniPayment ->
                        if (omniPayment.toAccount.accountName.isBlank() && omniPayment.toAccount.contactName.isBlank())
                            CREATE_BENEFICIARY
                        else
                            EDIT_BENEFICIARY
                    }
                    title = DeferredText.Resource(R.string.beneficiary_details)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        val spacerSmall = context.getDimensionFromAttr(R.attr.spacerSmall)
                        val spacerXSmall = context.getDimensionFromAttr(R.attr.spacerXSmall)
                        val spacerLarge = context.getDimensionFromAttr(R.attr.spacerLarge)
                        val defaultMarginDp = ViewMargin(spacerSmall, 0, spacerSmall, 0)

                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton =
                                    DeferredText.Resource(R.string.continue_label)
                            }

                            val initials = getInitials(omniPaymentModel.toAccount.contactName) ?: ""

                            +asAdditionV2(
                                omniPaymentModel,
                                AVATAR_ADDITION_KEY,
                                AvatarView_().apply {
                                    id(1L)
                                    margin = ViewMargin(0, spacerLarge, 0, spacerLarge)
                                    initials(initials)
                                })

                            val countryPickerConfiguration = SanctionedEntryPickerConfiguration {
                                text = SanctionedEntriesPickerTextConfiguration {
                                    inputLabel = DeferredText.Resource(R.string.country_label)
                                }
                                isSearchEnabled = { true }
                                image = ListImageConfiguration {}
                                countryNameResolver = buildCountryNameResolver()
                                countryImageResolver = buildCountryImageResolver(context)
                                analyticsLabel = "country_picker"
                            }

                            +SanctionedCountriesPicker_().apply {
                                id(2L)
                                val textConfig = countryPickerConfiguration.text
                                text(textConfig)
                                margin(defaultMarginDp)
                                submitValidators(listOf { value ->
                                    val label = textConfig.inputLabel?.resolve(context)
                                    val errorFormat =
                                        DeferredText.Resource(R.string.requirement_error_label)
                                            .resolveToString(context)

                                    val isCountrySupportedBool =
                                        isCountrySupported(omniPaymentModel)

                                    buildValidationResult(
                                        validationResult = value.isNotBlank() && isCountrySupportedBool,
                                        errorMessage = when {
                                            value.isNullOrEmpty() -> DeferredText.Constant(
                                                String.format(
                                                    errorFormat,
                                                    label
                                                )
                                            )
                                            !isCountrySupportedBool ->
                                                DeferredText.Constant(
                                                    String.format(
                                                        DeferredText.Resource(R.string.payment_wizard_beneficiary_unsupportedCountryErrorLabel)
                                                            .resolveToString(context),
                                                        value
                                                    )
                                                )
                                            else -> {
                                                DeferredText.Constant(
                                                    String.format(
                                                        errorFormat,
                                                        label
                                                    )
                                                )
                                            }
                                        }
                                    )
                                })

                                analyticsLabel("country_picker")
                                countryNameResolver(countryPickerConfiguration.countryNameResolver)
                                countryImageResolver(countryPickerConfiguration.countryImageResolver)
                                errorUiDataMapper(countryPickerConfiguration.errorUiDataMapper)
                                omniPaymentModel.toAccount.bankCountryIsoCode?.let { iso ->
                                    initialValue {
                                        SanctionedEntry {
                                            isoCode = iso
                                            name =
                                                countryPickerConfiguration.countryNameResolver(iso)
                                            image =
                                                countryPickerConfiguration.countryImageResolver(iso)
                                        }
                                    }
                                }
                                onCountrySelected { entry ->
                                    val countryIsoCode = entry.isoCode
                                    val oldAddress = omniPaymentModel.toAccount.bankPostalAddress
                                    omniPaymentModel.toAccount.bankPostalAddress = PostalAddress {
                                        addressLine1 = oldAddress?.addressLine1
                                        addressLine2 = oldAddress?.addressLine2
                                        streetName = oldAddress?.streetName
                                        postCode = oldAddress?.postCode
                                        town = oldAddress?.town
                                        countrySubDivision = oldAddress?.countrySubDivision
                                        country = countryIsoCode
                                        additions = oldAddress?.additions
                                    }
                                    updateRegexValidator(context, countryIsoCode, omniPaymentModel)
                                    updateBankCode(
                                        context,
                                        countryIsoCode,
                                        omniPaymentModel,
                                        defaultBankCodeKeyLabel
                                    )
                                    shouldDisplayExtraBeneficiaryDetails(
                                        omniPaymentModel,
                                        countryIsoCode
                                    )
                                    updateBeneficiarySwiftAndAddValidation(omniPaymentModel, countryIsoCode, context)
                                }
                            }

                            +InlineTextInput_().apply {
                                id(3L)
                                margin(defaultMarginDp)
                                initialInput(omniPaymentModel.toAccount.contactName)
                                primaryLabel(DeferredText.Resource(R.string.beneficiary_account_name))
                                submitValidators(listOf { value ->
                                    val label = primaryLabel?.resolve(context)
                                    val errorFormat =
                                        DeferredText.Resource(R.string.requirement_error_label)
                                            .resolveToString(context)
                                    buildValidationResult(
                                        value.isNotBlank(),
                                        DeferredText.Constant(String.format(errorFormat, label))
                                    )
                                })
                                onInputChange { name ->
                                    beneficiaryNameChanged(name, omniPaymentModel)
                                }
                            }

                            +TextView_().apply {
                                id(4L)
                                margin(ViewMargin(spacerSmall, spacerXSmall, spacerSmall, spacerSmall))
                                textValue {
                                    DeferredText.Resource(R.string.account_info)
                                        .resolveToString(context)
                                }
                                textAppearance(R.attr.textAppearanceHeadline6)
                            }

                            val accountNumberRegexPattern = omniPaymentModel.sanctionedCountries
                                .firstOrNull { it.country == omniPaymentModel.toAccount.bankCountryIsoCode }
                                ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_NUMBER_ADDITION_KEY }?.regex

                            +asAdditionV2(
                                omniPaymentModel,
                                ACCOUNT_NUMBER_ADDITION_KEY,
                                InlineTextInput_().apply {
                                    id(5L)
                                    margin(defaultMarginDp)
                                    initialInput(getAccountNumber(omniPaymentModel.toAccount))
                                    primaryLabel(DeferredText.Resource(R.string.beneficiary_account_number_BBAN))
                                    submitValidators(listOf { value ->
                                        val label = primaryLabel?.resolve(context)
                                        val errorFormat =
                                            DeferredText.Resource(R.string.requirement_error_label)
                                                .resolveToString(context)
                                        val regexErrorFormat =
                                            DeferredText.Resource(R.string.regex_error_label)
                                                .resolveToString(context)
                                        buildValidationResult(
                                            validationResult = accountNumberRegexPattern?.let {
                                                Regex(it.replace("/", "")).matches(value)
                                            } ?: value.isNotBlank(),
                                            errorMessage = when {
                                                value.isBlank() -> DeferredText.Constant(
                                                    String.format(errorFormat, label)
                                                )
                                                accountNumberRegexPattern != null -> DeferredText.Constant(
                                                    String.format(regexErrorFormat, label)
                                                )
                                                else -> DeferredText.Constant(
                                                    String.format(errorFormat, label)
                                                )
                                            }
                                        )
                                    })
                                    onInputChange { accountNumber ->
                                        val accountFormat = omniPaymentModel.sanctionedCountries
                                            .firstOrNull { it.country == omniPaymentModel.toAccount.bankCountryIsoCode }
                                            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_NUMBER_ADDITION_KEY }?.format
                                            ?: BBAN

                                        if (accountFormat == BBAN) {
                                            omniPaymentModel.toAccount.bban =
                                                accountNumber.toString()
                                            omniPaymentModel.toAccount.iban = ""
                                        } else {
                                            omniPaymentModel.toAccount.iban =
                                                accountNumber.toString()

                                            omniPaymentModel.toAccount.bban = ""
                                        }
                                    }
                                })

                            val bankCodeRegexPattern = omniPaymentModel.sanctionedCountries
                                .firstOrNull { it.country == omniPaymentModel.toAccount.bankCountryIsoCode }
                                ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_BANK_CODE_KEY }?.regex

                            +asAdditionV2(
                                omniPaymentModel,
                                ACCOUNT_BANK_CODE_KEY,
                                InlineTextInput_().apply {
                                    id(5L)
                                    margin(defaultMarginDp)
                                    initialInput(omniPaymentModel.toAccount.bankCode)
                                    primaryLabel(DeferredText.Resource(R.string.beneficiary_bank_code_routing_number_US))
                                    submitValidators(listOf { value ->
                                        val label = primaryLabel?.resolve(context)
                                        val errorFormat =
                                            DeferredText.Resource(R.string.requirement_error_label)
                                                .resolveToString(context)
                                        val regexErrorFormat =
                                            DeferredText.Resource(R.string.regex_error_label)
                                                .resolveToString(context)
                                        buildValidationResult(
                                            validationResult = bankCodeRegexPattern?.let {
                                                Regex(it.replace("/", "")).matches(value)
                                            } ?: value.isNotBlank(),
                                            errorMessage = when {
                                                value.isBlank() -> DeferredText.Constant(
                                                    String.format(errorFormat, label)
                                                )
                                                bankCodeRegexPattern != null -> DeferredText.Constant(
                                                    String.format(regexErrorFormat, label)
                                                )
                                                else -> DeferredText.Constant(
                                                    String.format(errorFormat, label)
                                                )
                                            }
                                        )
                                    })
                                    onInputChange { bankCode ->
                                        omniPaymentModel.toAccount.bankCode = bankCode.toString()
                                    }
                                    shouldBeVisible { false }
                                })

                            // Check if swift field is initially visible
                            val isExtraFieldsInitiallyVisible =
                                shouldDisplayExtraBeneficiaryDetails(
                                    omniPaymentModel,
                                    omniPaymentModel.toAccount.bankCountryIsoCode
                                )

                            // Swift/BIC code field
                            val swiftCodeTitle =
                                DeferredText.Resource(R.string.beneficiary_bank_code_swiftBicCode)

                            val BANK_SWIFT_CODE_REGEX = "^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\$"

                            +asAdditionV2(
                                omniPaymentModel,
                                ACCOUNT_EXTRA_BENEFICIARY_SWIFT,
                                InlineTextInput_().apply {
                                    id(3L)
                                    margin(defaultMarginDp)
                                    initialInput(omniPaymentModel.toAccount.bankSwift)
                                    primaryLabel(swiftCodeTitle)
                                    focusLostValidators(
                                        listOf(
                                            generateRegexValidator(
                                                label = swiftCodeTitle.resolveToString(context),
                                                regex = BANK_SWIFT_CODE_REGEX,
                                                context = context
                                            )
                                        )
                                    ) /* more validators stores in this method [updateBeneficiarySwiftAndAddValidation] */
                                    onInputChange { swiftBIC ->
                                        omniPaymentModel.toAccount.bankSwift = swiftBIC.toString()
                                    }
                                    shouldBeVisible { isExtraFieldsInitiallyVisible }
                                })

                            // Bank name field

                            val bankNameLabel =
                                DeferredText.Resource(R.string.payment_wizard_beneficiary_bankName)
                            val bankNameSecondaryLabel =
                                DeferredText.Resource(R.string.payment_wizard_beneficiary_bankNameSecondaryTitle)
                            //change this field to false to make bank name mandatory
                            val isBankNameOptional =
                                MandatoryBeneficiaryExtraFields().isNameMandatory

                            +asAdditionV2(
                                omniPaymentModel,
                                ACCOUNT_EXTRA_BENEFICIARY_BANK_NAME,
                                InlineTextInput_().apply {
                                    id(3L)
                                    margin(defaultMarginDp)
                                    initialInput(omniPaymentModel.toAccount.bankName)
                                    primaryLabel(bankNameLabel)
                                    if (!isBankNameOptional) {
                                        secondaryLabel(bankNameSecondaryLabel)
                                    } else {
                                        submitValidators(listOf { value ->
                                            val label = primaryLabel?.resolve(context)
                                            val errorFormat =
                                                DeferredText.Resource(R.string.requirement_error_label)
                                                    .resolveToString(context)
                                            buildValidationResult(
                                                value.isNotBlank(),
                                                DeferredText.Constant(
                                                    String.format(
                                                        errorFormat,
                                                        label
                                                    )
                                                )
                                            )
                                        })
                                    }
                                    onInputChange { name ->
                                        omniPaymentModel.toAccount.bankName = name.toString()
                                    }
                                    shouldBeVisible { true }
                                })

                            omniPaymentModel.toAccount.bankCountryIsoCode?.let { countryIsoCode ->
                                updateRegexValidator(
                                    context = context,
                                    selectedCountry = countryIsoCode,
                                    omniPaymentModel = omniPaymentModel
                                )

                                updateBankCode(
                                    context = context,
                                    selectedCountry = countryIsoCode,
                                    omniPaymentModel = omniPaymentModel,
                                    labelTextConfiguration = defaultBankCodeKeyLabel
                                )
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            handleBankBranchCode(omniPaymentModel)
                            temporarySchedule = defaultSchedule()
                            navController.navigateSafe(R.id.action_newBeneficiary_to_paymentDetails)
                        }
                }

                +Step {
                    id = R.id.paymentDetails
                    analyticsLabel = { PaymentStep.TRANSFER_DETAILS }
                    title = DeferredText.Resource(R.string.payment_wizard_details_title)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        val spacerSmall = context.getDimensionFromAttr(R.attr.spacerSmall)
                        val spacerXSmall = context.getDimensionFromAttr(R.attr.spacerXSmall)

                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton =
                                    DeferredText.Resource(R.string.continue_label)
                            }
                            backgroundColor =
                                DeferredColor.Resource(R.color.transfer_details_background)

                            val amount = omniPaymentModel.fromAccount.availableFunds
                            val currency = omniPaymentModel.fromAccount.currencyCode
                            val amountFormat = AmountFormat().apply {
                                enableIsoFormat = true
                                locale = context.getSystemLocale()
                                currencyCode = currency
                            }

                            val fromAccountAmount = amountFormat.format(amount)

                            val fromAccount = FromAccountViewData {
                                name = omniPaymentModel.fromAccount.displayName
                                accountNumber =
                                    getDisplayAccountNumber(omniPaymentModel.fromAccount)
                                this.amount = fromAccountAmount
                                avatar = AccountImage.Icon(
                                    DeferredDrawable.Resource(omniPaymentModel.fromAccount.accountImage)
                                ).takeIf { omniPaymentModel.fromAccount.accountImage != 0 }
                            }

                            val amount2 = omniPaymentModel.toAccount.availableFunds
                            val currency2 = omniPaymentModel.toAccount.currencyCode
                            val amountFormat2 = AmountFormat().apply {
                                enableIsoFormat = true
                                locale = context.getSystemLocale()
                                currencyCode = currency2
                            }
                            val toAccountAmount = amountFormat2.format(amount2)

                            val detailedPreviewConfig =
                                DetailedTransferAccountPreviewViewConfiguration {
                                    countryNameResolver = buildCountryNameResolver()
                                    countryImageResolver = buildCountryImageResolver(context)
                                }

                            +DetailedTransferAccountPreviewView_().apply {
                                id(1L)
                                fromAccount(fromAccount)
                                toAccount(getToAccountViewData(omniPaymentModel,
                                    toAccountAmount.takeIf { omniPaymentModel.toAccount.contactName.isBlank() }))
                                configuration(detailedPreviewConfig)
                                margin(ViewMargin(spacerSmall, 0, spacerSmall, spacerSmall))
                            }

                            +AdaptiveAmountView_().apply {
                                id(2)
                                margin(ViewMargin(spacerSmall, 0, spacerSmall, spacerSmall))
                                text = AdaptiveAmountViewTextConfiguration {
                                    currencyPicker = SanctionedEntriesPickerTextConfiguration {
                                        title =
                                            DeferredText.Resource(R.string.sanctioned_currency_title)
                                    }
                                    youPayValue = {
                                        if (omniPaymentModel.amount == BigDecimal.ZERO) {
                                            ""
                                        } else {
                                            val totalAmount = omniPaymentModel.amount.divide(
                                                omniPaymentModel.exchangeRate,
                                                2,
                                                BigDecimal.ROUND_HALF_UP
                                            )

                                            val formattedAmount = AmountFormat().apply {
                                                enableIsoFormat = true
                                                locale = context.getSystemLocale()
                                                currencyCode =
                                                    omniPaymentModel.fromAccount.currencyCode
                                            }

                                            "≈ ${formattedAmount.format(totalAmount)}"
                                        }
                                    }
                                }
                                initialAmountValue(omniPaymentModel.amount)
                                shouldSelectorDisplayCurrencySymbol = { false }
                                initialCurrencyIso {
                                    omniPaymentModel.fromAccount.currencyCode
                                }
                                initialConversionRate { omniPaymentModel.exchangeRate }
                                initialConversion {
                                    val fromCode = omniPaymentModel.fromAccount.currencyCode
                                    val toCode = omniPaymentModel.toAccount.currencyCode
                                    val rate = omniPaymentModel.exchangeRate
                                    if (!fromCode.isNullOrEmpty() && !toCode.isNullOrEmpty()
                                        && rate != BigDecimal.ONE && rate != BigDecimal.ZERO
                                    ) {
                                        updateExchangeRate(
                                            fromCode,
                                            toCode,
                                            omniPaymentModel.exchangeRate
                                        )
                                    }
                                }
                                currencyPickerEnabled { true }
                                submitValidators(listOf(::isAmountRequired))
                                onValidatedAmount { value ->
                                    omniPaymentModel.amount = value
                                }
                                amountViewListener { iso, amount, rate ->
                                    omniPaymentModel.exchangeRate = rate
                                    omniPaymentModel.amount = amount
                                    omniPaymentModel.toAccount.currencyCode = iso
                                    if (rate != BigDecimal.ONE && rate != BigDecimal.ZERO) {
                                        setYouPayValue()
                                    }
                                }
                                currencyPickerAnalyticsLabel("currency_picker")
                                currencySearchEnabled { true }
                                currencyNameResolver {
                                    DeferredText.Constant(
                                        Locale(Locale.ROOT.language, it).displayCountry
                                    )
                                }
                                currencyImageResolver { iso ->
                                    val currencyByIso =
                                        ExtendedCurrency.getCurrencyByISO(iso) ?: null
                                    currencyByIso?.let { DeferredDrawable.Resource(it.flag) }
                                        ?: DeferredDrawable.Constant(null)
                                }
                                youPayLabelAppearance(R.attr.textAppearanceSubtitle1Medium)
                                youPayMargin(ViewMargin(spacerXSmall, spacerXSmall, 0, 0))
                                youPayValueAppearance(R.attr.textAppearanceSubtitle1Medium)
                            }

                            +PaymentScheduler_().apply {
                                id(3)
                                schedule {
                                    temporarySchedule ?: defaultSchedule()
                                }
                                onScheduleInput = { schedule ->
                                    temporarySchedule = schedule
                                }
                                margin(ViewMargin(spacerSmall, spacerSmall, spacerSmall, spacerSmall))
                            }

                            +TextInputCardView_().apply {
                                id(4)
                                margin = ViewMargin(spacerSmall, 0, spacerSmall, spacerSmall)
                                primaryLabel =
                                    DeferredText.Resource(R.string.payment_description_header)
                                maxInputLength = 140
                                requiredValue = false
                                isClearTextEndIconVisible = false
                                shouldValidateOnInput = true
                                allowedCharacters = "[a-zA-Z0-9=:;().&@,\\-*#'?\\/ ]+"
                                initialText = omniPaymentModel.description
                                hintOnInputField(DeferredText.Resource(R.string.payment_description_enter))
                                submitValidators(listOf { value ->
                                    val label = primaryLabel?.resolve(context)
                                    val regex = allowedCharacters
                                    val errorFormat =
                                        DeferredText.Resource(R.string.requirement_error_label)
                                            .resolveToString(context)
                                    val regexErrorFormat =
                                        DeferredText.Resource(R.string.regex_error_label)
                                            .resolveToString(context)
                                    val errorLimitMessage =
                                        DeferredText.Resource(R.string.description_field_limit_message)
                                            .resolveToString(context)
                                    val isValueValid =
                                        (regex.let { Regex(it.replace("/", "")).matches(value) })
                                    val isValueBiggerThenLimit = value.length > maxInputLength
                                    val validateEmptyFieldIfValueRequired = if (requiredValue) {
                                        value.isNotEmpty() && !isValueBiggerThenLimit
                                    } else {
                                        value.isEmpty()
                                    }

                                    buildValidationResult(
                                        validationResult = validateEmptyFieldIfValueRequired || isValueValid && !isValueBiggerThenLimit,
                                        errorMessage = when {
                                            value.isBlank() -> DeferredText.Constant(
                                                String.format(errorFormat, label)
                                            )
                                            (value.length > maxInputLength) -> DeferredText.Constant(
                                                String.format(errorLimitMessage, label)
                                            )
                                            else -> DeferredText.Constant(
                                                String.format(regexErrorFormat, label)
                                            )
                                        }
                                    )
                                })
                                onValidatedInput { input ->
                                    omniPaymentModel.description = input
                                }
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, _ ->
                            val identification = Identification {
                                identification = omniPaymentModel.fromAccount.accountId
                                schemeName = SchemeNames.ID
                                additions = omniPaymentModel.fromAccount.additions
                            }

                            val amountInstructed = Currency {
                                amount = omniPaymentModel.amount.toString()
                                currencyCode = omniPaymentModel.toAccount.currencyCode
                            }

                            val scheme: SchemeNames
                            val toAccount: String

                            if (omniPaymentModel.toAccount.isOwnAccount) {
                                scheme = SchemeNames.ID
                                toAccount = omniPaymentModel.toAccount.accountId
                            } else if (omniPaymentModel.toAccount.iban.isBlank()) {
                                scheme = SchemeNames.BBAN
                                toAccount = omniPaymentModel.toAccount.bban
                            } else {
                                scheme = SchemeNames.IBAN
                                toAccount = omniPaymentModel.toAccount.iban
                            }

                            val counterpartyBank = when {
                                omniPaymentModel.toAccount.bankSwift.isEmpty() -> Bank {
                                    bankBranchCode =
                                        omniPaymentModel.toAccount.bankCode.takeUnless { it.isBlank() }
                                    name =
                                        omniPaymentModel.toAccount.bankName.takeUnless { it.isBlank() }
                                    bankAddress = omniPaymentModel.toAccount.bankPostalAddress
                                }
                                else -> Bank {
                                    bic = omniPaymentModel.toAccount.bankSwift
                                    name =
                                        omniPaymentModel.toAccount.bankName.takeUnless { it.isBlank() }
                                    bankBranchCode =
                                        omniPaymentModel.toAccount.bankCode.takeUnless { it.isBlank() }
                                    bankAddress = omniPaymentModel.toAccount.bankPostalAddress
                                }
                            }

                            val payload = PostPaymentOptionRequest {
                                originatorAccount = identification
                                counterpartyAccount = CounterpartyIdentification {
                                    this.identification = toAccount
                                    this.schemeName = scheme
                                    this.bankBranchCode = counterpartyBank.bankBranchCode
                                }
                                instructedAmount = amountInstructed
                                counterpartyCountry = getToCountryISOCode(omniPaymentModel)
                                requestedExecutionDate = LocalDate.now()
                            }

                            @kotlin.Suppress("UNCHECKED_CAST")
                            val postPaymentOptions =
                                omniPaymentModel.anyAdditions["postPaymentOrder"]
                                        as (PostPaymentOptionRequest, onResult: (CallState<out PostPaymentOptionResponse>) -> Unit) -> Unit

                            postPaymentOptions(payload) { result ->
                                when (result) {
                                    is CallState.Error -> {
                                        omniPaymentModel.paymentOption = PaymentOption {
                                            request = payload
                                            error = result.errorResponse
                                        }
                                        navController.navigateSafe(R.id.action_paymentDetails_to_paymentOption)
                                    }
                                    is CallState.Success -> {
                                        val paymentOption = PaymentOption {
                                            request = payload
                                            response = result.data
                                        }

                                        omniPaymentModel.schedule = temporarySchedule ?: defaultSchedule()
                                        omniPaymentModel.paymentOption = paymentOption

                                        // Logic to show/hide the payment options step
                                        if (shouldShowPaymentOptions(omniPaymentModel.paymentOption?.response)) {
                                            navController.navigateSafe(R.id.action_paymentDetails_to_paymentOption)
                                        } else {
                                            val deliveryOption =
                                                saveDeliveryOptions(omniPaymentModel, result.data)
                                            deliveryOption?.let {
                                                selectedPaymentType = it.paymentType
                                                selectedTransferFee = it.priorityOption.transferFee
                                            }
                                            omniPaymentModel.paymentType = deliveryOption?.paymentType
                                            omniPaymentModel.instructionPriority = deliveryOption?.priorityOption?.instructionPriority
                                            if (shouldShowInternationalScreen()) {
                                                navController.navigateSafe(R.id.action_paymentDetails_to_paymentInternationalDetails)
                                            } else {
                                                validatePayment(omniPaymentModel) { omniPaymentResult ->
                                                    navController.navigateSafe(R.id.action_paymentDetails_to_review)
                                                }
                                            }
                                        }
                                    }
                                    else -> Unit
                                }
                            }
                        }
                }
                +Step {
                    id = R.id.paymentOption
                    analyticsLabel = { PaymentStep.PAYMENT_OPTIONS }
                    title = DeferredText.Resource(R.string.payment_options)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        PaymentOptionLayout {
                            errorState = { error ->
                                //Check for error code and provide your custom messages
                                generateErrorViewStateConfiguration(error)
                            }

                            paymentPriority = PaymentPriority {
                                submitValidators = listOf(::deliveryOptionsNotEmpty)
                            }

                            onPaymentOptionsDataSelected = { paymentOptionData ->
                                selectedPaymentType = paymentOptionData.paymentType
                                selectedTransferFee = paymentOptionData.priorityOption.transferFee
                                omniPaymentModel.paymentType = paymentOptionData.paymentType
                                omniPaymentModel.instructionPriority = paymentOptionData.priorityOption.instructionPriority
                            }

                            paymentChargeBearer = PaymentChargeBearer {
                                label =
                                    DeferredText.Resource(R.string.international_how_fees_are_paid)
                                hint =
                                    DeferredText.Resource(R.string.bb_opj_charge_bearer_hint)
                                title =
                                    DeferredText.Resource(R.string.international_how_fees_are_paid)
                                submitValidators = listOf { value: String ->
                                    chargeBearerNotEmpty(
                                        value = value,
                                        errorMessage = R.string.bb_opj_charge_bearer_error_message
                                    )
                                }
                                listMapper = { itemId ->
                                    when (itemId) {
                                        "OUR" -> TitleDescriptionModel {
                                            id = "OUR"
                                            title =
                                                DeferredText.Resource(R.string.international_charge_bearer_our_title)
                                            description =
                                                DeferredText.Resource(R.string.international_charge_bearer_our_desc)
                                        }
                                        "BEN" -> TitleDescriptionModel {
                                            id = "BEN"
                                            title =
                                                DeferredText.Resource(R.string.international_charge_bearer_ben_title)
                                            description =
                                                DeferredText.Resource(R.string.international_charge_bearer_ben_desc)
                                        }
                                        "SHA" -> TitleDescriptionModel {
                                            id = "SHA"
                                            title =
                                                DeferredText.Resource(R.string.international_charge_bearer_sha_title)
                                            description =
                                                DeferredText.Resource(R.string.international_charge_bearer_sha_desc)
                                        }
                                        else -> TitleDescriptionModel { }
                                    }
                                }
                                analyticsLabel = "charge_bearer"
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, _ ->
                            omniPaymentModel.purposeOfPaymentOmniPaymentStructured = null
                            if (shouldShowInternationalScreen()) {
                                navController.navigateSafe(R.id.action_paymentOption_to_paymentInternationalDetails)
                            } else {
                                validatePayment(omniPaymentModel) { omniPaymentResult ->
                                    navController.navigateSafe(R.id.action_paymentOption_to_review)
                                }
                            }
                        }

                }
                +Step {
                    id = R.id.paymentInternationalDetails
                    analyticsLabel = { INTERNATIONAL }
                    title =
                        DeferredText.Resource(R.string.payment_wizard_international_payment_details_title)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        val spacerSmall = context.getDimensionFromAttr(R.attr.spacerSmall)

                        StackLayout {
                            +PaymentPurpose_().apply {
                                id(0)
                                margin(ViewMargin(spacerSmall, 0, spacerSmall, spacerSmall))
                                sanctionedCountry =
                                    omniPaymentModel.sanctionedCountries.firstOrNull { sanctionedCountry ->
                                        sanctionedCountry.country == omniPaymentModel.toAccount.bankCountryIsoCode
                                    }

                                didChangeMessageText = {
                                    omniPaymentModel.messageToBank = it.toString()
                                }
                                didChangePurposeOfPayment = { purposeOfPayment ->
                                    omniPaymentModel.purposeOfPaymentOmniPaymentStructured =
                                        purposeOfPayment
                                }
                                initialPurposeOfPayment = {
                                    omniPaymentModel.purposeOfPaymentOmniPaymentStructured
                                }
                                initialMessageToBeneficiaryBank = {
                                    omniPaymentModel.messageToBank
                                }
                            }

                            +PaymentRoutingProvider_().apply {
                                id(1)
                                margin(ViewMargin(spacerSmall, 0, spacerSmall, spacerSmall))
                                val titleConfig = InlineTextInputConfiguration {
                                    primaryLabel =
                                        DeferredText.Resource(R.string.payment_routing_title)
                                    secondaryLabel =
                                        DeferredText.Resource(R.string.optional_indicator_label_capital)
                                }
                                val subtitleConfig = InlineTextInputConfiguration {
                                    primaryLabel =
                                        DeferredText.Resource(R.string.payment_routing_subtitle)
                                }

                                val correspondentSwitchConfig = InlineTextInputConfiguration {
                                    primaryLabel =
                                        DeferredText.Resource(R.string.payment_routing_correspondent_bank)
                                }

                                val intermediarySwitchConfig = InlineTextInputConfiguration {
                                    primaryLabel =
                                        DeferredText.Resource(R.string.payment_routing_intermediary_bank)
                                }

                                val correspondentBankAddressConfig =
                                    AddressInputPreviewConfiguration {
                                        text = AddressInputPreviewTextConfiguration {
                                            newAddressTitle =
                                                DeferredText.Resource(R.string.international_bank_address_new)
                                            editAddressTitle =
                                                DeferredText.Resource(R.string.international_bank_address_edit)
                                        }
                                        countryPicker = SanctionedEntryPickerConfiguration {
                                            countryNameResolver = buildCountryNameResolver()
                                            countryImageResolver =
                                                buildCountryImageResolver(context)
                                            analyticsLabel = "country_picker"
                                        }
                                        analyticsLabel =
                                            TrackerScreenName.ViewComponent.CORRESPONDENT_BANK_ADDRESS
                                    }
                                val intermediaryBankAddressConfig =
                                    AddressInputPreviewConfiguration {
                                        text = AddressInputPreviewTextConfiguration {
                                            newAddressTitle =
                                                DeferredText.Resource(R.string.international_bank_address_new)
                                            editAddressTitle =
                                                DeferredText.Resource(R.string.international_bank_address_edit)
                                        }
                                        countryPicker = SanctionedEntryPickerConfiguration {
                                            countryNameResolver = buildCountryNameResolver()
                                            countryImageResolver =
                                                buildCountryImageResolver(context)
                                            analyticsLabel = "country_picker"
                                        }
                                        analyticsLabel =
                                            TrackerScreenName.ViewComponent.INTERMEDIARY_BANK_ADDRESS
                                    }

                                val swiftCodeInputConfig = TextInputConfiguration {
                                    label = InlineTextInputConfiguration {
                                        primaryLabel =
                                            DeferredText.Resource(com.backbase.android.business.journey.omnipayments.R.string.payment_routing_bank_swift_label)
                                        secondaryLabel =
                                            DeferredText.Resource(com.backbase.android.business.journey.omnipayments.R.string.optional_indicator_label_capital)
                                    }
                                    regex = "^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\$"
                                }

                                val bankNameInputConfig = TextInputConfiguration {
                                    label = InlineTextInputConfiguration {
                                        primaryLabel =
                                            DeferredText.Resource(R.string.payment_routing_bank_name_label)
                                        secondaryLabel =
                                            DeferredText.Resource(R.string.optional_indicator_label_capital)
                                    }
                                }

                                configuration = PaymentRoutingConfiguration {
                                    showCorrespondentBank = true
                                    showIntermediaryBank = true
                                    correspondentBankMandatoryFields = BankInfoMandatoryFields {}
                                    intermediaryBankMandatoryFields = BankInfoMandatoryFields {}
                                    title = titleConfig
                                    subtitle = subtitleConfig
                                    inputCorrespondentAddress = correspondentBankAddressConfig
                                    inputIntermediaryAddress = intermediaryBankAddressConfig
                                    inputCorrespondentTitle = correspondentSwitchConfig
                                    inputIntermediaryTitle = intermediarySwitchConfig
                                    correspondentBankSwiftBICTextInput = swiftCodeInputConfig
                                    correspondentBankNameTextInput = bankNameInputConfig
                                    intermediaryBankSwiftBICTextInput = swiftCodeInputConfig
                                    intermediaryBankNameTextInput = bankNameInputConfig
                                }

                                this.fragmentManager = fragmentManager

                                initialCorrespondentBank = omniPaymentModel.correspondentBank

                                initialIntermediaryBank = omniPaymentModel.intermediaryBank

                                didUpdateCorrespondentBank = {
                                    omniPaymentModel.correspondentBank = it
                                }

                                didUpdateIntermediaryBank = {
                                    omniPaymentModel.intermediaryBank = it
                                }
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, _ ->
                            validatePayment(omniPaymentModel) { omniPaymentResult ->
                                navController.navigateSafe(R.id.action_paymentInternationalDetails_to_review)
                            }
                        }
                }

                // Review payment

                +Step {
                    id = R.id.review
                    analyticsLabel = { omniPayment ->
                        if (isOwnPayment(omniPayment.paymentType))
                            PaymentStep.PAYMENT_REVIEW_OWN
                        else if (isSepa(omniPayment.paymentType))
                            PaymentStep.PAYMENT_REVIEW_SEPA
                        else
                            PaymentStep.PAYMENT_REVIEW_INTERNATIONAL
                    }
                    title = DeferredText.Resource(R.string.review_payment)
                    layoutBuilder = { context, _, _, omniPayment ->
                        val spacerSmall = context.getDimensionFromAttr(R.attr.spacerSmall)
                        val spacerXSmall = context.getDimensionFromAttr(R.attr.spacerXSmall)

                        PaymentReviewLayout {
                            text = PaymentReviewTextConfiguration {
                                continueButton = DeferredText.Resource(R.string.custom_submit)
                            }
                            backgroundColor =
                                DeferredColor.Resource(R.color.transfer_details_background)
                            retryHandler = { onComplete ->
                                validatePayment(omniPayment, onComplete)
                            }

                            +PaymentTitle_().apply {
                                id(5)
                                margin(ViewMargin(spacerSmall, 0, spacerSmall, spacerXSmall))
                                paymentType(omniPayment.paymentType)
                                instructionPriority(omniPayment.instructionPriority)
                            }

                            +DuplicatePaymentWarning_().apply {
                                id(6)
                                margin(ViewMargin(spacerXSmall, 0, spacerXSmall, spacerXSmall))
                                omniPayment(omniPayment)
                                detailBottomSheet = { response ->
                                    mutableListOf(
                                        PaymentStatusView_().apply {
                                            id(0)
                                            status = response.status
                                            accountName = response.createdBy
                                            createdAt = response.createdAt
                                            textConfig = PaymentStatusTextConfiguration {

                                            }
                                        },
                                        TransferAccountReviewCardView_().apply {
                                            id(1)
                                            margin(ViewMargin(0, context.getDimensionFromAttr(R.attr.spacerSmall), 0, 0))
                                            fromLabel(DeferredText.Resource(R.string.transfer_account_from))
                                            fromAccountName(response.originator?.name)
                                            fromAccountNumber(response.originatorAccount?.identification?.identification)
                                            toLabel(DeferredText.Resource(R.string.transfer_account_to))
                                            toAccountName(response.transferTransactionInformation?.counterparty?.name)
                                            toAccountNumber(response.transferTransactionInformation?.counterpartyAccount?.identification?.identification)
                                        },
                                        TransferDetailsReviewView_().apply {
                                            id(2)
                                            margin(ViewMargin(0, context.getDimensionFromAttr(R.attr.spacerSmall), 0, 0))
                                            amount(Pair(
                                                context.getString(R.string.amount),
                                                response.transferTransactionInformation?.instructedAmount
                                            ))
                                            sections(listDuplicatePaymentReviewSections(context, response))
                                            amountFormatter(object : AmountFormat.CustomAmountFormatter {
                                                override fun format(currencyCode: String?, amount: BigDecimal): String {
                                                    return formatAmount(amount, currencyCode)
                                                }}
                                            )
                                        }
                                    )
                                }
                            }

                            val fromAccount = FromAccountViewData {
                                name = omniPayment.fromAccount.displayName
                                accountNumber =
                                    getDisplayAccountNumber(omniPayment.fromAccount)
                                avatar = AccountImage.Icon(
                                    DeferredDrawable.Resource(omniPayment.fromAccount.accountImage)
                                ).takeIf { omniPayment.fromAccount.accountImage != 0 }
                            }

                            +DetailedTransferAccountReviewView_().apply {
                                id(1L)
                                fromAccount(fromAccount)
                                toAccount(getToAccountViewData(omniPayment, null))
                                configuration(DetailedTransferAccountReviewViewConfiguration {
                                    countryNameResolver = buildCountryNameResolver()
                                    countryImageResolver = buildCountryImageResolver(context)
                                })
                                margin(ViewMargin(spacerXSmall, 0, spacerXSmall, spacerXSmall))
                            }
                            +TransferDetailsReviewView_().apply {
                                id(3)
                                margin(ViewMargin(spacerXSmall, 0, spacerXSmall, spacerXSmall))
                                amount(Pair(
                                    context.getString(R.string.amount),
                                    Currency {
                                        amount = omniPayment.amount.toString()
                                        currencyCode = omniPayment.toAccount.currencyCode
                                    }
                                ))
                                youPay(getReviewYouPay(context, omniPayment))
                                transferFee(getReviewTransferFee(context, omniPayment))
                                exchangeRate(getReviewExchangeRate(context, omniPayment))
                                conditions(getReviewConditions(context, omniPayment))
                                sections(listReviewSections(context, omniPayment))
                                amountFormatter(object : AmountFormat.CustomAmountFormatter {
                                    override fun format(currencyCode: String?, amount: BigDecimal): String {
                                        return formatAmount(amount, currencyCode)
                                    }}
                                )
                            }

                            +CenterTextView_().apply {
                                id(5)
                                textAppearance(R.style.TextAppearance_AppCompat_Caption)
                                textValue {
                                    context.getString(R.string.transfer_dates_timezone)
                                }
                            }
                        }
                    }
                    onComplete = { _, navController, createPayment, omniPayment, _ ->
                        val payload = PayloadBuilder(omniPayment)
                            .buildPaymentOrderPost()
                        if (omniPayment.canBeApproved) {
                            val showBottomSheet =
                                omniPayment.anyAdditions["submitBottomSheet"] as (PaymentOrderPost, onResult: (OmniPaymentResult) -> Unit) -> Unit
                            showBottomSheet(payload) {
                                navController.navigateSafe(R.id.action_review_to_result)
                            }
                        } else {
                            createPayment(payload) {
                                navController.navigateSafe(R.id.action_review_to_result)
                            }
                        }
                    }
                }

                +Step {
                    id = R.id.paymentConfirmationPdfFragment
                    analyticsLabel = { PaymentStep.PAYMENT_CONFIRMATION }
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        ProofOfPaymentLayout {

                        }
                    }
                }

            }
        }
    }

    private fun validatePayment(omniPayment: OmniPayment, onComplete: (OmniPaymentResult) -> Unit) {
        @Suppress("UNCHECKED_CAST")
        val validatePayment = omniPayment.anyAdditions["validatePayment"]
                as (PaymentOrderValidatePost, onResult: (OmniPaymentResult) -> Unit) -> Unit
        validatePayment(PayloadBuilder(omniPayment).buildPaymentOrdersValidatePost()) { omniPaymentResult ->
            onComplete(omniPaymentResult)
        }
    }

    private fun getToAccountViewData(omniPaymentModel: OmniPayment, toAccountAmount: String?): ToAccountViewData {
        val toInitials =
            getInitials(omniPaymentModel.toAccount.contactName) ?: ""
        val toAvatar: AccountImage? = when {
            omniPaymentModel.toAccount.accountImage != 0 -> AccountImage.Icon(
                DeferredDrawable.Resource(omniPaymentModel.toAccount.accountImage)
            )

            omniPaymentModel.toAccount.contactName.isNotBlank() && toInitials.isNotBlank() -> AccountImage.Initial(
                toInitials
            )

            else -> null
        }

        return ToAccountViewData {
            name = if (omniPaymentModel.toAccount.isOwnAccount) {
                omniPaymentModel.toAccount.displayName.takeUnless { it.isBlank() }
                    ?: omniPaymentModel.toAccount.contactAccountName
            } else {
                omniPaymentModel.toAccount.contactAccountName
            }
            accountNumber = getDisplayAccountNumber(omniPaymentModel.toAccount)
            this.amount = toAccountAmount
            countryISOCode = getToCountryISOCode(omniPaymentModel)
            avatar = toAvatar
        }
    }

    private fun getToCountryISOCode(omniPaymentModel: OmniPayment): String? {
        val defaultOwnAccountCountry = omniPaymentModel.sanctionedCountries
            .firstOrNull { it.isDefault == true }?.country

        return if (omniPaymentModel.toAccount.isOwnAccount) {
            defaultOwnAccountCountry
        } else {
            omniPaymentModel.toAccount.bankCountryIsoCode
        }
    }

    private fun formatAmount(amount: BigDecimal, currency: String?): String {
        return AmountFormat().apply {
            enableIsoFormat = true
            locale = Locale.forLanguageTag("NL") // "EUR 12,00" (with space)
            currencyCode = currency
        }.format(amount)
    }

    private fun getReviewYouPay(context: Context, omniPayment: OmniPayment): Pair<CharSequence, CharSequence>? {
        if (isInternational(omniPayment.paymentType)) {
            val from = omniPayment.fromAccount.currencyCode
            val to = omniPayment.toAccount.currencyCode
            val exchangeRate = omniPayment.exchangeRate

            if (from != to && exchangeRate != BigDecimal.ZERO) {
                return Pair(
                    context.getString(R.string.international_you_pay),
                    PaymentReviewScreenTextProvider.formatYouPay(context, omniPayment)
                )
            }
        }
        return null
    }

    private fun getReviewTransferFee(context: Context, omniPayment: OmniPayment): Pair<CharSequence, Currency>? {
        if (isInternational(omniPayment.paymentType) && omniPayment.transferFee != BigDecimal.ZERO) {
            return Pair(
                context.getString(R.string.transfer_fee),
                Currency {
                    amount = omniPayment.transferFee.toString()
                    currencyCode = omniPayment.transferFeeCurrencyCode
                })
        }
        else {
            return null
        }
    }

    private fun getReviewExchangeRate(context: Context, omniPayment: OmniPayment): String? {
        if (isInternational(omniPayment.paymentType))
            return PaymentReviewScreenTextProvider.formatExchangeRate(context, omniPayment)
        else
            return null
    }

    private fun getReviewConditions(context: Context, omniPayment: OmniPayment): String? {
        if (isInternational(omniPayment.paymentType))
            return PaymentReviewScreenTextProvider.formatPaymentConditions(context, omniPayment)
        else
            return null
    }

    private fun listReviewSections(context: Context, omniPayment: OmniPayment): List<Pair<CharSequence, CharSequence>> {
        val sections: MutableList<Pair<CharSequence, CharSequence>> = mutableListOf(
            Pair(
                DeferredText.Resource(R.string.execution_date).resolve(context),
                PaymentReviewScreenTextProvider.formatExecutionDate(context, omniPayment)
            ))

        sections.add(
            Pair(
                DeferredText.Resource(R.string.frequency).resolve(context),
                PaymentReviewScreenTextProvider.formatTransferFrequency(context, omniPayment)
            ))

        if (omniPayment.description.isNotEmpty()) {
            sections.add(
                Pair(
                    DeferredText.Resource(R.string.payment_desc_sc).resolve(context),
                    omniPayment.description
                ))
        }

        omniPayment.correspondentBank?.let {
            val subtitle = formatBank(context, it)
            if (subtitle.isNotEmpty()) {
                val title = DeferredText.Resource(R.string.international_correspondent_bank).resolve(context)
                sections.add(Pair(title, subtitle))
            }
        }

        omniPayment.intermediaryBank?.let {
            val subtitle = formatBank(context, it)
            if (subtitle.isNotEmpty()) {
                val title = DeferredText.Resource(R.string.international_intermediary_bank).resolve(context)
                sections.add(Pair(title, subtitle))
            }
        }

        omniPayment.purposeOfPaymentOmniPaymentStructured?.let { purpose ->
            val text = if (purpose.code.isNotEmpty()) {
                "${purpose.code} - ${purpose.description}"
            } else {
                purpose.freeText
            }

            if (text.isNotEmpty()) {
                sections.add(
                    Pair(
                        DeferredText.Resource(R.string.bb_payment_purpose_title).resolve(context),
                        text
                    )
                )
            }
        }

        if (omniPayment.messageToBank.isNotEmpty()) {
            sections.add(
                Pair(
                    DeferredText.Resource(R.string.message_to_beneficiary).resolve(context),
                    omniPayment.messageToBank
                ))
        }

        return sections
    }

    private fun listDuplicatePaymentReviewSections(context: Context, response: GetPaymentOrderResponse): List<Pair<CharSequence, CharSequence>> {
        val sections: MutableList<Pair<CharSequence, CharSequence>> = mutableListOf(
            Pair(
                DeferredText.Resource(R.string.execution_date).resolve(context),
                response.requestedExecutionDate?.let {
                    DateFormatter.formatDateString(it, FormatStyle.MEDIUM)
                } ?: ""
            )
        )

        response.transferTransactionInformation?.remittanceInformation?.content?.let { description ->
            if (description.isNotEmpty()) {
                sections.add(
                    Pair(
                        DeferredText.Resource(R.string.payment_desc_sc).resolve(context),
                        description
                    ))
            }
        }
        return sections
    }

    private fun formatBank(context: Context, bank: Bank): String {
        var subtitle = ""

        if (!bank.bic.isNullOrEmpty())
            subtitle += bank.bic

        if (!bank.name.isNullOrEmpty())
            subtitle += "\n" + bank.name

        val address = listOfNotNull(
            bank.bankAddress?.streetName,
            bank.bankAddress?.addressLine1,
            bank.bankAddress?.addressLine2,
            bank.bankAddress?.postCode,
            bank.bankAddress?.town,
            bank.bankAddress?.countrySubDivision,
            bank.bankAddress?.country
        ).joinToString()

        if (!address.isEmpty()) {
            subtitle += "\n" + address
        }

        if (!subtitle.isEmpty()) {
            val label = context.getString(R.string.international_swift_bic_label)
            subtitle = "$label $subtitle"
        }

        return subtitle
    }

    private fun generateErrorViewStateConfiguration(error: Response): ErrorViewStateConfiguration {
        val responseCode = error.responseCode
        return when (responseCode) {
            ErrorCodes.NO_INTERNET.code -> ErrorViewStateConfiguration {
                template = NoInternetConnection
                title =
                    DeferredText.Resource(R.string.no_internet_connection_title)
                description =
                    DeferredText.Resource(R.string.sanctioned_connection_error_subtitle)
                primaryButtonText =
                    DeferredText.Resource(R.string.sanctioned_connection_error_button)
            }

            else -> ErrorViewStateConfiguration {
                template = LoadingFailed
                title =
                    DeferredText.Resource(R.string.sanctioned_connection_error_title)
                description =
                    DeferredText.Resource(R.string.payment_wizard_payment_option_error_description)
                primaryButtonText =
                    DeferredText.Resource(R.string.sanctioned_connection_error_button)
            }
        }
    }

    private fun shouldShowInternationalScreen(): Boolean {
        return selectedPaymentType.contains("INTERNATIONAL")
    }

    private fun isInternational(paymentType: String?): Boolean {
        return "INTERNATIONAL_TRANSFER".equals(paymentType)
    }

    private fun isOwnPayment(paymentType: String?): Boolean {
        return "INTERNAL".equals(paymentType)
    }

    private fun isSepa(paymentType: String?): Boolean {
        return "SEPA_CREDIT_TRANSFER".equals(paymentType) or "SEPA_CT_CLOSED".equals(paymentType)
    }

    // Stores info about mandatory extra fields for beneficiary details
    data class MandatoryBeneficiaryExtraFields(
        val isSwiftMandatory: Boolean = true,
        val isNameMandatory: Boolean = false
    )

    // Checks whether selected account country is supported by sanctioned countries
    private fun isCountrySupported(omniPaymentModel: OmniPayment): Boolean {
        val country = omniPaymentModel.sanctionedCountries.firstOrNull { sanctionedCountry ->
            sanctionedCountry.country == omniPaymentModel.toAccount.bankCountryIsoCode
        }
        return country != null
    }

    private fun areAllBeneficiaryExtraFieldsValid(
        omniPaymentModel: OmniPayment,
        mandatoryExtraFields: MandatoryBeneficiaryExtraFields
    ): Boolean {
        var areAllExtraFieldsFilled = false
        if (shouldDisplayExtraBeneficiaryDetails(
                omniPaymentModel,
                omniPaymentModel.toAccount.bankCountryIsoCode
            )
        ) {
            val isSwiftNotEmpty = omniPaymentModel.toAccount.bankSwift.isNotEmpty()
            val isSwiftValid = mandatoryExtraFields.isSwiftMandatory || isSwiftNotEmpty
            areAllExtraFieldsFilled = isSwiftValid
        }
        return areAllExtraFieldsFilled
    }

    // Whether beneficiary details screen should display extra input fields
    // Equals to the reverse value of country's `isDefault` property
    private fun shouldDisplayExtraBeneficiaryDetails(
        omniPaymentModel: OmniPayment,
        countryIsoCode: String?
    ): Boolean {
        val country = omniPaymentModel.sanctionedCountries.firstOrNull { sanctionedCountry ->
            sanctionedCountry.country == countryIsoCode
        }
        return if (country != null) {
            country.isDefault != true
        } else {
            false
        }
    }

    // The logic on this function makes sure that:
    // - There are no missing fields
    // - Skipping the display of the edit beneficiary screen for own accounts
    // - Selected country is supported (if exists)
    // The logic within this function can be easily redefined as the user pleases
    private fun shouldSkipBeneficiaryDetailsStep(
        omniPaymentModel: OmniPayment,
        mandatoryExtraFields: MandatoryBeneficiaryExtraFields
    ): Boolean {
        if (omniPaymentModel.toAccount.isOwnAccount) return true

        val selectedCountry = omniPaymentModel.toAccount.bankCountryIsoCode
        val regexPattern = omniPaymentModel.sanctionedCountries
            .firstOrNull { it.country == selectedCountry }
            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_NUMBER_ADDITION_KEY }?.regex
        val accountNumber = getAvailableAccountNumber(
            omniPaymentModel.toAccount,
            omniPaymentModel.sanctionedCountries
        ).replace(" ", "")
        val isAccountNumberValid = regexPattern?.let {
            Regex(it.replace("/", "")).matches(accountNumber)
        } ?: accountNumber.isNotBlank()

        val isNameNotBlank = omniPaymentModel.toAccount.contactAccountName.isNotBlank()

        val isCountrySelected = !selectedCountry.isNullOrBlank()

        val isCountrySupported = isCountrySelected && isCountrySupported(omniPaymentModel)

        val isBankNameNotEmpty = omniPaymentModel.toAccount.accountName.isNotEmpty()
        val isBankNameValid = mandatoryExtraFields.isNameMandatory || isBankNameNotEmpty

        val isAllExtraFieldsFilled =
            areAllBeneficiaryExtraFieldsValid(omniPaymentModel, mandatoryExtraFields)

        return isAccountNumberValid && isNameNotBlank && isCountrySelected
                && isCountrySupported && isBankNameValid && isAllExtraFieldsFilled
    }

    private fun generateRegexValidator(label: String, regex: CharSequence, context: Context) =
        fun(input: CharSequence): ValidationResult {
            if (input.isNullOrEmpty())
                return ValidationResult.Valid
            return if (checkRegex(regex, input)) {
                ValidationResult.Valid
            } else {
                ValidationResult.Invalid(
                    DeferredText.Constant(
                        String.format(
                            DeferredText.Resource(R.string.regex_error_label)
                                .resolveToString(context),
                            label
                        )
                    )
                )
            }
        }

    private fun checkRegex(regex: CharSequence, input: CharSequence): Boolean =
        Regex(regex.toString().replace("/", "")).matches(input)

    private fun shouldShowPaymentOptions(data: PostPaymentOptionResponse?): Boolean {
        val optionsResponse = data?.options ?: return false
        var deliveryOptionsCount = 0
        var chargeBearersCount = 0
        optionsResponse.forEach { option ->
            option.paymentType ?: return@forEach
            option.priorityOptions ?: return@forEach

            option.priorityOptions?.forEach { priorityOption ->
                ++deliveryOptionsCount
                priorityOption.chargeBearer?.forEach { _ ->
                    ++chargeBearersCount
                }
            }
        }

        val haveMultipleDeliveryOptions = deliveryOptionsCount > 1
        val haveMultipleChargeBearer = chargeBearersCount > 1

        return haveMultipleDeliveryOptions || haveMultipleChargeBearer
    }

    private fun saveDeliveryOptions(
        omniPaymentModel: OmniPayment,
        data: PostPaymentOptionResponse
    ): PaymentOptionsData? {
        val paymentOptionsUseCaseModels = data.options.takeIf { it.isNotEmpty() } ?: return null
        val paymentOptionsUseCaseModel = paymentOptionsUseCaseModels.firstOrNull() ?: return null

        val paymentType = paymentOptionsUseCaseModel.paymentType ?: return null
        val priorityOption =
            paymentOptionsUseCaseModel.priorityOptions?.firstOrNull() ?: return null
        val instructionPriority = priorityOption.instructionPriority ?: return null
        val transferFee = priorityOption.transferFee

        val selectedDeliveryOption = "${paymentType}_${instructionPriority.name}"
        omniPaymentModel.deliveryOption = selectedDeliveryOption
        omniPaymentModel.priority = priorityOption
        omniPaymentModel.transferFee =
            transferFee?.amount?.let { BigDecimal(it) } ?: BigDecimal.ZERO
        omniPaymentModel.transferFeeCurrencyCode = transferFee?.currencyCode
        omniPaymentModel.chargeBearer = priorityOption.chargeBearer?.firstOrNull()?.value ?: ""

        return PaymentOptionsData {
            this.paymentType = paymentType
            this.priorityOption = priorityOption
        }
    }

    private fun getInitials(name: String?): String? {
        if (name.isNullOrBlank()) return null

        return name.trim().split(" ")
            .joinToString(separator = "") { it.first().toString().trim() }
            .take(2)
    }

    private fun getAccountNumber(paymentAccount: PaymentAccount): String {
        return when {
            paymentAccount.iban.isNotEmpty() -> SepaFormatter.format(paymentAccount.iban)
            paymentAccount.bban.isNotEmpty() -> paymentAccount.bban
            else -> ""
        }
    }

    private fun handleBankBranchCode(omniPaymentModel: OmniPayment) {
        if (omniPaymentModel.toAccount.isOwnAccount) return

        val bankCodeInputField = omniPaymentModel.sanctionedCountries
            .firstOrNull { it.country == omniPaymentModel.toAccount.bankCountryIsoCode }
            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_BANK_CODE_KEY }

        val shouldIncludeBankCode =
            (bankCodeInputField != null && bankCodeInputField.mandatory == true)

        if (!shouldIncludeBankCode) {
            omniPaymentModel.toAccount.bankCode = ""
        }
    }

    private fun getAvailableAccountNumber(
        paymentAccount: PaymentAccount,
        sanctionedCountries: List<SanctionedCountry>
    ): String {
        val selectedCountry = paymentAccount.bankCountryIsoCode
        var accountFormat = sanctionedCountries
            .firstOrNull { it.country == selectedCountry }
            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_NUMBER_ADDITION_KEY }?.format

        if (accountFormat == null) {
            accountFormat = if (paymentAccount.iban.isEmpty()) BBAN else IBAN
        }

        return when (accountFormat) {
            IBAN -> SepaFormatter.format(paymentAccount.iban)
            BBAN -> paymentAccount.bban
            else -> throw IllegalStateException("No valid identification number found")
        }
    }

    private fun getDisplayAccountNumber(model: PaymentAccount): String {
        val formattedBban =
            getFormattedAccountNumber(
                model.bban,
                SchemeNames.BBAN
            )
        val abaNumber = model.bankCode ?: ""
        val formattedABAPlusBBAN = "$abaNumber / $formattedBban"

        val formattedIban =
            getFormattedAccountNumber(
                model.iban,
                SchemeNames.IBAN
            )

        return if (model.iban.isBlank()) formattedABAPlusBBAN else formattedIban
    }

    private val PaymentAccount.isOwnAccount: Boolean
        get() = contactName.isBlank() && accountType.isNotBlank()

    // Take first non-null country iso code from valid properties, otherwise null
    // Current priorities of country iso code usage:
    // 1. Use country iso code stored in the bank address
    // 2. Use country iso code stored in the deprecated bank address
    private val PaymentAccount.bankCountryIsoCode: String?
        get() = bankPostalAddress?.country

    private fun beneficiaryNameChanged(name: CharSequence, omniPaymentModel: OmniPayment) {
        if (omniPaymentModel.toAccount.isOwnAccount) {
            omniPaymentModel.toAccount.accountName = name.toString().trim()
        } else {
            omniPaymentModel.toAccount.contactName = name.toString().trim()
        }
        (omniPaymentModel.anyAdditions[AVATAR_ADDITION_KEY] as AvatarView).apply {
            initials = getInitials(name.toString()) ?: ""
            update()
        }
    }

    private fun updateBeneficiarySwiftAndAddValidation(omniPaymentModel: OmniPayment, countryIsoCode: String, context: Context) {
        // Change to true to make SWIFT/BIC code mandatory
        val isSwiftMandatory =
            MandatoryBeneficiaryExtraFields().isSwiftMandatory

        (omniPaymentModel.anyAdditions[ACCOUNT_EXTRA_BENEFICIARY_SWIFT] as InlineTextInput).apply {
            this.shouldBeVisible =
                { shouldDisplayExtraBeneficiaryDetails(omniPaymentModel, countryIsoCode) }
            if (this.shouldBeVisible.invoke()) {
                this.submitValidators =  listOf { value ->
                    val label = primaryLabel?.resolve(context)
                    val errorFormat =
                        DeferredText.Resource(R.string.requirement_error_label)
                            .resolveToString(context)
                    buildValidationResult(
                        value.isNotBlank() || !isSwiftMandatory,
                        DeferredText.Constant(String.format(errorFormat, label))
                    )
                }
            } else {
                this.submitValidators = emptyList()
            }
            update()
        }
    }

    private fun updateRegexValidator(
        context: Context,
        selectedCountry: String,
        omniPaymentModel: OmniPayment
    ) {
        val regexPattern = omniPaymentModel.sanctionedCountries
            .firstOrNull { it.country == selectedCountry }
            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_NUMBER_ADDITION_KEY }?.regex

        (omniPaymentModel.anyAdditions[ACCOUNT_NUMBER_ADDITION_KEY] as InlineTextInput).apply {
            submitValidators = listOf { value ->
                val label = primaryLabel?.resolve(context)
                val errorFormat =
                    DeferredText.Resource(R.string.requirement_error_label)
                        .resolveToString(context)
                val regexErrorFormat =
                    DeferredText.Resource(R.string.regex_error_label)
                        .resolveToString(context)
                buildValidationResult(
                    validationResult = regexPattern?.let {
                        Regex(it.replace("/", "")).matches(value)
                    } ?: value.isNotBlank(),
                    errorMessage = when {
                        value.isBlank() -> DeferredText.Constant(
                            String.format(errorFormat, label)
                        )
                        regexPattern != null -> DeferredText.Constant(
                            String.format(regexErrorFormat, label)
                        )
                        else -> DeferredText.Constant(
                            String.format(errorFormat, label)
                        )
                    }
                )
            }
            update()
        }
    }

    private fun updateBankCode(
        context: Context,
        selectedCountry: String,
        omniPaymentModel: OmniPayment,
        labelTextConfiguration: Map<Pair<String, String>, DeferredText>
    ) {
        val bankCodeInputField = omniPaymentModel.sanctionedCountries
            .firstOrNull { it.country == selectedCountry }
            ?.inputFormSettings?.firstOrNull { it.key == ACCOUNT_BANK_CODE_KEY }

        val label = bankCodeInputField?.label
        val isApplicable = !(bankCodeInputField?.notApplicable ?: true)

        val regexPattern = bankCodeInputField?.regex
        val isMandatory = bankCodeInputField?.mandatory ?: false

        // Find localised label if any, or use default from backend if any
        val labelKey = label?.keys?.firstOrNull()
        val defaultLabel = label?.values?.firstOrNull()
        val deferredDefaultLabel = defaultLabel?.let { DeferredText.Constant(it) }
        val resolvedLabel = labelKey?.let {
            BankCodeLabelUtil.getBankCodeLabel(
                labelKey = it,
                selectedCountry = selectedCountry,
                defaultFallbackLabel = deferredDefaultLabel,
                labelTextConfiguration = labelTextConfiguration
            )
        }

        val isVisible = labelKey != null && defaultLabel != null && isApplicable
        (omniPaymentModel.anyAdditions[ACCOUNT_BANK_CODE_KEY] as InlineTextInput).apply {
            resolvedLabel?.let { primary -> primaryLabel = primary }
            shouldBeVisible = { isVisible }
            submitValidators = listOf { value ->
                val usedLabel = primaryLabel?.resolve(context)
                val errorFormat =
                    DeferredText.Resource(R.string.requirement_error_label)
                        .resolveToString(context)
                val regexErrorFormat =
                    DeferredText.Resource(R.string.regex_error_label)
                        .resolveToString(context)
                buildValidationResult(
                    validationResult = when {
                        regexPattern != null -> Regex(regexPattern.replace("/", "")).matches(value)
                        isMandatory -> value.isNotBlank()
                        else -> true
                    },
                    errorMessage = when {
                        value.isBlank() -> DeferredText.Constant(
                            String.format(errorFormat, usedLabel)
                        )
                        regexPattern != null -> DeferredText.Constant(
                            String.format(regexErrorFormat, usedLabel)
                        )
                        else -> DeferredText.Constant(
                            String.format(errorFormat, usedLabel)
                        )
                    }
                )
            }
            update()
        }
    }

    private fun showReviewStep(navController: NavController, @IdRes action: Int, omniPayment: OmniPayment) {
        @Suppress("UNCHECKED_CAST")
        val validatePayment = omniPayment.anyAdditions["validatePayment"]
                as (PaymentOrderValidatePost, onResult: (OmniPaymentResult) -> Unit) -> Unit
        validatePayment(PayloadBuilder(omniPayment).buildPaymentOrdersValidatePost()) { omniPaymentResult ->
            navController.navigateSafe(action)
        }
    }

    private class PayloadBuilder(private val omniPayment: OmniPayment) {

        fun buildPaymentOrdersValidatePost(): PaymentOrderValidatePost =
            PaymentOrderValidatePost {
                requestedExecutionDate = omniPayment.schedule.startDate
                instructionPriority = omniPayment.priority?.instructionPriority
                paymentType = omniPayment.paymentType
                paymentMode = buildModeOfPayment()
                transferTransactionInformation = buildDestination()
                originatorAccount = buildOriginator()
                schedule = buildPaymentSchedule()
            }

        fun buildPaymentOrderPost(): PaymentOrderPost {
            return PaymentOrderPost {
                paymentType = omniPayment.paymentType
                paymentMode = buildModeOfPayment()
                requestedExecutionDate = omniPayment.schedule.startDate
                originatorAccount = buildOriginator()
                transferTransactionInformation = buildDestination()
                schedule = buildPaymentSchedule()
                instructionPriority = omniPayment.priority?.instructionPriority
            }
        }

        private fun buildPaymentSchedule(): Schedule? {
            return when (omniPayment.schedule.transferFrequency) {
                Schedule.TransferFrequency.ONCE -> null
                else -> omniPayment.schedule
            }
        }

        private fun getIdentification(account: PaymentAccount): Identification {
            val scheme: SchemeNames
            val id: String

            if (account.isOwnAccount) {
                scheme = SchemeNames.ID
                id = account.accountId
            } else if (account.iban.isBlank()) {
                scheme = SchemeNames.BBAN
                id = account.bban
            } else {
                scheme = SchemeNames.IBAN
                id = account.iban
            }

            return Identification {
                identification = id
                schemeName = scheme
                additions = account.additions
            }
        }

        private fun buildOriginator(): AccountIdentification {
            return AccountIdentification {
                name = omniPayment.fromAccount.accountName
                identification = getIdentification(omniPayment.fromAccount)
            }
        }

        private fun buildModeOfPayment(): PaymentMode {
            return when (omniPayment.schedule.transferFrequency) {
                Schedule.TransferFrequency.ONCE -> PaymentMode.SINGLE
                else -> PaymentMode.RECURRING
            }
        }

        private fun buildDestination(): InitiateTransaction {
            return InitiateTransaction {
                messageToBank = omniPayment.messageToBank
                purposeOfPayment = PurposeOfPayment {
                    code = omniPayment.purposeOfPaymentOmniPaymentStructured?.code
                    freeText = omniPayment.purposeOfPaymentOmniPaymentStructured?.freeText
                    additions = omniPayment.purposeOfPaymentOmniPaymentStructured?.additions
                }
                counterpartyBank =  when {
                    omniPayment.toAccount.bankSwift.isEmpty() -> Bank {
                        bankBranchCode =
                            omniPayment.toAccount.bankCode.takeUnless { it.isBlank() }
                        name =
                            omniPayment.toAccount.bankName.takeUnless { it.isBlank() }
                        bankAddress = omniPayment.toAccount.bankPostalAddress
                    }
                    else -> Bank {
                        bic = omniPayment.toAccount.bankSwift
                        name = omniPayment.toAccount.bankName.takeUnless { it.isBlank() }
                        bankBranchCode =
                            omniPayment.toAccount.bankCode.takeUnless { it.isBlank() }
                        bankAddress = omniPayment.toAccount.bankPostalAddress
                    }
                }
                correspondentBank = omniPayment.correspondentBank
                intermediaryBank = omniPayment.intermediaryBank
                chargeBearer = when (omniPayment.chargeBearer) {
                    "OUR" -> ChargeBearer.OUR
                    "BEN" -> ChargeBearer.BEN
                    "SHA" -> ChargeBearer.SHA
                    else -> null
                }
                transferFee = omniPayment.transferFeeCurrencyCode?.let {
                    Currency {
                        amount = omniPayment.transferFee.toString()
                        currencyCode = omniPayment.transferFeeCurrencyCode
                    }
                }
                instructedAmount = Currency {
                    amount = omniPayment.amount.toString()
                    currencyCode = omniPayment.toAccount.currencyCode
                }
                remittanceInformation = omniPayment.description
                counterparty = InvolvedParty {
                    name = if (omniPayment.toAccount.isOwnAccount) {
                        omniPayment.toAccount.displayName
                    } else {
                        omniPayment.toAccount.contactName
                    }
                    postalAddress = omniPayment.toAccount.accountPostalAddress
                }
                counterpartyAccount = InitiateCounterPartyAccount {
                    name = omniPayment.toAccount.accountName
                    identification = getIdentification(omniPayment.toAccount)
                }
            }
        }

    }
}
