import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl
} from "@angular/forms";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccounts } from "../models/user-accounts";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { ActivatedRoute } from "@angular/router";
import { StringHelperService } from "../helpers/string-helper.service";

export interface AccountTypes {
  code: number;
  name: string;
}

@Component({
  selector: "app-clients-account-create-form",
  templateUrl: "./clients-account-create-form.component.html",
  styleUrls: [ "./clients-account-create-form.component.css" ]
})
export class ClientsAccountCreateFormComponent implements OnInit {
  accountNumber: String = Date.now().toString();
  userAccounts?: UserAccounts[];
  depositDescription?: String;

  constructor(
    private dialogRef: MatDialogRef<ClientsAccountCreateFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: UserAccounts[],
    private fb: FormBuilder,
    private userAccountApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private route: ActivatedRoute,
    private stringHelper: StringHelperService
  ) {}

  createAccountForm?: FormGroup;
  historyForm?: FormGroup;
  clientAccounts: AccountTypes[] = [ { code: 0, name: "Chequing" } ];
  uid?: string;

  ngOnInit(): void {
    this.createAccountForm = this.fb.group({
      uid: [ null ],
      accountSelector: [ null, Validators.required ],
      deposit: [ null ]
    });

    this.initAccountSelector();

    this.accountSelectorWatcher();
  }

  initAccountSelector() {
    this.route.queryParamMap.subscribe({
      next: (params) => {
        this.createAccountForm!.patchValue({
          uid: params.get("uid")
        });
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {}
    });

    const isLineOfCreditExist = this.data.find(
      (x) => x.accountType === "line of credit"
    );

    if (this.data.length > 0) {
      this.clientAccounts.push(
        { code: 1, name: "Savings" },
        { code: 2, name: "Mortgage" }
      );
    }

    if (!isLineOfCreditExist && this.data.length > 0) {
      this.clientAccounts.push({ code: 3, name: "Line Of Credit" });
    }
  }

  accountSelectorWatcher() {
    this.accountSelector!.valueChanges.subscribe((value) => {
      this.addControls(value);
    });
  }

  onAccountFormSubmit() {
    const accountValue = this.accountSelector!.value;
    const accountName = this.stringHelper.camelize(
      this.clientAccounts[accountValue].name
    );

    if (this.createAccountForm!.valid) {
      this.createAccountForm!.get(`${accountName}.credit`)!.setValue(
        this.deposit!.value
      );

      this.createAccount();

      const deposit = this.deposit!.value;
      if (deposit > 0) {
        this.postAccountHistory(deposit, this.depositDescription!);
      }
    }
  }

  createAccount() {
    this.userAccountApiService
      .createAccount(this.createAccountForm!.value)
      .subscribe({
        next: (resp) => {
          this.dialogRef.close(resp);
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {}
      });
  }

  postAccountHistory(deposit: Number, description: String) {
    this.historyForm = this.fb.group({
      accountNumber: this.accountNumber,
      history: {
        description: description,
        value: deposit
      }
    });

    this.userAccountTransactionsApiService
      .postAccountTransaction(this.historyForm.value)
      .subscribe((resp) => {
        console.log(
          `Successfully posted Transactions: ${JSON.stringify(resp)}`
        );
      });
  }

  removeControls(code: number) {
    this.clientAccounts.forEach((x) => {
      if (x.code !== code) {
        const accountName = this.stringHelper.camelize(
          this.clientAccounts[x.code].name
        );
        const isExist = this.createAccountForm!.contains(accountName);
        if (isExist) {
          this.createAccountForm!.removeControl(accountName);
        }
      }
    });
  }

  addControls(code: number) {
    const accountName = this.stringHelper.camelize(
      this.clientAccounts[code].name
    );
    this.createAccountForm!.addControl(
      accountName,
      this.fb.group({
        accountNumber: this.accountNumber,
        credit: 0
      })
    );

    if (code === 2) {
      this.depositDescription = "Bank Loan";
      this.deposit!.setValidators([ Validators.required, Validators.min(100) ]);
      this.deposit!.patchValue("1000");
      this.deposit!.updateValueAndValidity();
    }
    else {
      this.depositDescription = "Initial Deposit";
      this.deposit!.clearValidators();
      this.deposit!.patchValue(0);
      this.deposit!.updateValueAndValidity();
    }

    this.removeControls(code);
  }

  get accountSelector() {
    return this.createAccountForm!.get("accountSelector");
  }

  get deposit() {
    return this.createAccountForm!.get("deposit");
  }
}
