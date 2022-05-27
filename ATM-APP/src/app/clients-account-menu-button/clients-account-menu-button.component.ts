import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ClientsAccountCreateFormComponent } from "../clients-account-create-form/clients-account-create-form.component";
import { Users } from "../models/users";
import { UserAccounts } from "../models/user-accounts";
import { ClientsAccountComponent } from "../clients-account/clients-account.component";
import { ClientsAccountPayInterestComponent } from "../clients-account-pay-interest/clients-account-pay-interest.component";
import { ClientsLoanPaymentComponent } from "../clients-loan-payment/clients-loan-payment.component";

@Component({
  selector: "app-clients-account-menu-button",
  templateUrl: "./clients-account-menu-button.component.html",
  styleUrls: [ "./clients-account-menu-button.component.css" ]
})
export class ClientsAccountMenuButtonComponent implements OnInit {
  @Input() userInformation: Users[] = [];
  @Input() userAccounts: UserAccounts[] = [];

  constructor(
    private dialog: MatDialog,
    private clientsAccountComponent: ClientsAccountComponent
  ) {}

  ngOnInit(): void {}

  openCreateAccountDialog() {
    const dialogRef = this.dialog.open(ClientsAccountCreateFormComponent, {
      width: "300px",
      panelClass: "custom-dialog-container",
      data: this.userAccounts
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.clientsAccountComponent.initUserAccount(resp);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  openPayInterestDialog(accountType: String) {
    const dialogRef = this.dialog.open(ClientsAccountPayInterestComponent, {
      width: "800px",
      data: {
        _id: this.userInformation[0]._id,
        _accountType: accountType,
        accounts: this.userAccounts
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.userAccounts = resp;
          this.clientsAccountComponent.initUserAccount(resp);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  openMortgagePayable() {
    const mortgagePayables = this.userAccounts;

    const dialogRef = this.dialog.open(ClientsLoanPaymentComponent, {
      width: "400px",
      data: {
        userAccount: mortgagePayables,
        userInfo: this.userInformation[0]
      }
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        this.userAccounts = resp;
        this.clientsAccountComponent.initUserAccount(resp);
      }
    });
  }
}
