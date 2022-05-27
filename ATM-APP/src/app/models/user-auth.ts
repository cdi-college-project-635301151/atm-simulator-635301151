import { ApiConfigs } from "./api-configs";

export interface UserAuth {
  _id: String;
  userCode: Number;
  userPin: Number;
  apiConfig: ApiConfigs;
  pinUpdate: Boolean;
  userType: String;
  isBlocked: Boolean;
  isEnabled: Boolean;
  attemps: Number;
  lastLogin: Date;
  error: {
    attemps: Number;
    errorMessage: String;
  };
}
