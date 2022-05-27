import { Component, Inject, OnInit } from "@angular/core";
import { StringHelperService } from "../helpers/string-helper.service";
import { Users } from "../models/users";
import { UserAccounts } from "../models/user-accounts";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserPayeeCustomers } from "../models/user-payee-customers";
import { AccountGroupInterface } from "../models/account-group-interface";
import { AccountFormBuilderService } from "../helpers/account-form-builder.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";

interface PayBillsInterface {
  user: Users;
  accountLists: UserAccounts[];
  userPayees: UserPayeeCustomers[];
}

@Component({
  selector: "app-customer-pay-bills-form",
  templateUrl: "./customer-pay-bills-form.component.html",
  styleUrls: [ "./customer-pay-bills-form.component.css" ]
})
export class CustomerPayBillsFormComponent implements OnInit {
  constructor(
    private accountFormBuilderService: AccountFormBuilderService,
    private stringHelperService: StringHelperService,
    @Inject(MAT_DIALOG_DATA) public data: PayBillsInterface,
    private dialogRef: MatDialogRef<CustomerPayBillsFormComponent>,
    private fb: FormBuilder,
    private userAccountsApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService
  ) {}

  lineOfCreditAccount?: UserAccounts;
  payBillsForm?: FormGroup;
  accountTransactionForm?: FormGroup;
  lineOfCreditForm?: FormGroup;

  payFormError: String = "";

  accountGroupInterface: AccountGroupInterface[] = [];

  ngOnInit(): void {
    this.initPayBillForm();
    this.fillAccountController();

    const lineOfCreditAccount = this.filterAccount(
      this.data.accountLists,
      "line of credit"
    );

    if (lineOfCreditAccount.length > 0) {
      this.lineOfCreditAccount = lineOfCreditAccount[0];
    }
  }

  initPayBillForm = () => {
    this.payBillsForm = this.fb.group({
      accountFrom: [ null, [ Validators.required ] ],
      customer: [ null, [ Validators.required ] ],
      amount: [ null, [ Validators.required ] ]
    });
  };

  fillAccountController() {
    const chequing = this.filterAccount(this.data.accountLists, "chequing");
    const savings = this.filterAccount(this.data.accountLists, "savings");

    if (chequing) this.fillAccountGroupSelector(chequing, "chequing");

    // Does not include chequing for now
    // if (savings) this.fillAccountGroupSelector(savings, "savings");
  }

  fillAccountGroupSelector(userAccount: UserAccounts[], accountName: String) {
    this.accountGroupInterface.push({
      accountName: accountName,
      accounts: [ ...userAccount ]
    });
  }

  filterAccount(
    userAccount: UserAccounts[],
    accountType: String
  ): UserAccounts[] {
    return userAccount.filter(
      (x) => x.accountType === accountType && x.credit > 0
    );
  }

  getAccountName(userAccount: UserAccounts[], accountNumber: Number): string {
    const userAccountArray = userAccount.filter(
      (x) => x.accountNumber === accountNumber
    );
    return userAccountArray.length > 0
      ? userAccountArray[0].accountType.toString()
      : "";
  }

  getCredit(accountNumber: Number, userAccount: UserAccounts[]): Number {
    const credit = userAccount.filter((x) => x.accountNumber === accountNumber);
    return credit.length > 0 ? credit[0].credit : 0;
  }

  getCustomerName(
    accountNumber: Number,
    userPayeeCustomer: UserPayeeCustomers[]
  ): String {
    const userPayeeArray = userPayeeCustomer.filter(
      (x) => x.accountNumber === accountNumber
    );
    return userPayeeArray.length > 0 ? userPayeeArray[0].customerName : "";
  }

