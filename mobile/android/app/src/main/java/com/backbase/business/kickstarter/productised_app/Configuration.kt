package com.backbase.business.kickstarter.productised_app

import android.content.Context
import android.util.TypedValue
import androidx.core.content.ContextCompat
import com.backbase.android.business.app.common.PushNotificationConfiguration
import com.backbase.android.business.app.universal.configuration.BusinessUniversalAppConfiguration
import com.backbase.android.business.journey.contacts.config.BusinessContactsManagerJourneyConfiguration
import com.backbase.android.business.journey.contacts.config.ContactsListScreenConfiguration
import com.backbase.android.business.journey.omnipayments.configuration.BusinessPaymentsConfiguration
import com.backbase.android.core.utils.BBLogger
import com.backbase.business.kickstarter.productised_app.payment.International
import com.backbase.business.kickstarter.productised_app.payment.OmniPaymentRouter
import com.backbase.business.kickstarter.productised_app.payment.PaymentWizard
import com.backbase.business.kickstarter.productised_app.payment.Sepa
import com.backbase.deferredresources.DeferredDrawable
import com.backbase.deferredresources.DeferredText
import com.backbase.mobilenotifications.firebase.FirebasePushNotificationService
import com.idmikael.flags_iso.FlagsIso
import java.util.*

/**
 * Created by Backbase R&D B.V on 30/06/2020.
 * Configuration file for the collection
 */
object Configuration {

    fun apply() = BusinessUniversalAppConfiguration {
        pushNotificationConfiguration = PushNotificationConfiguration {
            pushNotificationServiceDefinition = { context ->
                {
                    FirebasePushNotificationService(context)
                }
            }
            pushNotificationsPlatform = PushNotificationConfiguration.firebasePlatform
        }
        omniPaymentsJourneyConfiguration = BusinessPaymentsConfiguration {
            router = { OmniPaymentRouter() }
            +PaymentWizard.payment
            +Sepa.payment
            +International.payment
            shouldDirectlyLaunchPaymentWithoutShowingBottomSheet = true
        }
        contactsManagerJourneyConfiguration = BusinessContactsManagerJourneyConfiguration {
            contactsListScreenConfiguration = ContactsListScreenConfiguration {
                navigationIcon = DeferredDrawable.Attribute(
                    resId = R.attr.homeAsUpIndicator,
                    mutate = true,
                    transformations = { context: Context ->
                        val textColorPrimaryResId = TypedValue().apply {
                            context.theme.resolveAttribute(R.attr.colorOnSecondary, this, true)
                        }.resourceId
                        val resolvedTextColorPrimary =
                            ContextCompat.getColor(context, textColorPrimaryResId)
                        setTint(resolvedTextColorPrimary)
                    }
                )
            }

            countryNameHandler = { _, countryIso: String ->
                DeferredText.Constant(
                    Locale(Locale.ROOT.language, countryIso).displayCountry
                )
            }

            countryFlagHandler = { context, isoCode ->
                try {
                    val drawable = FlagsIso.getFlagDrawable(context, isoCode)
                    DeferredDrawable.Constant(drawable)
                } catch (e: Exception) {
                    BBLogger.error(
                        "CountryResolver",
                        e,
                        "Failed to resolve country iso code of $isoCode to flag image"
                    )
                    null
                }
            }
        }
    }
}