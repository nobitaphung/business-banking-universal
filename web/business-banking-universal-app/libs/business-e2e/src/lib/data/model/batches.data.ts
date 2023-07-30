import { todayDateString } from '../../utils/batch-utils';

export interface TransferDetails {
  debitorAccount: BatchFormFieldData;
  counterparty: BatchFormFieldData;
}

export enum ManualBatchType {
  INTRACOMPANY_PAYMENT_CREDIT_USA,
}

export enum Step {
  One,
  Two,
}
export type StepSelectors<T> = Record<Step, T>;

export enum FormFieldType {
  Text,
  Select,
  FormArray,
}

export enum TypeOfValidation {
  required = 'required',
  invalid = 'invalid',
}

export interface ValidationMessages {
  [TypeOfValidation.required]?: string;
  [TypeOfValidation.invalid]?: string;
}

export interface BatchFormFieldData {
  value: string | Record<string, string>;
  type: FormFieldType;
  fields?: Record<string, BatchFormFieldData>;
  validationMessages: ValidationMessages;
}

export interface BatchInfo {
  batchName: BatchFormFieldData;
  requestedExecutionDate: BatchFormFieldData;
}

const batchInfoFields: BatchInfo = {
  batchName: {
    value: 'Test Batch',
    type: FormFieldType.Text,
    validationMessages: {
      required: 'Batch name is required',
    },
  },
  requestedExecutionDate: {
    value: todayDateString,
    type: FormFieldType.Text,
    validationMessages: {
      required: 'Execution date is required',
    },
  },
};

const transferDetailsFields: TransferDetails = {
  debitorAccount: {
    value: '',
    type: FormFieldType.Select,
    validationMessages: {
      required: 'Account is required',
    },
  },
  counterparty: {
    value: '',
    type: FormFieldType.FormArray,
    fields: {
      counterpartyName: {
        value: '',
        type: FormFieldType.Select,
        validationMessages: {
          required: 'Account is required',
        },
      },
      amount: {
        value: '',
        type: FormFieldType.Text,
        validationMessages: {
          required: 'Amount is required',
          invalid: 'Invalid amount',
        },
      },
    },
    validationMessages: {
      required: 'Minimum one transfer is required',
    },
  },
};

export const fields = {
  [ManualBatchType.INTRACOMPANY_PAYMENT_CREDIT_USA]: {
    [Step.One]: batchInfoFields,
    [Step.Two]: transferDetailsFields,
  },
};

export interface PaymentRowInfo {
  counterpartyName: string;
  counterpartyAccount: string;
  description: string;
  amount: string;
}

export interface ValidationErrorsOptions {
  index?: number;
  typeOfValidation?: keyof ValidationMessages;
}

interface BaseBatchPaymentData {
  amount: number;
  originatorAccountName: string;
  originatorAccountNumber?: string;
  beneficiaryName: string;
  beneficiaryAccountName?: string;
  beneficiaryAccountNumber?: string;
}

export interface InternalBatchPaymentData extends BaseBatchPaymentData {
  description?: string;
}

export default {
  fields: {
    transactionSigning: {
      single: 'Authorisation  Batch with a total value of$200.00 to 1 transfer (multiple accounts).',
      multiple: 'Authorisation  Batch with a total value of$600.00 to 2 transfers (multiple accounts).',
    },
  },
};
