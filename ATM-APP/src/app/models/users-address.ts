export interface UsersAddress {
  _id: String;
  streetAddress: {
    type: String;
    required: true;
  };
  addressDesc: String;
  city: String;
  province: String;
  postal: String;
}
