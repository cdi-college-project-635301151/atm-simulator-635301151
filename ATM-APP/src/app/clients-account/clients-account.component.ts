import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { UserAccounts } from "../models/user-accounts";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { UserAccountsApiService } from "../apiService/user-accounts-api.service";
import { ActivatedRoute } from "@angular/router";
import { UsersApiService } from "../apiService/users-api.service";
import { Users } from "../models/users";
import { MatDialog } from "@angular/material/dialog";
import { ClientsAccountHistoryComponent } from "../clients-account-history/clients-account-history.component";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";

@Component({
  selector: "app-clients-account",
  templateUrl: "./clients-account.component.html",
  styleUrls: [ "./clients-account.component.css" ]
})
export class ClientsAccountComponent implements OnInit, AfterViewInit {
  columnHeaders = [
    "rowNum",
    "accountType",
    "accountNumber",
    "balance",
    "status",
    "actions"
  ];

  userAccounts: UserAccounts[] = [];
  accountsDb = new MatTableDataSource(this.userAccounts);
  userInformation: Users[] = [];
  userAccountHistory: UserAccountTransactionHistory[] = [];

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private accountsApiService: UserAccountsApiService,
    private route: ActivatedRoute,
    private userApiService: UsersApiService,
    private dialogRef: MatDialog,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService
  ) {}

  ngAfterViewInit(): void {
    if (this.userAccounts) {
      this.accountsDb = new MatTableDataSource(this.userAccounts);
      this.accountsDb.paginator = this.paginator!;
      this.accountsDb.sort = this.sort!;
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const uid = params.get("uid");
      this.getClientInfo(uid!);
      this.getClientAcount(uid!);
    });
  }

  applyFilter(event: Event) {
    if (this.accountsDb) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.accountsDb.filter = filterValue.trim().toLowerCase();

      if (this.accountsDb.paginator) this.accountsDb.paginator.firstPage();
    }
  }

  getClientAcount(id: String) {
    this.accountsApiService.getAccounts(id).subscribe({
      next: (resp) => {
        this.userAccounts = resp;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.ngAfterViewInit();
      }
    });
  }

  getClientInfo(id: String) {
    this.userApiService.getUser(id).subscribe({
      next: (resp) => {
        this.userInformation = [ resp ];
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getIndex(_id: String): Number {
    return this.userAccounts!.map((x) => x._id).indexOf(_id) + 1;
  }

  initUserAccount(userAccount: UserAccounts[]) {
    this.userAccounts = userAccount;
    this.ngAfterViewInit();
  }

  openAccountHistory(accountNumber: Number) {
    const dialogRef = this.dialogRef.open(ClientsAccountHistoryComponent, {
      width: "800px",
      data: {
        accountNumber: accountNumber
      }
    });

    dialogRef.afterClosed().subscribe((resp: UserAccounts[]) => {
      if (resp) {
        console.log(resp);
      }
    });
  }

  
}
