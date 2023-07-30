package com.backbase.business.kickstarter.productised_app.payment

import android.content.Context
import com.backbase.android.business.journey.common.extensions.getDimensionFromAttr
import com.backbase.android.business.journey.common.extensions.navigateSafe
import com.backbase.android.business.journey.common.util.ProductUtil.ProductKind
import com.backbase.android.business.journey.omnipayments.configuration.*
import com.backbase.android.business.journey.omnipayments.configuration.international.*
import com.backbase.android.business.journey.omnipayments.ext.getAvailableAccountNumber
import com.backbase.android.business.journey.omnipayments.model.OmniPayment
import com.backbase.android.business.journey.omnipayments.model.OmniPaymentResult
import com.backbase.android.business.journey.omnipayments.model.PaymentAccount
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.CREATE_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.EDIT_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.PAYMENT_CONFIRMATION
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.PAYMENT_REVIEW
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_ORIGINATOR
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.TRANSFER_DETAILS
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.ADDRESS
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.BANK_ADDRESS
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.CORRESPONDENT_BANK_ADDRESS
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.DESCRIPTION
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.INTERMEDIARY_BANK_ADDRESS
import com.backbase.android.business.journey.omnipayments.model.ViewMargin
import com.backbase.android.business.journey.omnipayments.view.epoxy.model.*
import com.backbase.android.business.journey.omnipayments.model.paymentoption.*
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Schedule.TransferFrequency
import com.backbase.android.business.journey.omnipayments.model.usecase.AccountIdentification
import com.backbase.android.business.journey.omnipayments.model.usecase.Identification
import com.backbase.android.business.journey.omnipayments.model.usecase.InitiateCounterPartyAccount
import com.backbase.android.business.journey.omnipayments.model.usecase.InitiateTransaction
import com.backbase.android.business.journey.omnipayments.model.usecase.InvolvedParty
import com.backbase.android.business.journey.omnipayments.model.usecase.PaymentMode
import com.backbase.android.business.journey.omnipayments.model.usecase.PaymentOrderPost
import com.backbase.android.business.journey.omnipayments.model.usecase.PaymentOrderValidatePost
import com.backbase.android.business.journey.omnipayments.model.usecase.SchemeNames
import com.backbase.android.common.utils.formatter.SepaFormatter
import com.backbase.android.design.amount.AmountFormat
import com.backbase.android.design.amount.AmountFormatter
import com.backbase.business.kickstarter.productised_app.CountryResolver.buildCountryImageResolver
import com.backbase.business.kickstarter.productised_app.CountryResolver.buildCountryNameResolver
import com.backbase.business.kickstarter.productised_app.R
import com.backbase.business.kickstarter.productised_app.payment.shared.PaymentReviewScreenTextProvider
import com.backbase.deferredresources.DeferredDrawable
import com.backbase.deferredresources.DeferredText
import com.backbase.deferredresources.DeferredTextArray
import com.mynameismidori.currencypicker.ExtendedCurrency
import java.math.BigDecimal
import java.util.*
import java.util.Currency

/**
 * Created by Backbase R&D B.V on 03/11/2020.
 * International payments configurations
 */
object International {

