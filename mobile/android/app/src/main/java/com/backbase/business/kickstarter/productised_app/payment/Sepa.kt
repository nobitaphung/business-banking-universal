package com.backbase.business.kickstarter.productised_app.payment

import android.content.Context
import com.backbase.android.business.journey.common.extensions.getDimensionFromAttr
import com.backbase.android.business.journey.common.extensions.isToday
import com.backbase.android.business.journey.common.extensions.navigateSafe
import com.backbase.android.business.journey.omnipayments.configuration.*
import com.backbase.android.business.journey.omnipayments.configuration.AccountFetchParameters.*
import com.backbase.android.business.journey.omnipayments.configuration.AccountFetchParameters.AccountType.DEBIT
import com.backbase.android.business.journey.omnipayments.ext.getAvailableAccountNumber
import com.backbase.android.business.journey.omnipayments.model.*
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.CREATE_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.PAYMENT_REVIEW
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_BENEFICIARY
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.SELECT_ORIGINATOR
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.PaymentStep.TRANSFER_DETAILS
import com.backbase.android.business.journey.omnipayments.model.TrackerScreenName.ViewComponent.DESCRIPTION
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Bank
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Currency
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Schedule
import com.backbase.android.business.journey.omnipayments.model.usecase.*
import com.backbase.android.business.journey.omnipayments.model.usecase.response.GetPaymentOrderResponse
import com.backbase.android.business.journey.omnipayments.view.epoxy.model.*
import com.backbase.android.business.journey.omnipayments.view.util.DateFormatter
import com.backbase.android.core.utils.BBLogger
import com.backbase.android.design.amount.AmountFormat
import com.backbase.android.design.amount.AmountFormatter
import com.backbase.business.kickstarter.productised_app.R
import com.backbase.business.kickstarter.productised_app.payment.shared.PaymentReviewScreenTextProvider
import com.backbase.deferredresources.DeferredDrawable
import com.backbase.deferredresources.DeferredText
import com.backbase.deferredresources.DeferredTextArray
import java.math.BigDecimal
import java.time.format.FormatStyle
import java.util.*
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Created by Backbase R&D B.V on 17/02/2021.
 *
 * OmniPayments configuration for SEPA Credit Transfer
 */
object Sepa {
    // Additions keys
    private const val ADDITIONS_AVATAR = "avatar"
    private const val ADDITIONS_SAVE_NEW_CONTACT = "saveNewContact"
    private const val PAYMENT_CURRENCY = "EUR"

