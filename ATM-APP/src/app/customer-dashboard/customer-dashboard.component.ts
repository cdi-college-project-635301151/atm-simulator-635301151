import { Component, OnInit, ViewChild } from "@angular/core";
import { TokenValidatorService } from "../shared/token-validator.service";
import { Users } from "../models/users";
import { Router } from "@angular/router";
import { StringHelperService } from "../helpers/string-helper.service";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { UserAccounts } from "../models/user-accounts";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { ClientsAccountHistoryComponent } from "../clients-account-history/clients-account-history.component";
import { CustomerDepositFormComponent } from "../customer-deposit-form/customer-deposit-form.component";
import { CustomerWithdrawalFormComponent } from "../customer-withdrawal-form/customer-withdrawal-form.component";
import { UserPayeesApiService } from "../apiService/user-payees-api.service";
import { UserPayeeCustomers } from "../models/user-payee-customers";

@Component({
  selector: "app-customer-dashboard",
  templateUrl: "./customer-dashboard.component.html",
  styleUrls: [ "./customer-dashboard.component.css" ]
})
export class CustomerDashboardComponent implements OnInit {
  user?: Users;
  userPayee: UserPayeeCustomers[] = [];
  userAccount: UserAccounts[] = [];
  userAccountDataSource = new MatTableDataSource(this.userAccount);

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  columnHeaders: String[] = [
    "accountType",
    "index",
    "accountNumber",
    "credit",
    "status",
    "actions"
  ];

  constructor(
    private tokenValidatorService: TokenValidatorService,
    private route: Router,
    private stringHelperService: StringHelperService,
    private userAccountsApiService: UserAccountsApiService,
    private matDialog: MatDialog,
    private userPayeesApiService: UserPayeesApiService
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser = () => {
    const token = this.tokenValidatorService.getToken();
    this.tokenValidatorService
      .validateToken(token)
      .then((resp) => {
        this.user = resp;
        this.getUserAccount(resp._id);
        this.getPayees(resp._id);
      })
      .catch((err) => {
        console.log(err);

        this.route.navigate([ "/login" ]);
      });
  };

  getPayees = (uid: String) => {
    this.userPayeesApiService.getPayees(uid).subscribe({
      next: (resp) => {
        this.userPayee = resp;
      },
      error: (err) => {
        console.log({
          errorMessage: "Error while getting payees",
          error: err
        });
      }
    });
  };

  getAddress = (): string => {
    const address = this.user!.address;
    const streetAddress = `${address.streetAddress} ${address.addressDesc}`.trim();

    const fullAddress = `${this.stringHelperService.toTitleCase(
      streetAddress
    )}, ${address.city}, ${address.province.toUpperCase()}, ${address.postal.toUpperCase()}`;
    return fullAddress;
  };

  setDataSource() {
    this.userAccountDataSource = new MatTableDataSource(this.userAccount);
  }

  showAccountHistory = (accountNumber: Number) => {
    const dialogRef = this.matDialog.open(ClientsAccountHistoryComponent, {
      width: "800px",
      data: {
        accountNumber: accountNumber
      }
    });
  };

  openAccountDepositForm = (userAccount: UserAccounts) => {
    const dialogRef = this.matDialog.open(CustomerDepositFormComponent, {
      width: "500px",
      data: {
        userAccount: userAccount,
        user: this.user
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.userAccount = resp;
          this.setDataSource();
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  };

  openAccountWithdrawalForm = (userAccount: UserAccounts) => {
    const dialogRef = this.matDialog.open(CustomerWithdrawalFormComponent, {
      width: "500px",
      data: {
        userAccount: userAccount,
        accountLists: this.userAccount,
        user: this.user
      }
    });
    dialogRef.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.userAccount = resp;
          this.setDataSource();
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  };

  getUserAccount = (id: String) => {
    this.userAccountsApiService.getAccounts(id).subscribe({
      next: (resp) => {
        this.userAccount = resp;
        this.setDataSource();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.userAccountDataSource.paginator = this.paginator!;
        this.userAccountDataSource.sort = this.sort!;
      }
    });
  };

  applyFilter = (event: Event) => {
    const filterValue = (event.target as HTMLInputElement).value;
    this.userAccountDataSource!.filter = filterValue.trim().toLowerCase();
  };

  getIndex = (_id: String): string => {
    const indx = this.userAccount!.map((x) => x._id).indexOf(_id) + 1;
    return this.stringHelperService.addLeadingZeros(indx, 3);
  };
}