    val payment = Payment {
        icon = DeferredDrawable.Resource(R.drawable.ic_baseline_international_24)
        title = DeferredText.Resource(R.string.international)
        subtitle = DeferredText.Resource(R.string.international_desc)
        routerName = "international"
        configuration = OmniPaymentsConfiguration {
            navigationGraph = R.navigation.navigation_international
            steps = Steps {
                +Step {
                    id = R.id.fromAccount
                    analyticsLabel = { SELECT_ORIGINATOR }
                    title = DeferredText.Resource(R.string.international)
                    subTitle = DeferredText.Resource(R.string.from_account)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        AccountsListLayout {
                            enableSearch = true
                            accountFetchParameters = AccountFetchParameters {
                                businessFunction =
                                    AccountFetchParameters.BusinessFunction.US_FOREIGN_WIRE
                                resourceName = AccountFetchParameters.ResourceName.PAYMENTS
                                accountType = AccountFetchParameters.AccountType.DEBIT
                                privilege = AccountFetchParameters.Privilege.CREATE
                            }
                            text = AccountsListTextConfiguration {
                                searchHint = DeferredText.Resource(R.string.accounts_search)
                            }

                            uiMapper = AccountListUiDataMapper { }
                            accountMapper =
                                AccountMapper {
                                    availableFunds = { model ->
                                        when (model.productKindName) {
                                            ProductKind.CURRENT_ACCOUNT.title,
                                            ProductKind.SAVINGS_ACCOUNT.title,
                                            ProductKind.LOAN.title,
                                            ProductKind.CREDIT_CARD.title,
                                            -> model.bookedBalance ?: BigDecimal.ZERO
                                            ProductKind.TERM_DEPOSIT.title -> model.principalAmount
                                                ?: BigDecimal.ZERO
                                            ProductKind.INVESTMENT_ACCOUNT.title -> model.currentInvestmentValue
                                                ?: BigDecimal.ZERO
                                            else -> model.availableBalance ?: BigDecimal.ZERO
                                        }
                                    }
                                }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            navController.navigateSafe(R.id.action_fromAccount_to_transferTo)
                        }
                }
                +Step {
                    id = R.id.transferTo
                    analyticsLabel = { SELECT_BENEFICIARY }
                    title = DeferredText.Resource(R.string.international)
                    subTitle = DeferredText.Resource(R.string.transfer_to)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        ContactsListLayout {
                            enableSearch = true
                            listButton = { isVisible, onClick ->
                                isVisible(true)
                                onClick {
                                    omniPaymentModel.toAccount = PaymentAccount()
                                    navController.navigateSafe(R.id.action_transferTo_to_newBeneficiary)
                                }
                            }
                            text = ContactsListTextConfiguration {
                                searchHint = DeferredText.Resource(R.string.beneficiaries_search)
                                listButtonText = DeferredText.Resource(R.string.add_beneficiary)
                            }
                            image = ContactsListImageConfiguration {
                                listButtonImage =
                                    DeferredDrawable.Resource(R.drawable.ic_outline_person_add_24)
                            }

                            uiMapper = ContactListUiDataMapper { }

                            contactMapper = ContactMapper { }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            navController.navigateSafe(R.id.action_transferTo_to_newBeneficiary)
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
                        InternationalLayout.Beneficiary {

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

                            bankCountryPicker = countryPickerConfiguration

                            beneficiaryAddress = AddressInputPreviewConfiguration {
                                text = AddressInputPreviewTextConfiguration {
                                    newAddressTitle =
                                        DeferredText.Resource(R.string.international_beneficiary_address_new)
                                    editAddressTitle =
                                        DeferredText.Resource(R.string.international_beneficiary_address_edit)
                                }
                                countryPicker = countryPickerConfiguration
                                isRequired = false
                                analyticsLabel = ADDRESS
                            }
                            bankName = InlineTextInputConfiguration {
                                primaryLabel =
                                    DeferredText.Resource(R.string.international_bank_name)
                                secondaryLabel =
                                    DeferredText.Resource(R.string.optional_indicator_label)
                            }
                            bankAddress = AddressInputPreviewConfiguration {
                                text = AddressInputPreviewTextConfiguration {
                                    newAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_new)
                                    editAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_edit)
                                }
                                countryPicker = countryPickerConfiguration
                                isRequired = false
                                analyticsLabel = BANK_ADDRESS
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, skipStep ->
                            if (skipStep == true) {
                                navController.popBackStack()
                                navController.navigateSafe(R.id.action_transferTo_to_paymentDetails)
                            } else
                                navController.navigateSafe(R.id.action_newBeneficiary_to_paymentDetails)
                        }
                }
                +Step {
                    id = R.id.paymentDetails
                    analyticsLabel = { TRANSFER_DETAILS }
                    title = DeferredText.Resource(R.string.payment_details)
                    layoutBottomOffset = R.dimen.bottom_offset_payment_details
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        InternationalLayout.PaymentDetails {
                            fromAccount = { omniPaymentModel.fromAccount.displayName }
                            beneficiaryAccount = { omniPaymentModel.toAccount.contactName }
                            bottomSheet = InternationalLayout.PaymentDetailsBottomSheet {
                                transferAmount = TransferAmountOverview {
                                    title = DeferredText.Resource(R.string.amount_to_transfer)
                                    titleTextAppearance = R.style.InternationalSubtitle1Medium
                                    subtitleTextAppearance = R.style.InternationalSubtitle1Medium
                                }

                                transferAmountConverted = TransferAmountOverview {
                                    title = DeferredText.Resource(R.string.you_pay)
                                    titleTextAppearance = R.attr.textAppearanceSubtitle2
                                    subtitleTextAppearance = R.attr.textAppearanceSubtitle2
                                }

                                transferFeeAmount = TransferAmountOverview {
                                    title = DeferredText.Resource(R.string.transfer_fee_label)
                                    titleTextAppearance = R.attr.textAppearanceSubtitle2
                                    subtitleTextAppearance = R.attr.textAppearanceSubtitle2
                                }
                            }
                            paymentDescription = PaymentDescription {
                                text = TextInputPreviewTextConfiguration {
                                    //preview
                                    previewTitle = DeferredText.Resource(R.string.payment_desc)
                                    previewDescription =
                                        DeferredText.Resource(R.string.payment_optional)
                                    //input
                                    inputTitle = DeferredText.Resource(R.string.payment_input_title)
                                    inputDescription =
                                        DeferredText.Resource(R.string.payment_input_desc)
                                    inputAllowedCharactersDescription =
                                        DeferredText.Resource(R.string.payment_text_input_message_allowed_character)
                                    inputSuggestions = DeferredTextArray.Resource(
                                        R.array.description_suggestions,
                                        DeferredTextArray.Resource.Type.STRING
                                    )
                                }
                                value = { omniPaymentModel.description }
                                requiredValue = false
                                forbiddenCharacters = charArrayOf('\\')
                                analyticsLabel = DESCRIPTION
                            }
                            amount = PaymentAmount {
                                submitValidators = listOf(::isNotZero)
                                availableFunds = {
                                    val amount = omniPaymentModel.fromAccount.availableFunds
                                    val currency = omniPaymentModel.fromAccount.currencyCode
                                    val formattedValue = currency?.let { safeCurrency ->
                                        AmountFormatter(amount).formatIsoCurrencyAmount(
                                            context.getSystemLocale(),
                                            safeCurrency,
                                            false
                                        )
                                    } ?: amount

                                    context.getString(R.string.available_funds, formattedValue)
                                }
                                currencyNameResolver = { iso ->
                                    DeferredText.Constant(Currency.getInstance(iso).displayName)
                                }
                                currencyImageResolver = { iso ->
                                    val currency = ExtendedCurrency.getCurrencyByISO(iso) ?: null
                                    currency?.let { DeferredDrawable.Resource(it.flag) }
                                        ?: DeferredDrawable.Constant(null)
                                }
                                currencyPickerAnalyticsLabel = "currency_picker"
                            }
                            val bankNameConfig = InlineTextInputConfiguration {
                                primaryLabel =
                                    DeferredText.Resource(R.string.international_bank_name)
                                secondaryLabel =
                                    DeferredText.Resource(R.string.optional_indicator_label)
                            }
                            val correspondentBankAddressConfig = AddressInputPreviewConfiguration {
                                text = AddressInputPreviewTextConfiguration {
                                    newAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_new)
                                    editAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_edit)
                                }
                                countryPicker = SanctionedEntryPickerConfiguration {
                                    countryNameResolver = buildCountryNameResolver()
                                    countryImageResolver = buildCountryImageResolver(context)
                                    analyticsLabel = "country_picker"
                                }
                                analyticsLabel = CORRESPONDENT_BANK_ADDRESS
                            }
                            val intermediaryBankAddressConfig = AddressInputPreviewConfiguration {
                                text = AddressInputPreviewTextConfiguration {
                                    newAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_new)
                                    editAddressTitle =
                                        DeferredText.Resource(R.string.international_bank_address_edit)
                                }
                                countryPicker = SanctionedEntryPickerConfiguration {
                                    countryNameResolver = buildCountryNameResolver()
                                    countryImageResolver = buildCountryImageResolver(context)
                                    analyticsLabel = "country_picker"
                                }
                                analyticsLabel = INTERMEDIARY_BANK_ADDRESS
                            }
                            paymentRouting = PaymentRouting {
                                text = RoutingInputPreviewTextConfiguration {
                                    inputCorrespondentNameLabel = bankNameConfig
                                    inputCorrespondentAddress = correspondentBankAddressConfig
                                    inputIntermediaryNameLabel = bankNameConfig
                                    inputIntermediaryAddress = intermediaryBankAddressConfig
                                }
                                analyticsLabel = "transfer_routing"
                            }
                            paymentSchedule = PaymentSchedule {
                                text = ScheduleInputPreviewTextConfiguration { }
                                showDotExitLine = false
                                analytics = ScheduleInputAnalyticsConfiguration {
                                    rootAnalyticsLabel = "execution_date"
                                    todayAnalyticsLabel = "execution_date_today"
                                    scheduleAnalyticsLabel = "execution_date_schedule"
                                    repeatAnalyticsLabel = "execution_date_repeat"
                                }
                            }

                            paymentPriority = PaymentPriority {
                                submitValidators = listOf(::deliveryOptionsNotEmpty)
                            }

                            paymentChargeBearer = PaymentChargeBearer {
                                label =
                                    DeferredText.Resource(R.string.international_how_fees_are_paid)
                                hint =
                                    DeferredText.Resource(R.string.international_charge_bearer_hint)
                                title =
                                    DeferredText.Resource(R.string.international_how_fees_are_paid)
                                submitValidators = listOf(::chargeBearerNotEmpty)
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
                        { context, navController, createPayment, omniPayment, selectedAccount ->
                            @Suppress("UNCHECKED_CAST")
                            val validatePayment = omniPayment.anyAdditions["validatePayment"]
                                    as (PaymentOrderValidatePost, onResult: (OmniPaymentResult) -> Unit) -> Unit
                            val payload = PayloadBuilder(omniPayment).buildPaymentOrdersValidatePost()
                            validatePayment(payload) { omniPaymentResult ->
                                navController.navigateSafe(R.id.action_paymentDetails_to_review)
                            }
                        }
                }
                +Step {
                    id = R.id.review
                    analyticsLabel = { PAYMENT_REVIEW }
                    title = DeferredText.Resource(R.string.international)
                    subTitle = DeferredText.Resource(R.string.review_payment)
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton = DeferredText.Resource(R.string.custom_submit)
                            }
                            +DuplicatePaymentWarning_().apply {
                                id(16)
                                margin(ViewMargin(16, 0, 16, 0))
                                omniPayment(omniPaymentModel)
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
                                            youPay(getReviewYouPay(context, omniPaymentModel))
                                            sections(listDuplicatePaymentReviewSections(context, omniPaymentModel))
                                            amountFormatter(object : AmountFormat.CustomAmountFormatter {
                                                override fun format(currencyCode: String?, amount: BigDecimal): String {
                                                    return formatAmount(amount, currencyCode)
                                                }}
                                            )
                                        }
                                    )
                                }
                            }
                            +TransferAccountReviewView_().apply {
                                id(1)
                                margin(ViewMargin(16, 16, 16, 16))
                                fromLabel(DeferredText.Resource(R.string.from_label))
                                fromAccountName(omniPaymentModel.fromAccount.displayName)
                                fromAccountNumber(SepaFormatter.format(omniPaymentModel.fromAccount.getAvailableAccountNumber()))
                                toLabel(DeferredText.Resource(R.string.to_label))
                                toAccountName(omniPaymentModel.toAccount.contactAccountName)
                                toAccountNumber(SepaFormatter.format(omniPaymentModel.toAccount.getAvailableAccountNumber()))
                            }
                            +TransferTitleSubtitlePreviewView_().apply {
                                id(2)
                                title(DeferredText.Resource(R.string.amount_to_transfer))
                                blankSubtitlePlaceholder(DeferredText.Resource(R.string.no_amount))
                                subtitle {
                                    val currencyCode =
                                        omniPaymentModel.toAccount.currencyCode ?: ""
                                    AmountFormatter(omniPaymentModel.amount)
                                        .formatIsoCurrencyAmount(
                                            locale = context.getSystemLocale(),
                                            currencyCode = currencyCode,
                                            addPositiveSign = false
                                        )
                                }
                                subtitleTextAppearance(R.attr.textAppearanceHeadline6)
                                hideBottomSeparator { true }
                            }

                            val from = omniPaymentModel.fromAccount.currencyCode
                            val to = omniPaymentModel.toAccount.currencyCode
                            val exchangeRate = omniPaymentModel.exchangeRate

                            if (from != to && exchangeRate != BigDecimal.ZERO) {
                                +HorizontalTitleSubtitlePreviewView_().apply {
                                    id(3)
                                    margin(ViewMargin(16, 10, 16, 0))
                                    titleTextAppearance(R.attr.textAppearanceBody2Medium)
                                    subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                    titleValue { context.getString(R.string.international_you_pay) }
                                    subtitleValue {
                                        val amount = omniPaymentModel.amount.divide(
                                            omniPaymentModel.exchangeRate,
                                            2,
                                            BigDecimal.ROUND_HALF_UP
                                        )
                                        val currency = omniPaymentModel.fromAccount.currencyCode
                                        val formattedValue = currency?.let { safeCurrency ->
                                            AmountFormatter(amount).formatIsoCurrencyAmount(
                                                context.getSystemLocale(),
                                                safeCurrency,
                                                false
                                            )
                                        } ?: amount

                                        "≈ $formattedValue"
                                    }
                                }
                            }
                            +HorizontalTitleSubtitlePreviewView_().apply {
                                id(4)
                                margin(ViewMargin(16, 12, 16, 0))
                                titleTextAppearance(R.attr.textAppearanceBody2Medium)
                                subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                titleValue { context.getString(R.string.international_transfer_fee) }
                                subtitleValue {
                                    val currency = omniPaymentModel.transferFeeCurrencyCode
                                    val formattedValue = currency?.let { safeCurrency ->
                                        AmountFormatter(omniPaymentModel.transferFee).formatIsoCurrencyAmount(
                                            context.getSystemLocale(),
                                            safeCurrency,
                                            false
                                        )
                                    } ?: BigDecimal.ZERO

                                    "$formattedValue"
                                }
                            }
                            when {
                                exchangeRate == BigDecimal.ZERO -> +TextView_().apply {
                                    id(5)
                                    margin(ViewMargin(16, 12, 16, 0))
                                    textAppearance(R.style.InternationalTextView)
                                    textValue {
                                        context.getString(R.string.currency_exchange_error)
                                    }
                                }

                                from != to -> +TextView_().apply {
                                    id(5)
                                    margin(ViewMargin(16, 12, 16, 0))
                                    textAppearance(R.style.InternationalTextView)
                                    textValue {
                                        val rate = omniPaymentModel.exchangeRate.toString()
                                        val label =
                                            context.getString(R.string.international_exchange_rate_label)
                                        "$label 1 $from ≈ $rate $to"
                                    }
                                }
                            }
                            +TextView_().apply {
                                id(6)
                                margin(ViewMargin(16, 8, 16, 0))
                                textAppearance(R.style.InternationalTextView)
                                textValue {
                                    PaymentReviewScreenTextProvider.formatPaymentConditions(context, omniPaymentModel)
                                }
                            }
                            +SeparatorView_().apply {
                                id(7)
                                margin(ViewMargin(16, 16, 0, 0))
                            }

                            omniPaymentModel.correspondentBank?.apply {
                                val hasBankBranchCode = !bankBranchCode.isNullOrEmpty()
                                val hasName = !name.isNullOrEmpty()
                                val hasPostalAddress = !bankAddress?.postCode.isNullOrEmpty()

                                when {
                                    hasBankBranchCode && hasName && hasPostalAddress -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(8)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_correspondent_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(81)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.attr.textAppearanceBody1Medium)
                                            textValue { name }
                                        }
                                        +TextView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.style.InternationalTextView)
                                            textValue {
                                                listOfNotNull(
                                                    bankAddress?.streetName,
                                                    bankAddress?.addressLine1,
                                                    bankAddress?.addressLine2,
                                                    bankAddress?.postCode,
                                                    bankAddress?.town,
                                                    bankAddress?.countrySubDivision,
                                                    bankAddress?.country
                                                ).joinToString()
                                            }
                                        }
                                        +SeparatorView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode && hasName -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(8)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_correspondent_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(81)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.attr.textAppearanceBody1Medium)
                                            textValue { name }
                                        }
                                        +SeparatorView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode && hasPostalAddress -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(8)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_correspondent_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.style.InternationalTextView)
                                            textValue {
                                                listOfNotNull(
                                                    bankAddress?.streetName,
                                                    bankAddress?.addressLine1,
                                                    bankAddress?.addressLine2,
                                                    bankAddress?.postCode,
                                                    bankAddress?.town,
                                                    bankAddress?.countrySubDivision,
                                                    bankAddress?.country
                                                ).joinToString()
                                            }
                                        }
                                        +SeparatorView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(8)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_correspondent_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { false }
                                        }
                                    }
                                }
                            }

                            omniPaymentModel.intermediaryBank?.apply {
                                val hasBankBranchCode = !bankBranchCode.isNullOrEmpty()
                                val hasName = !name.isNullOrEmpty()
                                val hasPostalAddress = !bankAddress?.postCode.isNullOrEmpty()

                                when {
                                    hasBankBranchCode && hasName && hasPostalAddress -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(9)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_intermediary_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(91)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.attr.textAppearanceBody1Medium)
                                            textValue { name }
                                        }
                                        +TextView_().apply {
                                            id(92)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.style.InternationalTextView)
                                            textValue {
                                                listOfNotNull(
                                                    bankAddress?.streetName,
                                                    bankAddress?.addressLine1,
                                                    bankAddress?.addressLine2,
                                                    bankAddress?.postCode,
                                                    bankAddress?.town,
                                                    bankAddress?.countrySubDivision,
                                                    bankAddress?.country
                                                ).joinToString()
                                            }
                                        }
                                        +SeparatorView_().apply {
                                            id(93)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode && hasName -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(8)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_intermediary_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(81)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.attr.textAppearanceBody1Medium)
                                            textValue { name }
                                        }
                                        +SeparatorView_().apply {
                                            id(82)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode && hasPostalAddress -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(9)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_intermediary_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { true }
                                        }
                                        +TextView_().apply {
                                            id(91)
                                            margin(ViewMargin(16, 4, 16, 0))
                                            textAppearance(R.style.InternationalTextView)
                                            textValue {
                                                listOfNotNull(
                                                    bankAddress?.streetName,
                                                    bankAddress?.addressLine1,
                                                    bankAddress?.addressLine2,
                                                    bankAddress?.postCode,
                                                    bankAddress?.town,
                                                    bankAddress?.countrySubDivision,
                                                    bankAddress?.country
                                                ).joinToString()
                                            }
                                        }
                                        +SeparatorView_().apply {
                                            id(92)
                                            margin(ViewMargin(16, 16, 0, 0))
                                        }
                                    }
                                    hasBankBranchCode -> {
                                        +TransferTitleSubtitlePreviewView_().apply {
                                            id(9)
                                            margin(ViewMargin(0, 16, 0, 0))
                                            title(DeferredText.Resource(R.string.international_intermediary_bank))
                                            subtitle {
                                                val label =
                                                    context.getString(R.string.international_swift_bic_label)
                                                "$label $bankBranchCode"
                                            }
                                            subtitleTextAppearance(R.attr.textAppearanceBody1Medium)
                                            hideBottomSeparator { false }
                                        }
                                    }
                                }
                            }

                            +TransferTitleSubtitlePreviewView_().apply {
                                id(13)
                                margin(ViewMargin(0, 16, 0, 0))
                                title(DeferredText.Resource(R.string.execution_date))
                                subtitle {
                                    PaymentReviewScreenTextProvider.formatExecutionDate(context, omniPaymentModel)
                                }
                                subtitleTextAppearance(R.style.IntracompanyBody1Medium)
                                hideBottomSeparator { false }
                            }

                            +TransferTitleSubtitlePreviewView_().apply {
                                id(14)
                                title(DeferredText.Resource(R.string.frequency))
                                margin(ViewMargin(0, 16, 0, 0))
                                subtitle {
                                    PaymentReviewScreenTextProvider.formatTransferFrequency(context, omniPaymentModel)
                                }
                                subtitleTextAppearance(R.style.IntracompanyBody1Medium)
                                hideBottomSeparator { false }
                            }

                            if (omniPaymentModel.description.isNotEmpty()) {
                                +TransferTitleSubtitlePreviewView_().apply {
                                    id(15)
                                    margin(ViewMargin(0, 16, 0, 0))
                                    title(DeferredText.Resource(R.string.payment_desc_sc))
                                    subtitle { omniPaymentModel.description }
                                    subtitleTextAppearance(R.style.IntracompanyBody1Medium)
                                    hideBottomSeparator { true }
                                }
                            }

                            +CenterTextView_().apply {
                                id(5)
                                margin(ViewMargin(0, 16, 0, 0))
                                textAppearance(R.style.TextAppearance_AppCompat_Caption)
                                textValue {
                                    context.getString(R.string.transfer_dates_timezone)
                                }
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPaymentModel, selectedAccount ->
                            val payload = PayloadBuilder(omniPaymentModel).buildPaymentOrderPost()
                            createPayment(payload) {
                                navController.navigateSafe(R.id.action_review_to_result)
                            }
                        }
                }
                +Step {
                    id = R.id.paymentConfirmationPdfFragment
                    analyticsLabel = { PAYMENT_CONFIRMATION }
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        ProofOfPaymentLayout {

                        }
                    }
                }
            }
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
        val from = omniPayment.fromAccount.currencyCode
        val to = omniPayment.toAccount.currencyCode
        val exchangeRate = omniPayment.exchangeRate

        if (from != to && exchangeRate != BigDecimal.ZERO) {
            return Pair(
                context.getString(R.string.international_you_pay),
                PaymentReviewScreenTextProvider.formatYouPay(context, omniPayment)
            )
        }
        return null
    }

    private fun listDuplicatePaymentReviewSections(context: Context, omniPayment: OmniPayment): List<Pair<CharSequence, CharSequence>> {
        val sections: MutableList<Pair<CharSequence, CharSequence>> = mutableListOf(
            Pair(
                DeferredText.Resource(R.string.execution_date).resolve(context),
                PaymentReviewScreenTextProvider.formatExecutionDate(context, omniPayment)
            ))


        if (omniPayment.description.isNotEmpty()) {
            sections.add(
                Pair(
                    DeferredText.Resource(R.string.payment_desc_sc).resolve(context),
                    omniPayment.description
                ))
        }

        return sections
    }

    private class PayloadBuilder(private val omniPaymentModel: OmniPayment) {

        fun buildPaymentOrderPost(): PaymentOrderPost {
            return PaymentOrderPost {
                paymentType = "INTERNATIONAL_TRANSFER"
                paymentMode = buildModeOfPayment()
                requestedExecutionDate = omniPaymentModel.schedule.startDate
                originatorAccount = buildOriginator()
                transferTransactionInformation = buildDestination()
                schedule = buildPaymentSchedule()
                instructionPriority = omniPaymentModel.priority?.instructionPriority
            }
        }

        fun buildPaymentOrdersValidatePost(): PaymentOrderValidatePost =
            PaymentOrderValidatePost {
                paymentType = "INTERNATIONAL_TRANSFER"
                paymentMode = buildModeOfPayment()
                requestedExecutionDate = omniPaymentModel.schedule.startDate
                originatorAccount = buildOriginator()
                transferTransactionInformation = buildDestination()
                schedule = buildPaymentSchedule()
                instructionPriority = omniPaymentModel.priority?.instructionPriority
            }

        private fun buildOriginator(): AccountIdentification {
            return AccountIdentification {
                name = omniPaymentModel.fromAccount.accountName
                identification = Identification {
                    identification = omniPaymentModel.fromAccount.accountId
                    schemeName = SchemeNames.ID
                    additions = omniPaymentModel.fromAccount.additions
                }
            }
        }

        private fun buildModeOfPayment(): PaymentMode {
            return when (omniPaymentModel.schedule.transferFrequency) {
                TransferFrequency.ONCE -> PaymentMode.SINGLE
                else -> PaymentMode.RECURRING
            }
        }

        private fun buildDestination(): InitiateTransaction {
            val amountInstructed = com.backbase.android.business.journey.omnipayments.model.paymentoption.Currency {
                amount = omniPaymentModel.amount.toString()
                currencyCode = omniPaymentModel.toAccount.currencyCode
            }

            return InitiateTransaction {
                instructedAmount = amountInstructed
                remittanceInformation = omniPaymentModel.description
                counterparty = InvolvedParty {
                    name = omniPaymentModel.toAccount.contactName
                    postalAddress = omniPaymentModel.toAccount.accountPostalAddress
                }
                val scheme = if (omniPaymentModel.toAccount.iban.isBlank()) {
                    SchemeNames.BBAN
                } else {
                    SchemeNames.IBAN
                }

                counterpartyAccount = InitiateCounterPartyAccount {
                    name = omniPaymentModel.toAccount.accountName
                    identification = Identification {
                        identification =
                            omniPaymentModel.toAccount.getAvailableAccountNumber()
                        schemeName = scheme
                        additions = omniPaymentModel.toAccount.additions
                    }
                }

                counterpartyBank = when {
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
                correspondentBank = omniPaymentModel.correspondentBank
                intermediaryBank = omniPaymentModel.intermediaryBank
                chargeBearer = when (omniPaymentModel.chargeBearer) {
                    "OUR" -> ChargeBearer.OUR
                    "BEN" -> ChargeBearer.BEN
                    "SHA" -> ChargeBearer.SHA
                    else -> null
                }
                transferFee = Currency {
                    amount = omniPaymentModel.transferFee.toString()
                    currencyCode = omniPaymentModel.transferFeeCurrencyCode
                }
            }
        }

        private fun buildPaymentSchedule(): Schedule? {
            return when (omniPaymentModel.schedule.transferFrequency) {
                TransferFrequency.ONCE -> null
                else -> omniPaymentModel.schedule
            }
        }
    }
}
