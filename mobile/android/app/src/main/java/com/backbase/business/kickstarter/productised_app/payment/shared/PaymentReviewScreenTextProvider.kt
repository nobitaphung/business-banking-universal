package com.backbase.business.kickstarter.productised_app.payment.shared


import android.content.Context
import com.backbase.android.business.journey.common.date.DateFormatter
import com.backbase.android.business.journey.common.date.DateType
import com.backbase.android.business.journey.common.extensions.isToday
import com.backbase.android.business.journey.omnipayments.model.OmniPayment
import com.backbase.android.business.journey.omnipayments.model.paymentoption.ExecutionTime
import com.backbase.android.business.journey.omnipayments.model.paymentoption.InstructionPriority
import com.backbase.android.business.journey.omnipayments.model.paymentoption.PriorityOption
import com.backbase.android.business.journey.omnipayments.model.paymentoption.Schedule
import com.backbase.android.design.amount.AmountFormat
import com.backbase.android.design.amount.AmountFormatter
import com.backbase.business.kickstarter.productised_app.R
import com.backbase.business.kickstarter.productised_app.payment.getSystemLocale
import com.backbase.deferredresources.DeferredFormattedString
import com.backbase.deferredresources.DeferredPlurals
import com.backbase.deferredresources.DeferredText
import java.math.BigDecimal

/**
 * Created by Backbase R&D B.V on 19/10/2022
 */
internal object PaymentReviewScreenTextProvider {

    /**
     * General description of the payment, for example:
     * "Standard - I pay all fees (OUR) - Delivery within 1 business day"
     */
    fun formatPaymentConditions(context: Context, omniPaymentModel: OmniPayment): String {
        val chargeBearer = when (omniPaymentModel.chargeBearer) {
            "OUR" -> context.getString(R.string.international_charge_bearer_our_title)
            "BEN" -> context.getString(R.string.international_charge_bearer_ben_title)
            "SHA" -> context.getString(R.string.international_charge_bearer_sha_title)
            else -> ""
        }

        val priorityTypeTitle =
            when (omniPaymentModel.priority?.instructionPriority) {
                InstructionPriority.NORM ->
                    context.getString(R.string.international_priority_title_norm)
                InstructionPriority.HIGH ->
                    context.getString(R.string.international_priority_title_high)
                else -> ""
            }

        val priorityTypeSubTitle = generatePrioritySubtitle(
            context,
            omniPaymentModel.priority
        )

        val priority = DeferredFormattedString
            .Resource(R.string.international_priority_title)
            .resolve(
                context,
                priorityTypeTitle,
                priorityTypeSubTitle,
                chargeBearer
            )

        return priority
    }

    /**
     * Payment delivery information, for example:
     * "Delivery within 1-2 business days"
     */
    fun generatePrioritySubtitle(context: Context, priority: PriorityOption?): String {
        priority?.executionTime?.let { executionTime ->
            val minDays = executionTime.min
            val maxDays = executionTime.max
            maxDays?.let {
                val unit = when (executionTime.unit) {
                    ExecutionTime.Unit.HOUR -> DeferredPlurals.Resource(R.plurals.international_priority_unit_hour)
                    ExecutionTime.Unit.BUSINESSDAY -> DeferredPlurals.Resource(R.plurals.international_priority_unit_business_days)
                    ExecutionTime.Unit.CALENDARDAY -> DeferredPlurals.Resource(R.plurals.international_priority_unit_calendar_days)
                    else -> null
                }?.resolve(context, maxDays) ?: ""
                val cutOffTime = priority.cutOffTime

                return when {
                    cutOffTime.isNullOrBlank() -> when (minDays) {
                        null -> DeferredFormattedString.Resource(R.string.international_priority_subtitle_max)
                            .resolve(context, maxDays, unit)
                        else -> DeferredFormattedString.Resource(R.string.international_priority_subtitle_min_max)
                            .resolve(context, minDays, maxDays, unit)
                    }
                    else -> when (minDays) {
                        null ->
                            DeferredFormattedString.Resource(R.string.international_priority_subtitle_max_cutoff)
                                .resolve(context, maxDays, unit, cutOffTime)
                        else -> DeferredFormattedString.Resource(R.string.international_priority_subtitle_min_max_cutoff)
                            .resolve(context, minDays, maxDays, unit, cutOffTime)
                    }
                }
            }
        }
        return ""
    }

    /**
     * Formatted payment execution date
     */
    fun formatExecutionDate(context: Context, omniPaymentModel: OmniPayment): String {
        val date = omniPaymentModel.schedule.startDate
        var dateString = date?.let {
            DateFormatter(it).formatAs(DateType.DATE_MEDIUM)
        }

        if (date?.isToday() == true)
            dateString =
                "${
                    DeferredText.Resource(R.string.custom_today)
                        .resolve(context)
                }, " +
                        "$dateString"

        return dateString ?: ""
    }

    /**
     * Formatted amount of money, with currency
     */
    fun formatAmount(context: Context, amount: BigDecimal, currency: String?): String {
        return AmountFormat().apply {
            enableIsoFormat = true
            locale = context.getSystemLocale()
            currencyCode = currency
        }.format(amount)
    }

    /**
     * Description of transfer frequency, for example "Once" or "Weekly"
     */
    fun formatTransferFrequency(context: Context, omniPaymentModel: OmniPayment): CharSequence {
        return when (omniPaymentModel.schedule.transferFrequency) {
            Schedule.TransferFrequency.ONCE -> DeferredText.Resource(R.string.once)
            Schedule.TransferFrequency.DAILY -> DeferredText.Resource(R.string.daily)
            Schedule.TransferFrequency.WEEKLY -> DeferredText.Resource(R.string.weekly)
            Schedule.TransferFrequency.BIWEEKLY -> DeferredText.Resource(R.string.biweekly)
            Schedule.TransferFrequency.MONTHLY -> DeferredText.Resource(R.string.monthly)
            Schedule.TransferFrequency.QUARTERLY -> DeferredText.Resource(R.string.quarterly)
            Schedule.TransferFrequency.YEARLY -> DeferredText.Resource(R.string.yearly)
            else -> DeferredText.Constant("")
        }.resolve(context)
    }

    /**
     * Formatted value for the "you pay" section
     */
    fun formatYouPay(context: Context, omniPaymentModel: OmniPayment): String {
        val from = omniPaymentModel.fromAccount.currencyCode
        val to = omniPaymentModel.toAccount.currencyCode
        val exchangeRate = omniPaymentModel.exchangeRate

        if (from != to && exchangeRate != BigDecimal.ZERO) {
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

            return "≈ $formattedValue"
        } else {
            return ""
        }
    }

    /**
     * Exchange rate, including both label and value. Example: "Exchange rate: 1 CNY ≈ 0.88 USD"
     */
    fun formatExchangeRate(context: Context, omniPaymentModel: OmniPayment): String {
        val from = omniPaymentModel.fromAccount.currencyCode
        val to = omniPaymentModel.toAccount.currencyCode
        val exchangeRate = omniPaymentModel.exchangeRate

        return when {
            exchangeRate == BigDecimal.ZERO -> {
                context.getString(R.string.currency_exchange_error)
            }
            from != to -> {
                val rate = omniPaymentModel.exchangeRate.toString()
                val label =
                    context.getString(R.string.international_exchange_rate_label)
                "$label 1 $from ≈ $rate $to"
            }
            else -> {
                ""
            }
        }
    }

}

