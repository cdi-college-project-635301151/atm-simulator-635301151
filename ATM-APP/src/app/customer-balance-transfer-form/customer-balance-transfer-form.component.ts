import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StringHelperService } from "../helpers/string-helper.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { UserAccounts } from "../models/user-accounts";
import { Users } from "../models/users";
import { AccountGroupInterface } from "../models/account-group-interface";
import { AccountFormBuilderService } from "../helpers/account-form-builder.service";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";

interface AccountTransferInterface {
  accountLists: UserAccounts[];
  userAccount: UserAccounts;
  user: Users;
}

@Component({
  selector: "app-customer-balance-transfer-form",
  templateUrl: "./customer-balance-transfer-form.component.html",
  styleUrls: [ "./customer-balance-transfer-form.component.css" ]
})
export class CustomerBalanceTransferFormComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountTransferInterface,
    private dialogRef: MatDialogRef<CustomerBalanceTransferFormComponent>,
    private fb: FormBuilder,
    private accountFormBuilderService: AccountFormBuilderService,
    private stringHelperService: StringHelperService,
    private userAccountsApiService: UserAccountsApiService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService
  ) {}

  accountTransferForm?: FormGroup;
  toAccountTransactionForm?: FormGroup;
  fromAccountTransactionForm?: FormGroup;
  lineOfCreditAccountForm?: FormGroup;

  accountGroupSelector: AccountGroupInterface[] = [];
  transferGrouptSelector: AccountGroupInterface[] = [];

  lineOfCreditAccount: UserAccounts[] = [];
  transferMessage: String = "";
  transferError: Boolean = false;

  ngOnInit(): void {
    this.accountTransferForm = this.fb.group({
      fromAccount: [ null, Validators.required ],
      toAccount: [ null, Validators.required ],
      amountToTransfer: [
        null,
        [ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/) ]
      ]
    });

    this.lineOfCreditAccount = this.data.accountLists.filter(
      (x) => x.accountType === "line of credit"
    );

    this.initAccountSelector();
    this.fromAccountSelectorOnChangeEvent();
    this.amountToTransferOnChangeEvent();
    this.toAccountSelectorOnChangeEvent();
  }

  toAccountSelectorOnChangeEvent() {
    this.getToAccountSelector.valueChanges.subscribe({
      next: (resp) => {
        this.validateTransfers(this.getAmountToTransfer.value);
      },
      error: (err) => {
        console.log({
          errorMessage:
            "Error while processing to account value on-change event",
          error: err
        });
      }
    });
  }

  amountToTransferOnChangeEvent() {
    this.getAmountToTransfer.valueChanges.subscribe({
      next: (value) => {
        this.validateTransfers(value);
      }
    });
  }

  fromAccountSelectorOnChangeEvent() {
    this.getFromAccountSelector.valueChanges.subscribe({
      next: (value) => {
        console.log(value);
        if (value) {
          this.initToAccountSelector(value);
        }
        else {
          this.transferGrouptSelector = [];
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "Error while accessing fromAccount value.",
          error: err
        });
      }
    });
  }

  validateTransfers(value: Number) {
    this.transferMessage = "";
    this.transferError = false;

    // ACCOUNT NUMBERS
    const fromAccountNumber = this.getFromAccountSelector.value;
    const toAccountNumber = this.getToAccountSelector.value;

    // ACCOUNT NAMES
    const toAccountName = this.stringHelperService.camelize(
      this.getAccountName(toAccountNumber).toString()
    );
    const fromAccountName = this.stringHelperService.camelize(
      this.getAccountName(fromAccountNumber).toString()
    );

    // AVAILABLE CREDIT
    const fromAvailableCredit = this.getCredit(
      this.getFromAccountSelector.value
    );
    const toAvailableCredit = this.getCredit(this.getToAccountSelector.value);

    const _toLoanAmount = Number(value) - Number(fromAvailableCredit);

    let _toCreditAmount = Number(value) + Number(toAvailableCredit);
    let _fromCreditAmount = Number(fromAvailableCredit) - Number(value);
    let _fromHistoryValueAmount = Number(value) * -1;
    let _fromAccountDescription = `Account transfer to ${fromAccountName}`;
    let _toAccountDescription = `Account transfer from ${toAccountName}`;
    let _historyValue = Number(value);

    // STOP IF THERE IS NOT ENOUGH BALANCE AND THERE IS NO LINE OF CREDIT AVAILABLE
    if (fromAvailableCredit < value && this.lineOfCreditAccount.length === 0) {
      this.transferMessage = `You don't have enough balance.`;
      this.transferError = true;
      return;
    }

    switch (toAccountName) {
      case "lineOfCredit":
        if (fromAvailableCredit < value) {
          this.transferError = true;
          this.transferMessage = "Not enough balance to transfer.";
          return;
        }

        _toCreditAmount =
          Number(this.lineOfCreditAccount[0].credit) - Number(value);
        _historyValue = Number(value) * -1;
        _toAccountDescription = `Thank you! payment ${fromAccountName} transfer.`;

        break;
      case "mortgage":
        _toCreditAmount = Number(toAvailableCredit) - Number(value);
        _historyValue = Number(value) * -1;
        _toAccountDescription = `Thank you! payment ${fromAccountName} transfer.`;

        if (fromAvailableCredit < Number(value)) {
          _fromCreditAmount = 0;
          _fromHistoryValueAmount = (Number(value) - _toLoanAmount) * -1;
          this.transferMessage = `$${_toLoanAmount.toFixed(
            2
          )} will be automatically allocated to line of credit account.`;
        }
        break;
      default:
        if (fromAvailableCredit < value) {
          _fromCreditAmount = 0;
          _fromHistoryValueAmount = (Number(value) - _toLoanAmount) * -1;
          this.transferMessage = `$${_toLoanAmount.toFixed(
            2
          )} will be automatically allocated to line of credit account.`;
        }
        break;
    }

    this.fromAccountTransactionForm = this.accountFormBuilderService.createAccountHistoryForm(
      this.accountFormBuilderService.createAccountTransactionForm(
        fromAccountName,
        fromAccountNumber,
        _fromCreditAmount,
        this.data.user._id
      ),
      _fromAccountDescription,
      _fromHistoryValueAmount
    );

    this.toAccountTransactionForm = this.accountFormBuilderService.createAccountHistoryForm(
      this.accountFormBuilderService.createAccountTransactionForm(
        toAccountName,
        toAccountNumber,
        _toCreditAmount,
        this.data.user._id
      ),
      _toAccountDescription,
      _historyValue
    );

    this.lineOfCreditAccountForm = this.accountFormBuilderService.createAccountHistoryForm(
      this.accountFormBuilderService.createAccountTransactionForm(
        "lineOfCredit",
        this.lineOfCreditAccount[0].accountNumber,
        Number(this.lineOfCreditAccount[0].credit) + _toLoanAmount,
        this.data.user._id
      ),
      `Account transfer auto alocation from ${fromAccountName} to ${toAccountName}.`,
      _toLoanAmount
    );
  }

  submitRequest() {
    const toTransferAmount = this.getAmountToTransfer.value;
    const availableBalance = this.getCredit(this.getFromAccountSelector.value);
    const toAccountName = this.getAccountName(this.getToAccountSelector.value);

    //STOP THE TRANSACTIONS IF ACCOUNT BALANCE IS NOT ENOUGH
    if (
      toTransferAmount > availableBalance &&
      toAccountName === "lineOfCredit"
    ) {
      return;
    }

    //CHECKS IF BALANCE AND IF THE ACCOUNT HA LINE OF CREDIT
    if (
      toTransferAmount > availableBalance &&
      this.lineOfCreditAccount.length > 0
    ) {
      console.log({
        lineOfCredit: this.lineOfCreditAccountForm!.value
      });
      this.postHitoryTransactions(
        this.lineOfCreditAccountForm!
      ).then((resp) => {
        this.patchBalance(this.lineOfCreditAccountForm!);
      });
    }

    console.log({
      toAccount: this.toAccountTransactionForm!.value,
      fromAccount: this.fromAccountTransactionForm!.value
    });

    /*
    POSTING TRANSACTION HISTORY FIRST
    */

    this.postHitoryTransactions(this.toAccountTransactionForm!).then((resp) => {
      this.postHitoryTransactions(
        this.fromAccountTransactionForm!
      ).then((resp) => {
        this.patchBalance(this.toAccountTransactionForm!).then((resp) => {
          this.patchBalance(this.fromAccountTransactionForm!).then((resp) => {
            this.stringHelperService.openSnackBar(
              `Successfully transfered ${toTransferAmount.toFixed(2)}.`,
              `x`
            );
            this.dialogRef.close(resp);
          });
        });
      });
    });
  }

  postHitoryTransactions = (
    form: FormGroup
  ): Promise<UserAccountTransactionHistory[]> => {
    return new Promise((promise) => {
      this.userAccountTransactionsApiService
        .postAccountTransaction(form.value)
        .subscribe({
          next: (resp) => {
            promise(resp);
          },
          error: (err) => {
            console.log({
              errorMessage: "Error occured while posting account history.",
              error: err
            });
          }
        });
    });
  };

  patchBalance = (form: FormGroup): Promise<UserAccounts[]> => {
    return new Promise((promise) => {
      this.userAccountsApiService.patcheBalance(form.value).subscribe({
        next: (resp) => {
          promise(resp);
        },
        error: (err) => {
          console.log({
            errorMessage: "Error occured while posting account history.",
            error: err
          });
        }
      });
    });
  };

  initAccountSelector() {
    console.log(this.data.accountLists);
    const chequingAccount = this.data.accountLists.filter(
      (x) => x.accountType === "chequing" && x.credit > 0
    );

    const savingsAccount = this.data.accountLists.filter(
      (x) => x.accountType === "savings" && x.credit > 0
    );

    if (chequingAccount.length > 0) {
      this.accountGroupSelector.push({
        accountName: "chequing",
        accounts: [ ...chequingAccount ]
      });
    }

    if (savingsAccount.length > 0) {
      this.accountGroupSelector.push({
        accountName: "savings",
        accounts: [ ...savingsAccount ]
      });
    }
  }

  initToAccountSelector(value: Number) {
    const chequingAccount = this.data.accountLists.filter(
      (x) => x.accountNumber !== value && x.accountType === "chequing"
    );
    const savingsAccount = this.data.accountLists.filter(
      (x) => x.accountNumber !== value && x.accountType === "savings"
    );
    const mortgageAccount = this.data.accountLists.filter(
      (x) => x.accountNumber !== value && x.accountType === "mortgage"
    );
    const lineOfCreditAccount = this.data.accountLists.filter(
      (x) => x.accountNumber !== value && x.accountType === "line of credit"
    );

    if (chequingAccount.length > 0)
      this.fillAccountSelector(chequingAccount, "chequing");
    if (savingsAccount.length > 0)
      this.fillAccountSelector(savingsAccount, "savings");
    if (mortgageAccount.length > 0)
      this.fillAccountSelector(mortgageAccount, "mortgage");
    if (lineOfCreditAccount.length > 0)
      this.fillAccountSelector(lineOfCreditAccount, "line of credit");
  }

  fillAccountSelector(userAccount: UserAccounts[], accountName: String) {
    this.transferGrouptSelector.push({
      accountName: accountName,
      accounts: [ ...userAccount ]
    });
  }

  get getFromAccountSelector() {
    return this.accountTransferForm!.get("fromAccount")!;
  }

  get getToAccountSelector() {
    return this.accountTransferForm!.get("toAccount")!;
  }

  get getAmountToTransfer() {
    return this.accountTransferForm!.get("amountToTransfer")!;
  }

  getCredit(accountNumber: Number): Number {
    const credit = this.data.accountLists.filter(
      (x) => x.accountNumber === accountNumber
    );
    return credit ? credit[0].credit : 0;
  }

  getAccountName(accountNumber: Number): String {
    const accountName = this.data.accountLists.filter(
      (x) => x.accountNumber === accountNumber
    );
    return accountName ? accountName[0].accountType : "";
  }
}
