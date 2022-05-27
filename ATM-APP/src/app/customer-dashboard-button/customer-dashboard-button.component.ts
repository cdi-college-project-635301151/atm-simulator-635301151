import { Component, Input, OnInit } from "@angular/core";
import { CustomerDashboardComponent } from "../customer-dashboard/customer-dashboard.component";
import { MatDialog } from "@angular/material/dialog";
import { CustomerDepositFormComponent } from "../customer-deposit-form/customer-deposit-form.component";
import { CustomerBalanceTransferFormComponent } from "../customer-balance-transfer-form/customer-balance-transfer-form.component";
import { CustomerPayBillsFormComponent } from "../customer-pay-bills-form/customer-pay-bills-form.component";
import { CustomerPayBillsAddPayeeComponent } from "../customer-pay-bills-add-payee/customer-pay-bills-add-payee.component";
import { UserPayeesApiService } from "../apiService/user-payees-api.service";
import { Users } from "../models/users";
import { UserPayeeCustomers } from "../models/user-payee-customers";

@Component({
  selector: "app-customer-dashboard-button",
  templateUrl: "./customer-dashboard-button.component.html",
  styleUrls: [ "./customer-dashboard-button.component.css" ]
})
export class CustomerDashboardButtonComponent implements OnInit {
  constructor(
    private customerDashboardComponent: CustomerDashboardComponent,
    private dialog: MatDialog,
    private userPayeesApiService: UserPayeesApiService
  ) {}

  user?: Users;
  payeeCustomers: UserPayeeCustomers[] = [];

  ngOnInit(): void {
    this.user = this.customerDashboardComponent.user;
  }

  openDepositForm() {
    const userAccount = this.customerDashboardComponent.userAccount;
    const user = this.customerDashboardComponent.user;

    const dialogRef = this.dialog.open(CustomerDepositFormComponent, {
      width: "500px",
      data: {
        user: user,
        accountLists: userAccount
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.customerDashboardComponent.userAccount = resp;
          this.customerDashboardComponent.setDataSource();
        }
      },
      error: (err) => {
        console.log({
          errorMessage: `Transaction error`,
          error: err
        });
      }
    });
  }

  openAccountTransferForm() {
    const userAccount = this.customerDashboardComponent.userAccount;
    const user = this.customerDashboardComponent.user;

    const dialogRef = this.dialog.open(CustomerBalanceTransferFormComponent, {
      width: "500px",
      data: {
        accountLists: userAccount,
        user: user
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.customerDashboardComponent.userAccount = resp;
          this.customerDashboardComponent.setDataSource();
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "Error occured while transfering balance.",
          error: err
        });
      }
    });
  }

  openPayBillsForm() {
    const userAccount = this.customerDashboardComponent.userAccount;
    const user = this.customerDashboardComponent.user;
    const userPayees = this.customerDashboardComponent.userPayee;

    const dialogRef = this.dialog.open(CustomerPayBillsFormComponent, {
      width: "500px",
      data: {
        user: user,
        accountLists: userAccount,
        userPayees: userPayees
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.customerDashboardComponent.userAccount = resp;
          this.customerDashboardComponent.setDataSource();
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "An error ocurred while paying your bill.",
          error: err
        });
      }
    });
  }

  openAddPayeeForm() {
    const dialogRef = this.dialog.open(CustomerPayBillsAddPayeeComponent, {
      width: "400px",
      data: {
        user: this.user,
        payeeCustomers: this.payeeCustomers
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.customerDashboardComponent.userPayee = resp;
          console.log(this.payeeCustomers);
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "Error while adding a payee.",
          error: err
        });
      }
    });
  }
}
