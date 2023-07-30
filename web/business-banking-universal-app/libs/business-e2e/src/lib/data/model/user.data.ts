export interface UserData {
  username: string;
  password: string;
  fullName: string;
  userContext: string;
  defaultContext?: string;
  debitCardHolder?: string;
}

export enum UserType {
  userWithSingleContext = 'userWithSingleContext',
  userWithMultipleContexts = 'userWithMultipleContexts',
  userWithoutApprovalPolicy = 'userWithoutApprovalPolicy',
}