  onBlur() {
    this.payFormError = "";

    const amount: Number = this.amountFormController.value;
    const _amount = Number(amount.toFixed(2));
    this.amountFormController.setValue(amount.toFixed(2));

    const lineOfCreditBalance: Number = this.lineOfCreditAccount
      ? this.lineOfCreditAccount.credit
      : 0;

    const accountName = this.stringHelperService.camelize(
      this.getAccountName(
        this.data.accountLists,
        this.accountFromFormController.value
      )
    );
    const customerName = this.getCustomerName(
      this.customerFormController.value,
      this.data.userPayees
    );

    //PAY FROM ACCOUNT
    const credit = Number(
      this.getCredit(
        this.accountFromFormController.value,
        this.data.accountLists
      )
    );

    let totalAmountToPay: Number = _amount + 1.25;
    let _newLineOfCreditBalance: Number = 0;
    let _loanAmount: Number = 0;
    let _newCredit = credit - (_amount + 1.25);

    if (credit < totalAmountToPay && !this.lineOfCreditAccount) {
      /** REJECT ALL TRANSACTION IF THERE IS NOT ENOUGH CREDIT TO PAY. */
      this.payFormError = `Insuficient balance. You only have $${credit.toFixed(
        2
      )} in your account.`;
      return;
    }

    if (credit < totalAmountToPay && this.lineOfCreditAccount) {
      /**
       * IF THE AMOUNT TO PAY IS GREATER THAN THE CREDIT BALANCE
       * EXTRA BILLS WILL BE AUTOMATICALLY ALOCATED TO LINE OF CREDIT AS LOAN AMOUNT
       *
       * CALCULATE AMOUNT TO PAY + ANY FEE
       * CALCULATE LOAN AMOUNT
       */
      _loanAmount = _amount - credit + 1.25; //500 - 450 = 50 + 1.25
      totalAmountToPay = _amount - (Number(_loanAmount) - 1.25); // 500 - 50 = 450
      _newCredit = 0;
      _newLineOfCreditBalance =
        Number(lineOfCreditBalance) + Number(_loanAmount);

      this.lineOfCreditForm = this.accountFormBuilderService.createAccountHistoryForm(
        this.accountFormBuilderService.createAccountTransactionForm(
          "lineOfCredit",
          this.lineOfCreditAccount!.accountNumber,
          _newLineOfCreditBalance,
          this.data.user._id
        ),
        `Pay bills auto alocation for ${this.stringHelperService.toTitleCase(
          customerName.toString()
        )}`,
        _loanAmount
      );
    }

    this.accountTransactionForm = this.accountFormBuilderService.createAccountHistoryForm(
      this.accountFormBuilderService.createAccountTransactionForm(
        accountName,
        this.accountFromFormController.value,
        _newCredit,
        this.data.user._id
      ),
      `${this.stringHelperService.toTitleCase(
        customerName.toString()
      )} Payment.`,
      Number(totalAmountToPay) * -1
    );

    console.log({
      lineOfCredit: this.lineOfCreditForm ? this.lineOfCreditForm.value : null,
      account: this.accountTransactionForm.value
    });
  }

  submitForm() {
    if (this.payFormError !== "") {
      return;
    }

    if (this.lineOfCreditForm && this.lineOfCreditToloanAmount.value > 0) {
      this.postTransactionsHistory(this.lineOfCreditForm).then((resp) => {
        this.patchAccountBalance(this.lineOfCreditForm!).then((resp) => {
          console.log("Line of credit balance successfully updated.");
        });
      });
    }

    this.postTransactionsHistory(this.accountTransactionForm!).then((resp) => {
      this.patchAccountBalance(this.accountTransactionForm!).then((resp) => {
        this.stringHelperService.openSnackBar(`Transaction complete.`, "x");
        this.dialogRef.close(resp);
      });
    });
  }

  /**
   * UPDATE ACCOUNT.HISTORY DB
   */
  postTransactionsHistory(
    form: FormGroup
  ): Promise<UserAccountTransactionHistory[]> {
    return new Promise((promise) => {
      this.userAccountTransactionsApiService
        .postAccountTransaction(form.value)
        .subscribe({
          next: (resp) => {
            promise(resp);
          },
          error: (err) => {
            console.log({
              errorMessage: "Error occured while posting transaction histoy",
              error: err
            });
          }
        });
    });
  }

  /**
   * PATCH ACCOUNT BALANCE
   */
  patchAccountBalance(form: FormGroup): Promise<UserAccounts[]> {
    return new Promise((promise) => {
      this.userAccountsApiService.patcheBalance(form.value).subscribe({
        next: (resp) => {
          promise(resp);
        },
        error: (err) => {
          console.log({
            errorMessage: "Error occured while patching account balance",
            error: err
          });
        }
      });
    });
  }

  get accountFromFormController() {
    return this.payBillsForm!.get("accountFrom")!;
  }

  get customerFormController() {
    return this.payBillsForm!.get("customer")!;
  }

  get amountFormController() {
    return this.payBillsForm!.get("amount")!;
  }

  get lineOfCreditToloanAmount() {
    return this.lineOfCreditForm!.get("history.value")!;
  }
}
