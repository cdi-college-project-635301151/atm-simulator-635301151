import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from "@angular/material/dialog";
import { Users } from "../models/users";
import { UserAccounts } from "../models/user-accounts";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { StringHelperService } from "../helpers/string-helper.service";
import {
  MatTableDataSource,
  _MatTableDataSource
} from "@angular/material/table";

interface data {
  _id: String;
  _accountType: String;
  accounts: [UserAccounts];
}

@Component({
  selector: "app-clients-account-pay-interest",
  templateUrl: "./clients-account-pay-interest.component.html",
  styleUrls: [ "./clients-account-pay-interest.component.css" ]
})
export class ClientsAccountPayInterestComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: data,
    private userAccountsApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private fb: FormBuilder,
    private strigHelper: StringHelperService,
    private dialogRef: MatDialogRef<ClientsAccountPayInterestComponent>
  ) {}

  accountForm?: FormGroup;
  transactionForm?: FormGroup;
  userAccounts: UserAccounts[] = [];
  dataSource = new MatTableDataSource(this.userAccounts);
  columnHeaders: String[] = [
    "number",
    "accountType",
    "accountNumber",
    "balance",
    "status"
  ];

  ngOnInit(): void {
    this.filterAccount(this.data.accounts);
    console.log(this.data._accountType);

    this.accountForm = this.fb.group({
      uid: [ this.data._id ]
    });

    this.transactionForm = this.fb.group({
      accountNumber: [],
      history: this.fb.group({
        description: [ "Deposit Interest" ],
        value: []
      })
    });
  }

  filterAccount(accounts: UserAccounts[]) {
    const account = accounts.filter(
      (x) =>
        x.accountType === this.data._accountType &&
        x.isActive === true &&
        x.credit > 0
    );
    this.userAccounts = account;
    this.dataSource = new _MatTableDataSource(this.userAccounts);
  }

  getIndex(_id: String) {
    return this.userAccounts.map((x) => x._id).indexOf(_id) + 1;
  }

  confirmPayment() {
    let counter: number = 0;
    const multiplier: number =
      this.data._accountType === "savings" ? 0.01 : 0.05;
    const description =
      this.data._accountType === "savings"
        ? "Deposit Interest"
        : "Loan Interest";

    const accountName = this.strigHelper.camelize(
      this.data._accountType.toString()
    );

    this.accountForm!.addControl(
      accountName,
      this.fb.group({
        accountNumber: [],
        credit: []
      })
    );

    this.userAccounts.map((x) => {
      counter += 1;
      const creditMultiplier: Number = Number(x.credit) * multiplier;
      const credit = Number(x.credit) + Number(creditMultiplier);

      this.accountForm!.get(`${accountName}.accountNumber`)!.setValue(
        x.accountNumber
      );
      this.accountForm!.get(`${accountName}.credit`)!.setValue(credit);

      this.transactionForm!.patchValue({
        accountNumber: x.accountNumber,
        history: {
          description: description,
          value: creditMultiplier
        }
      });

      this.updateCredit(this.accountForm!, counter);
      this.postTransactions(this.transactionForm!);
    });
  }

  postTransactions(form: FormGroup) {
    this.userAccountTransactionsApiService
      .postAccountTransaction(form.value)
      .subscribe({
        next: (resp) => {},
        error: (err) => {
          console.log(err);
        }
      });
  }

  updateCredit(form: FormGroup, counter: number) {
    this.userAccountsApiService.patcheBalance(form.value).subscribe({
      next: (resp) => {
        if (counter === this.userAccounts.length) {
          this.dialogRef.close(resp);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
