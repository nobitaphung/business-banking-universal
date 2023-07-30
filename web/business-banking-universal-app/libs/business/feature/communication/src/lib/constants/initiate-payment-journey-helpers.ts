const urlTypes = new Map<string[], string[]>([
  [
    ['SEPA_CREDIT_TRANSFER', 'SEPA_CT', 'SEPA'],
    ['new-transfer-sepa', 'new-template-sepa'],
  ],
  [
    ['ACH_CREDIT', 'US_ACH_CREDIT'],
    ['new-transfer-ach', 'new-template-ach'],
  ],
  [['US_DOMESTIC_WIRE'], ['new-transfer-wire', 'new-template-wire']],
  [
    ['INTERNAL_TRANSFER', 'INTRABANK_TRANSFER'],
    ['new-transfer-internal', 'new-template-internal'],
  ],
  [['INTERNATIONAL_TRANSFER'], ['new-transfer-international', 'new-template-international-wire']],
  [['ACH_DEBIT'], ['new-debit-transfer', '']],
]);

function urlTypeMatcher(paymentType: string | undefined): string[] {
  const paymentKey = Array.from(urlTypes.keys()).find((key) => key.includes(paymentType || '')) || [];

  return urlTypes.get(paymentKey) || [];
}

/**
 * removes the suffixes "_ILE" and "_CLOSED" from a string representing the payment type
 * @param paymentType string representing the payment type (ex. `"SEPA_CT_CLOSED"`)
 * @returns string without the suffix "_ILE" or "_CLOSED" (ex. `"SEPA_CT"`)
 */
function normalizePaymentType(paymentType: string | undefined): string | undefined {
  const paymentTypeSuffixes = ['_ILE', '_CLOSED'];

  if (!paymentType) {
    return;
  }

  let normalisedPaymentType = paymentType;
  paymentTypeSuffixes.forEach((suffix) => {
    if (paymentType.endsWith(suffix)) {
      normalisedPaymentType = paymentType.replace(suffix, '');
    }
  });

  return normalisedPaymentType;
}

export function getPaymentUrl(paymentType: string | undefined): string {
  return urlTypeMatcher(normalizePaymentType(paymentType))[0] || 'edit-transfer';
}

export function getTemplateUrl(paymentType: string | undefined): string {
  return urlTypeMatcher(normalizePaymentType(paymentType))[1] || 'edit-payment-template';
}
