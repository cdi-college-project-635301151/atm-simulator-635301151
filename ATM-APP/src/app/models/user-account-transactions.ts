import { UserAccountTransactionHistory } from "./user-account-transaction-history";
export interface UserAccountTransactions {
  accountNumber: Number;
  history: [UserAccountTransactionHistory];
  acrhive: [UserAccountTransactionHistory];
  createdAt: Date;
  updatedAt: Date;
  dataCount: Number;
  _id: String;
}
