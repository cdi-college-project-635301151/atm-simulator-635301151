import { UserAuth } from "./user-auth";
import { UsersAddress } from "./users-address";

export interface Users {
  _id: String;
  userAuth: UserAuth;
  firstName: String;
  lastName: String;
  phoneNumber: String;
  email: String;
  address: UsersAddress;
}
