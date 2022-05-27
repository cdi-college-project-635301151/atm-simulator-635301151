import { UserAccounts } from "./user-accounts";

export interface Accounts {
  _id: String;
  userId: String;
  chequing: [UserAccounts];
  savings: [UserAccounts];
  mortgage: [UserAccounts];
  lineOfCredit: [UserAccounts];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
