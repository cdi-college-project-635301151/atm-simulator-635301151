import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserAccounts } from "../models/user-accounts";
import { Users } from "../models/users";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StringHelperService } from "../helpers/string-helper.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { AccountGroupInterface } from "../models/account-group-interface";
import { TileInterface } from "../models/tile-interface";
import { filter } from "rxjs";

interface DepositFormInterface {
  accountLists: UserAccounts[];
  userAccount: UserAccounts;
  user: Users;
}

@Component({
  selector: "app-customer-deposit-form",
  templateUrl: "./customer-deposit-form.component.html",
  styleUrls: [ "./customer-deposit-form.component.css" ]
})
export class CustomerDepositFormComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DepositFormInterface,
    private fb: FormBuilder,
    private stringHelperService: StringHelperService,
    private userAccountsApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private dialogRef: MatDialogRef<CustomerDepositFormComponent>
  ) {}

  depositValue: number = 0;

  tiles: TileInterface[] = [];
  accountSelector?: AccountGroupInterface[] = [];
  accountSelectorForm?: FormGroup;

  ngOnInit(): void {
    console.log(this.data);
    this.accountSelectorForm = this.fb.group({
      accountSelector: []
    });
    this.addTile();

    this.setAccountGroups();
  }

  addDeposit(value: number) {
    const _value = this.depositValue.toString() + value;
    this.depositValue = Number(_value);
  }

  correction() {
    const _value = this.depositValue.toString();
    const newValue = _value.substring(0, _value.length - 1);
    this.depositValue = Number(newValue);
  }

  clearAll() {
    this.depositValue = 0;
  }

  //BUTTONS
  addTile() {
    for (let i = 1; i < 10; i++) {
      const element = {
        text: i.toString(),
        value: i,
        cols: 1,
        rows: 1,
        color: "black"
      };

      this.tiles.push(element);
    }
  }

  submitDeposit() {
    if (!this.data.userAccount) {
      console.log("Please select an account to begin deposit.");
      return;
    }

    let _depositValue = this.depositValue;
    const _credit = Number(this.data.userAccount.credit);
    let _totalCredit = 0;
    const accountName = this.stringHelperService.camelize(
      this.data.userAccount.accountType.toString()
    );

    if (accountName === "mortgage" || accountName === "lineOfCredit") {
      _totalCredit = _credit - _depositValue;
      _depositValue = _depositValue * -1;
    }
    else {
      _totalCredit = _credit + this.depositValue;
    }

    const depositForm = this.fb.group({
      uid: [ this.data.user._id ],
      accountNumber: [ this.data.userAccount.accountNumber ],
      history: this.fb.group({
        description: [ "ATM Deposit" ],
        value: [ _depositValue ]
      })
    });

    depositForm.addControl(
      accountName,
      this.fb.group({
        accountNumber: [ this.data.userAccount.accountNumber ],
        credit: [ _totalCredit ]
      })
    );

    /** Posting Transaction */
    this.userAccountTransactionsApiService
      .postAccountTransaction(depositForm.value)
      .subscribe({
        next: (resp) => {
          /** Patch Account Balance */
          this.userAccountsApiService
            .patcheBalance(depositForm.value)
            .subscribe({
              next: (resp) => {
                this.stringHelperService.openSnackBar(
                  `Transaction Complete, new account balance: $${_totalCredit.toFixed(
                    2
                  )}`,
                  `x`
                );
                this.dialogRef.close(resp);
              },
              error: (err) => {
                console.log({
                  message: "Account balance patch error.",
                  error: err
                });
              }
            });
        },
        error: (err) => {
          console.log({
            message: "Posting transaction histoy error.",
            error: err
          });
        }
      });
  }

  setAccountGroups() {
    const _userAccounts = this.data.accountLists;

    const chequingAccount = this.filterAccount(_userAccounts, "chequing");
    const savingsAccount = this.filterAccount(_userAccounts, "savings");
    const mortgageAccount = this.filterAccount(_userAccounts, "mortgage");
    const lineOfCreditAccount = this.filterAccount(
      _userAccounts,
      "line of credit"
    );

    if (chequingAccount) this.fillAccountSelector(chequingAccount, "chequing");

    if (savingsAccount) this.fillAccountSelector(savingsAccount, "savings");

    if (mortgageAccount) this.fillAccountSelector(mortgageAccount, "mortgage");

    if (lineOfCreditAccount)
      this.fillAccountSelector(lineOfCreditAccount, "line of credit");

    this.accountSelectorController!.valueChanges.subscribe({
      next: (resp) => {
        this.setSelectedAccount(resp);
      },
      error: (err) => {
        console.log({
          errMessage: '',
          error: err
        });
      }
    });

    if (this.accountSelector!.length > 0) {
      this.accountSelectorController!.setValue(
        this.accountSelector![0].accounts[0].accountNumber
      );
    }
  }

  filterAccount = (
    userAccount: UserAccounts[],
    accountType: String
  ): UserAccounts[] => {
    return userAccount.filter((x) => x.accountType === accountType);
  };

  fillAccountSelector(userAccount: UserAccounts[], accountName: String) {
    this.accountSelector!.push({
      accountName: accountName,
      accounts: [ ...userAccount ]
    });
  }

  get accountSelectorController() {
    return this.accountSelectorForm!.get("accountSelector");
  }

  setSelectedAccount(value: Number) {
    const _userAccount = this.data.accountLists;
    const userAccount = _userAccount.filter((x) => x.accountNumber === value);

    if (userAccount) this.data.userAccount = userAccount[0];
  }
}
