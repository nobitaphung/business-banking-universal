export interface ArrangementsApiData {
  displayName: string;
  bookedBalance: number;
  availableBalance: number;
  productKindName: string;
}

export enum ProductKinds {
  currentAccount = 'Current Account',
  savingsAccount = 'Savings Account',
  creditCard = 'Credit Card',
  debitCard = 'Debit Card',
  loanAccount = 'Loan',
  connectedAccounts = 'Connected Account',
  investmentAccount = 'Investment Account',
}
