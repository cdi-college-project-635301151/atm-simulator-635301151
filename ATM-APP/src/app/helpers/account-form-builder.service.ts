import { Injectable } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class AccountFormBuilderService {
  constructor(private fb: FormBuilder) {}

  createAccountTransactionForm(
    accountName: string,
    accountNumber: Number,
    credit: Number,
    uid: String
  ): FormGroup {
    const form = this.fb.group({
      uid: [ uid ],
      accountNumber: [ accountNumber ]
    });

    form.addControl(
      accountName,
      this.fb.group({
        accountNumber: [ accountNumber ],
        credit: [ credit ]
      })
    );

    return form;
  }

  createAccountHistoryForm(
    form: FormGroup,
    description: String,
    value: Number
  ): FormGroup {
    form.addControl(
      "history",
      this.fb.group({
        description: description,
        value: value
      })
    );

    return form;
  }
}