    val payment = Payment {
        icon = DeferredDrawable.Resource(R.drawable.ic_account_balance)
        title = DeferredText.Resource(R.string.sepa)
        subtitle = DeferredText.Resource(R.string.sepa_desc)
        routerName = "sepa"
        configuration = OmniPaymentsConfiguration {
            navigationGraph = R.navigation.navigation_sepa
            steps = Steps {
                // Step 1 - Choose From account
                +Step {
                    id = R.id.fromAccount
                    analyticsLabel = { SELECT_ORIGINATOR }
                    subTitle = DeferredText.Resource(R.string.from_account)
                    layoutBuilder = { _, _, _, _ ->
                        AccountsListLayout {
                            enableSearch = true

                            accountFetchParameters = AccountFetchParameters {
                                businessFunction = BusinessFunction.SEPA_CT
                                resourceName = ResourceName.PAYMENTS
                                privilege = Privilege.CREATE
                                accountType = DEBIT
                            }

                            text = AccountsListTextConfiguration {
                                searchHint = DeferredText.Resource(R.string.accounts_search)
                            }
                        }
                    }

                    onComplete =
                        { _, navController, _, _, _ ->
                            navController.navigateSafe(R.id.action_fromAccount_to_transferTo)
                        }
                }

                // Step 2a - Select beneficiary
                +Step {
                    id = R.id.transferTo
                    analyticsLabel = { SELECT_BENEFICIARY }
                    subTitle = DeferredText.Resource(R.string.transfer_to)
                    layoutBuilder = { _, _, navController, omniPayment ->
                        ContactsListLayout {
                            enableSearch = true

                            listButton = { inVisible, onClick ->
                                inVisible(true)
                                onClick {
                                    omniPayment.toAccount = PaymentAccount { }
                                    omniPayment.contact = null
                                    navController.navigateSafe(R.id.action_transferTo_to_newBeneficiary)
                                }
                            }
                            text = ContactsListTextConfiguration {
                                searchHint = DeferredText.Resource(R.string.accounts_search)
                                listButtonText = DeferredText.Resource(R.string.add_beneficiary)
                            }
                            image = ContactsListImageConfiguration {
                                listButtonImage =
                                    DeferredDrawable.Resource(R.drawable.ic_outline_person_add_24)
                            }
                        }
                    }

                    onComplete =
                        { _, navController, _, omniPayment, _ ->
                            // Do not try to save existing contact
                            omniPayment.addNewRecipientToContacts = false
                            navController.navigateSafe(R.id.action_transferTo_to_paymentDetails)
                        }
                }

                // Step 2b - New Beneficiary screen
                +Step {
                    id = R.id.newBeneficiary
                    analyticsLabel = { CREATE_BENEFICIARY }
                    title = DeferredText.Resource(R.string.beneficiary_details)
                    layoutBuilder = { context, fragmentManager, navController, omniPayment ->
                        val spacerSmall = context.getDimensionFromAttr(R.attr.spacerSmall)
                        val spacerMedium = context.getDimensionFromAttr(R.attr.spacerMedium)
                        val spacerLarge = context.getDimensionFromAttr(R.attr.spacerLarge)

                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton =
                                    DeferredText.Resource(R.string.custom_next_payment_details)
                            }
                            +asAdditionV2(omniPayment, ADDITIONS_AVATAR, AvatarView_().apply {
                                id(1)
                                margin = ViewMargin(0, spacerLarge, 0, spacerLarge)
                            })
                            +CheckBoxView_().apply {
                                margin = ViewMargin(spacerMedium, 0, spacerMedium, 0)
                                id(2)
                                label = DeferredText.Resource(R.string.save_new_recipient)
                                isCheckedByDefault = {
                                    (omniPayment.anyAdditions[ADDITIONS_SAVE_NEW_CONTACT] as? Boolean) ?: false
                                }
                                onCheckedChange { ticked ->
                                    // New contact saving state into temporary storage
                                    omniPayment.anyAdditions[ADDITIONS_SAVE_NEW_CONTACT] = ticked
                                }
                            }
                            +TextInput_().apply {
                                id(3)
                                margin = ViewMargin(spacerMedium, spacerMedium, spacerMedium, 0)
                                label = DeferredText.Resource(R.string.sepa_beneficiary_name_label)
                                maxLength = 140
                                initialInput(omniPayment.toAccount.contactName)
                                onValidatedInput {
                                    omniPayment.toAccount.contactName = it.trim()
                                }
                                submitValidators(listOf(::isNotEmpty))
                                onInputChange { beneficiaryName ->
                                    beneficiaryNameChanged(beneficiaryName, omniPayment)
                                }
                            }
                            +TextInput_().apply {
                                id(4)
                                margin = ViewMargin(spacerMedium, spacerSmall, spacerMedium, 0)
                                label =
                                    DeferredText.Resource(R.string.sepa_beneficiary_account_label)
                                initialInput(omniPayment.toAccount.iban)
                                submitValidators(listOf(::isValidIban))
                                onValidatedInput {
                                    omniPayment.toAccount.iban = it.toString().toUpperCase(
                                        Locale.ROOT
                                    )
                                }
                            }
                        }
                    }
                    onComplete =
                        { context, navController, createPayment, omniPayment, selectedAccount ->
                            // Fix name formatting trimming extra spaces
                            omniPayment.toAccount.accountName =
                                omniPayment.toAccount.accountName.split(" ")
                                    .filter(String::isNotBlank).joinToString(" ")

                            // Commit new contact saving state only on continue button
                            omniPayment.addNewRecipientToContacts =
                                (omniPayment.anyAdditions[ADDITIONS_SAVE_NEW_CONTACT] as? Boolean)
                                    ?: false
                            navController.navigateSafe(R.id.action_newBeneficiary_to_paymentDetails)

                        }
                }

                // Step 3 - Enter payment details
                +Step {
                    id = R.id.paymentDetails
                    analyticsLabel = { TRANSFER_DETAILS }
                    title = DeferredText.Resource(R.string.sepa)
                    layoutBuilder = { context, _, _, omniPayment ->
                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton =
                                    DeferredText.Resource(R.string.custom_next_review_payment)
                            }
                            +TransferAccountPreviewView_().apply {
                                id(1)
                                fromAccount(omniPayment.fromAccount.displayName)
                                toAccount(omniPayment.toAccount.contactName)
                                margin(ViewMargin(16, 32, 16, 8))
                            }
                            +TextView_().apply {
                                id(2)
                                margin(ViewMargin(16, 0, 16, 16))
                                textAppearance(R.style.TextAppearance_AppCompat_Caption)
                                textValue {
                                    val amount = omniPayment.fromAccount.availableFunds
                                    val currency = omniPayment.fromAccount.currencyCode
                                    val formattedValue = currency?.let { safeCurrency ->
                                        AmountFormatter(amount).formatIsoCurrencyAmount(
                                            context.getSystemLocale(),
                                            safeCurrency,
                                            false
                                        )
                                    } ?: amount

                                    context.getString(R.string.available_funds, formattedValue)
                                }
                            }
                            +AmountView_().apply {
                                id(3)
                                margin(ViewMargin(0, 16, 0, 0))
                                initialAmountValue(omniPayment.amount)
                                shouldSelectorDisplayCurrencySymbol = { false }
                                text(AmountViewTextConfiguration {
                                    amountLabel = DeferredText.Resource(R.string.amount)
                                    amountHint = DeferredText.Resource(R.string.amount_hint)
                                    locale = context.getSystemLocale()
                                })
                                initialCurrencyIso { PAYMENT_CURRENCY }
                                submitValidators(listOf(::isNotZero))
                                onValidatedAmount { value ->
                                    omniPayment.amount = value
                                }
                                currencyPickerEnabled { false }
                            }
                            +TransferTextInputPreviewView_().apply {
                                id(4)
                                text(TextInputPreviewTextConfiguration {
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
                                })
                                value { omniPayment.description }
                                requiredValue(false)
                                //forbiddenCharacters(charArrayOf('\\')) //TODO NTRSTLLR-912: change to allowedCharacters
                                onTextInput { text ->
                                    omniPayment.description = text
                                }
                                analyticsLabel(DESCRIPTION)
                            }
                            +TransferScheduleInputPreviewView_().apply {
                                id(5)
                                text(ScheduleInputPreviewTextConfiguration { })
                                showDotExitLine(false)
                                scheduleV2 { omniPayment.schedule }
                                onScheduleInputV2 { scheduleV2 ->
                                    omniPayment.schedule = scheduleV2
                                }
                                analytics(ScheduleInputAnalyticsConfiguration {
                                    rootAnalyticsLabel = "execution_date"
                                    todayAnalyticsLabel = "execution_date_today"
                                    scheduleAnalyticsLabel = "execution_date_schedule"
                                    repeatAnalyticsLabel = "execution_date_repeat"
                                })
                            }
                        }
                    }
                    onComplete =
                        { context, navController, _, omniPayment, _ ->
                            val validatePayment =
                                omniPayment.anyAdditions["validatePayment"] as (PaymentOrderValidatePost, onResult: (OmniPaymentResult) -> Unit) -> Unit
                            validatePayment(PayloadBuilder(omniPayment).buildPaymentOrdersValidatePost()) {
                                navController.navigateSafe(R.id.action_paymentDetails_to_review)
                            }
                        }
                }

                // Step 4 - Review payment
                +Step {
                    id = R.id.review
                    analyticsLabel = { PAYMENT_REVIEW }
                    subTitle = DeferredText.Resource(R.string.review_payment)
                    layoutBuilder = { context, _, _, omniPayment ->
                        StackLayout {
                            text = StackLayoutTextConfiguration {
                                continueButton = DeferredText.Resource(R.string.custom_submit)
                            }
                            +DuplicatePaymentWarning_().apply {
                                id(6)
                                margin(ViewMargin(16, 0, 16, 0))
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
                            +TransferAccountReviewView_().apply {
                                id(1)
                                margin(ViewMargin(16, 16, 16, 16))
                                fromLabel(DeferredText.Resource(R.string.from_label))
                                fromAccountName(omniPayment.fromAccount.displayName)
                                fromAccountNumber(omniPayment.fromAccount.getAvailableAccountNumber())
                                toLabel(DeferredText.Resource(R.string.to_label))
                                toAccountName(omniPayment.toAccount.contactAccountName)
                                toAccountNumber(omniPayment.toAccount.getAvailableAccountNumber())
                            }
                            +TransferTitleSubtitlePreviewView_().apply {
                                id(2)
                                title(DeferredText.Resource(R.string.amount))
                                margin(ViewMargin(0, 16, 0, 0))
                                blankSubtitlePlaceholder(DeferredText.Resource(R.string.no_amount))
                                subtitle {
                                    val amountFormat = AmountFormat().apply {
                                        enableIsoFormat = true
                                        locale = context.getSystemLocale()
                                        currencyCode = PAYMENT_CURRENCY
                                    }
                                    amountFormat.format(omniPayment.amount)
                                }
                                subtitleTextAppearance(R.attr.textAppearanceHeadline6)
                                hideBottomSeparator { false }
                            }
                            +TransferTitleSubtitlePreviewView_().apply {
                                id(3)
                                title(DeferredText.Resource(R.string.execution_date))
                                margin(ViewMargin(0, 16, 0, 0))
                                subtitle {
                                    val date = omniPayment.schedule.startDate
                                    var dateString =
                                        date.let { date -> DateFormatter.parseOffSetDateFromLocalDate(date)
                                            ?.let { it -> DateFormatter.formatDate(it, FormatStyle.MEDIUM) } }

                                    if (date.isToday())
                                        dateString =
                                            "${
                                                DeferredText.Resource(R.string.custom_today)
                                                    .resolve(context)
                                            }, " +
                                                    dateString

                                    dateString
                                }
                                subtitleTextAppearance(R.style.SepaBody1Medium)
                                hideBottomSeparator { false }
                            }
                            +TransferTitleSubtitlePreviewView_().apply {
                                id(4)
                                title(DeferredText.Resource(R.string.frequency))
                                margin(ViewMargin(0, 16, 0, 0))
                                subtitle {
                                    when (omniPayment.schedule.transferFrequency) {
                                        Schedule.TransferFrequency.ONCE -> DeferredText.Resource(R.string.once)
                                        Schedule.TransferFrequency.DAILY -> DeferredText.Resource(R.string.daily)
                                        Schedule.TransferFrequency.WEEKLY -> DeferredText.Resource(R.string.weekly)
                                        Schedule.TransferFrequency.BIWEEKLY -> DeferredText.Resource(
                                            R.string.biweekly
                                        )
                                        Schedule.TransferFrequency.MONTHLY -> DeferredText.Resource(
                                            R.string.monthly
                                        )
                                        Schedule.TransferFrequency.QUARTERLY -> DeferredText.Resource(
                                            R.string.quarterly
                                        )
                                        Schedule.TransferFrequency.YEARLY -> DeferredText.Resource(R.string.yearly)
                                        else -> DeferredText.Constant("")
                                    }.resolve(context)
                                }
                                subtitleTextAppearance(R.style.SepaBody1Medium)
                                hideBottomSeparator { false }
                            }
                            if (omniPayment.description.isNotEmpty()) {
                                +TransferTitleSubtitlePreviewView_().apply {
                                    id(3)
                                    margin(ViewMargin(0, 16, 0, 0))
                                    title(DeferredText.Resource(R.string.payment_desc_sc))
                                    subtitle { omniPayment.description }
                                    hideBottomSeparator { true }
                                    subtitleTextAppearance(R.style.SepaBody1Medium)
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

                    onComplete = { context, navController, createPayment, omniPayment, _ ->
                        // Latch to wait for before going to results screen
                        val createContactLatch = CountDownLatch(1)

                        // Try to save the contact
                        if (omniPayment.addNewRecipientToContacts) {
                            // TODO: Fix this contact creation hack in SIN-361 when we can have breaking change again
                            @kotlin.Suppress("UNCHECKED_CAST")
                            val createContact =
                                omniPayment.anyAdditions["createContact"] as (PaymentAccount, onResult: (CreateContactResult) -> Unit) -> Unit
                            createContact(omniPayment.toAccount) { result ->
                                // Release latch
                                createContactLatch.countDown()
                            }
                        } else {
                            createContactLatch.countDown()
                        }

                        val payload = PayloadBuilder(omniPayment).buildPaymentOrderPost()

                        if (omniPayment.canBeApproved) {
                            val showBottomSheet =
                                omniPayment.anyAdditions["submitBottomSheet"] as (PaymentOrderPost, onResult: (OmniPaymentResult) -> Unit) -> Unit
                            showBottomSheet(payload) {
                                // Wait for contact creation operation
                                try {
                                    createContactLatch.await(2500, TimeUnit.MILLISECONDS)
                                } catch (e: InterruptedException) {
                                    BBLogger.error("CreateContact API Call", e)
                                    createContactLatch.countDown()
                                }

                                navController.navigateSafe(R.id.action_review_to_result)
                            }
                        } else {
                            createPayment(payload) {
                                // Wait for contact creation operation
                                try {
                                    createContactLatch.await(2500, TimeUnit.MILLISECONDS)
                                } catch (e: InterruptedException) {
                                    BBLogger.error("CreateContact API Call", e)
                                    createContactLatch.countDown()
                                }
                                navController.navigateSafe(R.id.action_review_to_result)
                            }
                        }
                    }
                }
                +Step {
                    id = R.id.paymentConfirmationPdfFragment
                    analyticsLabel = { TrackerScreenName.PaymentStep.PAYMENT_CONFIRMATION }
                    layoutBuilder = { context, fragmentManager, navController, omniPaymentModel ->
                        ProofOfPaymentLayout {

                        }
                    }
                }
            }
        }
    }

    private fun beneficiaryNameChanged(name: CharSequence, omniPayment: OmniPayment) {
        omniPayment.toAccount.contactName = name.toString().trim()
        (omniPayment.anyAdditions[ADDITIONS_AVATAR] as AvatarView).apply {
            initials = getInitials(name.toString())
            update()
        }
    }

    private fun formatAmount(amount: BigDecimal, currency: String?): String {
        return AmountFormat().apply {
            enableIsoFormat = true
            locale = Locale.forLanguageTag("NL") // "EUR 12,00" (with space)
            currencyCode = currency
        }.format(amount)
    }

    private fun getInitials(name: String): String {
        val nameArray = name.split(" ").filter(String::isNotBlank)
        return when (nameArray.size) {
            0 -> ""
            1 -> nameArray.first().take(2)
            else -> nameArray.map { it.first().toUpperCase() }.joinToString("").take(2)
        }
    }

    private fun listDuplicatePaymentReviewSections(context: Context, response: GetPaymentOrderResponse): List<Pair<CharSequence, CharSequence>> {        val sections: MutableList<Pair<CharSequence, CharSequence>> = mutableListOf(
        Pair(
            DeferredText.Resource(R.string.execution_date).resolve(context),
            response.requestedExecutionDate?.let {
                DateFormatter.formatDateString(it, FormatStyle.MEDIUM)
            } ?: ""
        ))


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

    private class PayloadBuilder(private val omniPayment: OmniPayment) {

        val paymentSchedule = when (omniPayment.schedule.transferFrequency) {
            Schedule.TransferFrequency.ONCE -> null
            else -> omniPayment.schedule
        }

        val destination = InitiateTransaction {
            instructedAmount = Currency {
                amount = omniPayment.amount.toString()
                currencyCode = PAYMENT_CURRENCY
            }
            remittanceInformation = omniPayment.description
            counterparty = InvolvedParty {
                name = omniPayment.toAccount.contactName
            }
            counterpartyAccount = InitiateCounterPartyAccount {
                name = omniPayment.toAccount.accountName
                identification = Identification {
                    identification =
                        omniPayment.toAccount.getAvailableAccountNumber()
                    schemeName = SchemeNames.IBAN
                    additions = omniPayment.toAccount.additions
                }
            }
        }

        val modeOfPayment = when (omniPayment.schedule.transferFrequency) {
            Schedule.TransferFrequency.ONCE -> PaymentMode.SINGLE
            else -> PaymentMode.RECURRING
        }
        val originator = AccountIdentification {
            name = omniPayment.fromAccount.accountName
            identification = Identification {
                identification = omniPayment.fromAccount.accountId
                schemeName = SchemeNames.ID
                additions = omniPayment.fromAccount.additions
            }
        }

        fun buildPaymentOrdersValidatePost(): PaymentOrderValidatePost =
            PaymentOrderValidatePost {
                requestedExecutionDate = omniPayment.schedule.startDate
                paymentType = "SEPA_CREDIT_TRANSFER"
                paymentMode = modeOfPayment
                originatorAccount = originator
                transferTransactionInformation = destination
                schedule = paymentSchedule
            }

        fun buildPaymentOrderPost(): PaymentOrderPost =
            PaymentOrderPost {
                requestedExecutionDate = omniPayment.schedule.startDate
                paymentType = "SEPA_CREDIT_TRANSFER"
                paymentMode = modeOfPayment
                originatorAccount = originator
                transferTransactionInformation = destination
                schedule = paymentSchedule
            }
    }
}
