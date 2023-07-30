package com.backbase.business.kickstarter.productised_app

import com.backbase.android.business.journey.omnipayments.R
import com.backbase.android.business.journey.omnipayments.util.BankCodeLabelUtil.COUNTRY_ISO_WILDCARD
import com.backbase.deferredresources.DeferredText

/**
 * Created by Backbase R&D B.V on 07/09/2021
 * Default localisation mapping for bank code label
 * key: Pair of country iso code and label-key to ensure uniqueness
 * value: DeferredText of the bank code label
 * "*" wildcard key used to show label for unspecified country iso with matching bank-code key
 */
internal val defaultBankCodeKeyLabel: Map<Pair<String, String>, DeferredText> = mapOf(
    Pair("AU", "bsb") to DeferredText.Resource(R.string.beneficiary_bank_code_bsb),
    Pair(COUNTRY_ISO_WILDCARD, "routing-number") to DeferredText.Resource(R.string.beneficiary_bank_code_routing_number_CA),
    Pair("CA", "routing-number") to DeferredText.Resource(R.string.beneficiary_bank_code_routing_number_CA),
    Pair("GB", "sort-code") to DeferredText.Resource(R.string.beneficiary_bank_code_sort_code),
    Pair("HK", "clearing") to DeferredText.Resource(R.string.beneficiary_bank_code_clearing),
    Pair("IN", "ifsc") to DeferredText.Resource(R.string.beneficiary_bank_code_ifsc),
    Pair("RU", "bik") to DeferredText.Resource(R.string.beneficiary_bank_code_bik),
    Pair("US", "routing-number") to DeferredText.Resource(R.string.beneficiary_bank_code_routing_number_US),
    Pair("ZA", "za-code") to DeferredText.Resource(R.string.beneficiary_bank_code_za_code),
)