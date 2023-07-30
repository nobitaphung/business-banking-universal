package com.backbase.business.kickstarter.productised_app

import android.content.Context
import com.backbase.android.core.utils.BBLogger
import com.backbase.deferredresources.DeferredDrawable
import com.backbase.deferredresources.DeferredText
import com.idmikael.flags_iso.FlagsIso
import java.util.*

/**
 * Created by Backbase R&D B.V on 3/2/21
 * Default country image and name resolver
 */
internal object CountryResolver {
    fun buildCountryNameResolver() = { countryIso: String ->
        DeferredText.Constant(
            Locale(Locale.ROOT.language, countryIso).displayCountry
        )
    }

    fun buildCountryImageResolver(context: Context): (String) -> DeferredDrawable? =
        { isoCode: String ->
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