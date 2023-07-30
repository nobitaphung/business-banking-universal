import { UserData } from './user.data';

export interface Config {
  baseUrl: string;
  baasToken: string;
  users: {
    userWithSingleContext: UserData;
    userWithMultipleContexts: UserData;
  };
}
