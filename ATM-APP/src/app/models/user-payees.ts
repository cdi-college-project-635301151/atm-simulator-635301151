import { UserPayeeCustomers } from "./user-payee-customers";
export interface UserPayees {
  _id: String;
  customers: [UserPayeeCustomers];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
