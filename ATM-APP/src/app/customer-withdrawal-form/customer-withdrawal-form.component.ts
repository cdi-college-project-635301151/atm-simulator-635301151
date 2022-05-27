import { Component, Inject, OnInit } from "@angular/core";
import { UserAccounts } from "../models/user-accounts";
import { Users } from "../models/users";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StringHelperService } from "../helpers/string-helper.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { TileInterface } from "../models/tile-interface";
import { AccountGroupInterface } from "../models/account-group-interface";
import { async } from "@angular/core/testing";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";
import { Atm } from "../models/atm";
import { AtmApiService } from "../apiService/atm-api.service";
import { AccountFormBuilderService } from "../helpers/account-form-builder.service";

interface AccountWithdrawalFormInterface {
  accountLists: UserAccounts[];
  userAccount: UserAccounts;
  user: Users;
}

@Component({
  selector: "app-customer-withdrawal-form",
  templateUrl: "./customer-withdrawal-form.component.html",
  styleUrls: [ "./customer-withdrawal-form.component.css" ]
})
export class CustomerWithdrawalFormComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountWithdrawalFormInterface,
    private dialogRef: MatDialogRef<CustomerWithdrawalFormComponent>,
    private fb: FormBuilder,
    private stringHelperService: StringHelperService,
    private userAccountsApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private atmApiService: AtmApiService,
    private accountFormBuilderService: AccountFormBuilderService
  ) {}

  withdrawalAmount: number = 0;

  tiles: TileInterface[] = [];
  withdrawalForm?: FormGroup;
  lineOfCreditForm?: FormGroup;
  atmWithdrawalForm?: FormGroup;

  accountSelector: AccountGroupInterface[] = [];
  accountSelectorForm?: FormGroup;

  withdrawalErrorString: String = "";
  withdrawalError: Boolean = false;

  atm?: Atm;

  ngOnInit(): void {
    this.addTile();

    this.initAtm();
  }

  initAtm() {
    this.atmApiService.getAtm().subscribe({
      next: (resp) => {
        this.atm = resp;
        console.log(resp);
        this.atmWithdrawalForm = this.fb.group({
          _id: [ resp._id ],
          history: this.fb.group({
            value: [ null ],
            accountNumber: [ null ]
          })
        });

        console.log(this.atmWithdrawalForm!.value);
      }
    });
  }

  clearAll() {
    this.withdrawalAmount = 0;
    this.withdrawalError = false;
    this.withdrawalErrorString = "";
  }

  correction() {
    const _value = this.withdrawalAmount.toString();
    const newValue = _value.substring(0, _value.length - 1);
    this.withdrawalAmount = Number(newValue);
    this.validateDeposit(this.withdrawalAmount);
  }

  addDeposit(value: number) {
    const _value = this.withdrawalAmount.toString() + value;
    this.withdrawalAmount = Number(_value);
    this.validateDeposit(this.withdrawalAmount);
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

  checkWithdrawalAmount = (value: number): Boolean => {
    const mod = value % 10;
    console.log(mod);
    return mod == 0 ? true : false;
  };

  validateDeposit(withdrwalAmount: Number) {
    this.withdrawalError = true;

    const isValueCorrect = this.checkWithdrawalAmount(Number(withdrwalAmount));

    const ATMBALANCE = this.atm!.balance;
    const CREDIT = this.data.userAccount.credit;
    const AccountName = this.stringHelperService.camelize(
      this.data.userAccount.accountType.toString()
    );

    let _lineOfCreditBalance: Number = 0;
    let _loanAmount: Number = 0;
    let _newLineOfCreditBalance: Number = 0;

    let _newCredit: Number = 0;
    let _amountToWithdraw: Number = 0;

    const lineOfCreditAccount = this.data.accountLists.filter(
      (x) => x.accountType === "line of credit"
    );

    _lineOfCreditBalance =
      lineOfCreditAccount.length > 0 ? lineOfCreditAccount[0].credit : 0;

    if (withdrwalAmount > 0) {
      this.withdrawalErrorString = "";

      if (ATMBALANCE < withdrwalAmount) {
        this.withdrawalError = true;
        this.withdrawalErrorString = `Insuficient ATM Balance, you can only withdraw up to $${ATMBALANCE.toFixed(
          2
        )}`;
        return;
      }

      if (withdrwalAmount < 10 && isValueCorrect) {
        this.withdrawalErrorString =
          "A minimum of $10.00 withdrwal is required.";
        return;
      }

      if (!isValueCorrect) {
        this.withdrawalErrorString =
          "The ATM is only able to dispense an amount divisible by 10.";
        return;
      }

      if (isValueCorrect && withdrwalAmount >= 1001) {
        this.withdrawalErrorString =
          "This ATM is only able to dispense up to $1000.00 on a single transaction.";
        return;
      }
    }

    if (isValueCorrect && withdrwalAmount >= 10 && withdrwalAmount <= 1000) {
      this.withdrawalError = false;
    }

    if (withdrwalAmount > CREDIT && lineOfCreditAccount.length > 0) {
      _newCredit = 0;
      _loanAmount = Number(withdrwalAmount) - Number(CREDIT);
      _amountToWithdraw = (Number(withdrwalAmount) - Number(_loanAmount)) * -1;
      _newLineOfCreditBalance =
        Number(_loanAmount) + Number(_lineOfCreditBalance);
    }
    else {
      _newCredit = Number(CREDIT) - Number(withdrwalAmount);
      _amountToWithdraw = Number(withdrwalAmount) * -1;
    }

    this.atmWithdrawalForm!.patchValue({
      history: {
        accountNumber: this.data.userAccount.accountNumber,
        value: Number(withdrwalAmount) * -1
      }
    });

    this.withdrawalForm = this.accountFormBuilderService.createAccountHistoryForm(
      this.accountFormBuilderService.createAccountTransactionForm(
        AccountName,
        this.data.userAccount.accountNumber,
        _newCredit,
        this.data.user._id
      ),
      "ATM withdrawal",
      _amountToWithdraw
    );

    if (lineOfCreditAccount.length > 0) {
      this.lineOfCreditForm = this.accountFormBuilderService.createAccountHistoryForm(
        this.accountFormBuilderService.createAccountTransactionForm(
          "lineOfCredit",
          lineOfCreditAccount[0].accountNumber,
          _newLineOfCreditBalance,
          this.data.user._id
        ),
        "ATM withdrawal auto allocation",
        _loanAmount
      );
    }
  }

  submitRequest() {
    if (this.lineOfCreditForm && this.lineOfCreditValue.value > 0) {
      console.log(this.lineOfCreditForm!.value);
      this.postAccountTransactionHistory(this.lineOfCreditForm!).then(() => {
        this.patchBalance(this.lineOfCreditForm!);
      });
    }

    if (this.atmWithdrawalForm && this.withdrawalForm) {
      console.log({
        atm: this.atmWithdrawalForm!.value,
        account: this.withdrawalForm!.value
      });

      this.atmApiService
        .postTransactions(this.atmWithdrawalForm!.value)
        .subscribe((resp) => {});

      this.postAccountTransactionHistory(this.withdrawalForm!).then(() => {
        this.patchBalance(this.withdrawalForm!).then((resp) => {
          this.stringHelperService.openSnackBar(
            `Transaction complete, please collect your $${this.withdrawalAmount.toFixed()}.`,
            "x"
          );
          this.dialogRef.close(resp);
        });
      });
    }
  }

  submitDeposit() {
    if (!this.data.userAccount) {
      console.log("Please select an account to begin deposit.");
      return;
    }

    const lineOfCredit = this.data.accountLists.filter(
      (x) => x.accountType === "line of credit"
    );

    let _lineOfCreditBalance: number = 0;
    let _totalCredit = 0;
    let _loanAmount = 0;
    let _withdrawalBalance = 0;

    const _withdrawalValue: number = this.withdrawalAmount;
    const _credit: number = Number(this.data.userAccount.credit);

    const accountName = this.stringHelperService.camelize(
      this.data.userAccount.accountType.toString()
    );

    if (_withdrawalValue > _credit && lineOfCredit.length > 0) {
      _loanAmount = _withdrawalValue - _credit;
      _lineOfCreditBalance = Number(lineOfCredit[0].credit) + _loanAmount;
      _withdrawalBalance = (_withdrawalValue - _loanAmount) * -1;
      _totalCredit = 0;
    }
    else {
      _totalCredit = _credit - _withdrawalValue;
      _withdrawalBalance = _withdrawalValue * -1;
    }

    this.lineOfCreditForm = this.fb.group({
      uid: [ this.data.user._id ],
      accountNumber: [ lineOfCredit[0].accountNumber ],
      lineOfCredit: this.fb.group({
        accountNumber: [ lineOfCredit[0].accountNumber ],
        credit: [ _lineOfCreditBalance ]
      }),
      history: this.fb.group({
        description: [ "ATM auto withdrawal alocation." ],
        value: [ _loanAmount ]
      })
    });

    this.withdrawalForm = this.fb.group({
      uid: [ this.data.user._id ],
      accountNumber: [ this.data.userAccount.accountNumber ],
      history: this.fb.group({
        description: [ "ATM Withdrawal" ],
        value: [ _withdrawalBalance ]
      })
    });

    this.withdrawalForm.addControl(
      accountName,
      this.fb.group({
        accountNumber: [ this.data.userAccount.accountNumber ],
        credit: [ _totalCredit ]
      })
    );

    if (_loanAmount > 0) {
      this.postAccountTransactionHistory(
        this.lineOfCreditForm!
      ).then((resp) => {
        this.patchBalance(this.lineOfCreditForm!).then((resp) => {
          this.stringHelperService.openSnackBar(
            `$${_loanAmount.toFixed(
              2
            )} have been transfered to line of credit account.`,
            "x"
          );

          //POST ACTUAL WITHDRAWAL
          this.postAccountTransactionHistory(
            this.withdrawalForm!
          ).then((resp) => {
            this.patchBalance(this.withdrawalForm!).then((resp) => {
              this.stringHelperService.openSnackBar(
                `Withdrawal transaction complete, credit: $${_totalCredit.toFixed(
                  2
                )}`,
                "x"
              );
              this.dialogRef.close(resp);
            });
          });
        });
      });
    }
    else {
      this.postAccountTransactionHistory(this.withdrawalForm).then((resp) => {
        this.patchBalance(this.withdrawalForm!).then((resp) => {
          this.stringHelperService.openSnackBar(
            `Withdrawal transaction complete, credit: $${_totalCredit.toFixed(
              2
            )}`,
            "x"
          );
          this.dialogRef.close(resp);
        });
      });
    }
  }

  postAccountTransactionHistory = (
    form: FormGroup
  ): Promise<UserAccountTransactionHistory[]> => {
    return new Promise((res) => {
      this.userAccountTransactionsApiService
        .postAccountTransaction(form.value)
        .subscribe({
          next: (resp) => {
            res(resp);
          },
          error: (err) => {
            console.log({
              errorMessage: "Posting transaction Error",
              error: err
            });
          }
        });
    });
  };

  patchBalance = (form: FormGroup): Promise<UserAccounts[]> => {
    return new Promise((res) => {
      this.userAccountsApiService.patcheBalance(form.value).subscribe({
        next: (resp) => {
          res(resp);
        },
        error: (err) => {
          console.log({
            errorMessage: "Posting transaction Error",
            error: err
          });
        }
      });
    });
  };

  get lineOfCreditValue() {
    return this.lineOfCreditForm!.get("history.value")!;
  }
}
