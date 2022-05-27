import { AtmHistory } from "./atm-history";

export interface Atm {
  _id: String;
  atmCode: String;
  atmName: String;
  balance: Number;
  history: [AtmHistory];
  archive: [AtmHistory];
  isOpen: Boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: Number;
}
