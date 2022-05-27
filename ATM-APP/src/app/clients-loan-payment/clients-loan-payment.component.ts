import { Component, OnInit, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from "@angular/material/dialog";
import { UserAccounts } from "../models/user-accounts";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Users } from "../models/users";
import { StringHelperService } from "../helpers/string-helper.service";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { Accounts } from "../models/accounts";

interface LoansPayment {
  userAccount: UserAccounts[];
  userInfo: Users;
}

@Component({
  selector: "app-clients-loan-payment",
  templateUrl: "./clients-loan-payment.component.html",
  styleUrls: [ "./clients-loan-payment.component.css" ]
})
export class ClientsLoanPaymentComponent implements OnInit {
  mortgageAccounts: UserAccounts[] = [];
  lineOfCreditAccount: UserAccounts[] = [];
  availableAccounts: UserAccounts[] = [];

  loanPaymentForm?: FormGroup;
  payFromForm?: FormGroup;
  payToForm?: FormGroup;
  lineOfCreditForm?: FormGroup;

  errorMessage?: String;
  isSubmit: Boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private loansPayment: LoansPayment,
    private dialogRef: MatDialogRef<ClientsLoanPaymentComponent>,
    private fb: FormBuilder,
    private stringHelper: StringHelperService,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private userAccountsApiService: UserAccountsApiService
  ) {}

  ngOnInit(): void {
    this.initTemplate();
  }

  initTemplate() {
    this.mortgageAccounts = this.loansPayment.userAccount.filter(
      (x) => x.accountType === "mortgage"
    );
    this.lineOfCreditAccount = this.loansPayment.userAccount.filter(
      (x) => x.accountType === "line of credit"
    );
    this.availableAccounts = this.loansPayment.userAccount.filter(
      (x) =>
        x.credit > 0 &&
        (x.accountType === "savings" || x.accountType === "chequing")
    );

    this.loanPaymentForm = this.fb.group({
      payFrom: [ null, Validators.required ],
      payTo: [ null, Validators.required ],
      amount: [ null, Validators.required ]
    });

    this.payFromForm = this.fb.group({
      uid: [ this.loansPayment.userInfo._id ],
      accountNumber: [],
      history: this.fb.group({
        description: [ "Mortgage auto-deductions." ],
        value: []
      })
    });

    this.lineOfCreditForm = this.fb.group({
      uid: [ this.loansPayment.userInfo._id ],
      accountNumber: [],
      lineOfCredit: this.fb.group({
        accountNumber: [],
        credit: []
      }),
      history: this.fb.group({
        description: [ "Mortgage auto-deductions." ],
        value: []
      })
    });

    this.payToForm = this.fb.group({
      accountNumber: [],
      uid: [ this.loansPayment.userInfo._id ],
      history: this.fb.group({
        description: [ "Mortgage Payment - thank you!" ],
        value: []
      })
    });
  }

  sumitRequest() {
    this.errorMessage = "";
    const payFromAccountName = this.getAccountName(
      this.availableAccounts,
      this.payFrom!.value
    );
    const payToAccountName = this.getAccountName(
      this.mortgageAccounts,
      this.payTo!.value
    );

    const mortgageFund = this.getCredit(
      this.payTo!.value,
      this.mortgageAccounts
    );
    const availableFund = this.getCredit(
      this.payFrom!.value,
      this.availableAccounts
    );
    const amountToPay: Number = this.amount!.value;

    const creditToPay = Number(amountToPay) - Number(availableFund);
    const deductions = Number(amountToPay) - creditToPay;
    const credit = Number(availableFund) - Number(amountToPay);
    const mortgageDeduction = Number(mortgageFund) - Number(amountToPay);

    console.log({
      availableFund: availableFund,
      amountToPay: amountToPay,
      deductions: deductions,
      credit: credit,
      mortgageDeduction: mortgageDeduction
    });

    if (creditToPay >= 1 && this.lineOfCreditAccount.length === 0) {
      this.errorMessage = `Insuficient fund from account number: ${this.payFrom!
        .value}`;

      return;
    }
    else if (creditToPay >= 1 && this.lineOfCreditAccount.length >= 1) {
      const accountNumber = this.lineOfCreditAccount[0].accountNumber;
      const lineOfCreditBalance = this.getCredit(
        accountNumber,
        this.lineOfCreditAccount
      );
      const newCredit = Number(lineOfCreditBalance) + Number(creditToPay);

      this.lineOfCreditForm!.patchValue({
        accountNumber: accountNumber,
        lineOfCredit: {
          accountNumber: accountNumber,
          credit: newCredit
        },
        history: {
          value: creditToPay
        }
      });

      console.log(this.lineOfCreditForm!.value);

      this.postTransaction(this.lineOfCreditForm!);
      this.patchBalance(this.lineOfCreditForm!).then((resp) => {
        console.log(resp);
      });
    }

    // PATCH OUR FORMS

    this.payFromForm!.addControl(
      payFromAccountName,
      this.fb.group({
        accountNumber: [ this.payFrom!.value ],
        credit: [ credit > 0 ? credit : 0 ]
      })
    );

    this.payFromForm!.patchValue({
      accountNumber: this.payFrom!.value,
      history: {
        value:
          creditToPay > 0 ? deductions : this.getNegativeNumber(amountToPay)
      }
    });

    // MORTGAGE
    this.payToForm!.addControl(
      payToAccountName,
      this.fb.group({
        accountNumber: [ this.payTo!.value ],
        credit: [ mortgageDeduction ]
      })
    );

    this.payToForm!.patchValue({
      accountNumber: this.payTo!.value,
      history: {
        value: this.getNegativeNumber(this.amount!.value)
      }
    });

    this.isSubmit = true;

    console.log(this.payToForm!.value);
    console.log(this.payFromForm!.value);

    this.postTransaction(this.payFromForm!);
    this.postTransaction(this.payToForm!);

    this.patchBalance(this.payToForm!).then((resp) => {
      this.patchBalance(this.payFromForm!).then((resp) => {
        this.dialogRef.close(resp);
      });
    });
  }

  getNegativeNumber = (value: Number): Number => {
    const returnVal = Number(value) * -1;
    return returnVal;
  };

  getCredit = (accountNumber: Number, userAccount: UserAccounts[]): Number => {
    return userAccount.filter((x) => x.accountNumber === accountNumber)[0]
      .credit;
  };

  getAccountName = (
    userAccount: UserAccounts[],
    accountNumber: Number
  ): string => {
    return this.stringHelper.camelize(
      userAccount
        .filter((x) => x.accountNumber === accountNumber)[0]
        .accountType.toString()
    );
  };

  async patchBalance(userAccountForm: FormGroup): Promise<UserAccounts[]> {
    return new Promise((resp) => {
      this.userAccountsApiService
        .patcheBalance(userAccountForm.value)
        .subscribe({
          next: (res) => {
            resp(res);
          },
          error: (err) => {
            console.log(err);
          }
        });
    });
  }

  postTransaction = (historyForm: FormGroup) => {
    this.userAccountTransactionsApiService
      .postAccountTransaction(historyForm.value)
      .subscribe({
        next: (resp) => {},
        error: (err) => {
          console.log(err);
        }
      });
  };

  get payTo() {
    return this.loanPaymentForm!.get("payTo");
  }

  get payFrom() {
    return this.loanPaymentForm!.get("payFrom");
  }

  get amount() {
    return this.loanPaymentForm!.get("amount");
  }
}
