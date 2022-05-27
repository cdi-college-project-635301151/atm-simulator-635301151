import {
  Component,
  OnInit,
  Inject,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UserAccounts } from "../models/user-accounts";
import { UserAccountTransactionsApiService } from "../apiService/user-account-transactions-api.service";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";
import { UserAccountTransactions } from "../models/user-account-transactions";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { HttpClient } from "@angular/common/http";
import { MatTableDataSource } from "@angular/material/table";
import { StringHelperService } from "../helpers/string-helper.service";

@Component({
  selector: "app-clients-account-history",
  templateUrl: "./clients-account-history.component.html",
  styleUrls: [ "./clients-account-history.component.css" ]
})
export class ClientsAccountHistoryComponent implements OnInit, AfterViewInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserAccounts,
    private userAccountTransactionsApiService: UserAccountTransactionsApiService,
    private stringHelperService: StringHelperService
  ) {}

  displayedColumns: string[] = [
    "created",
    "state",
    "number",
    "description",
    "value"
  ];
  accountHistory: UserAccountTransactionHistory[] = [];
  accountTransactions?: UserAccountTransactions;
  dataSource = new MatTableDataSource(this.accountHistory);

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  ngOnInit(): void {
    this.getTransactionHistory(this.data.accountNumber);
  }

  ngAfterViewInit(): void {
    if (this.accountHistory) {
      this.dataSource = new MatTableDataSource(this.accountHistory);
      this.dataSource.paginator = this.paginator!;
      this.dataSource.sort = this.sort!;
    }
  }

  getTransactionHistory(accountNumber: Number) {
    this.userAccountTransactionsApiService
      .getAccountTransactions(accountNumber)
      .subscribe({
        next: (resp) => {
          if (resp) {
            this.accountHistory = resp.history;
          }

          this.accountHistory.sort((a, b) => {
            let da = new Date(a.postedDate),
              db = new Date(b.postedDate);

            return db.getTime() - da.getTime();
          });

          this.dataSource = new MatTableDataSource(this.accountHistory);
          this.isLoadingResults = false;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          this.ngAfterViewInit();
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getIndex(_id: String): String {
    const indx = this.accountHistory!.map((x) => x._id).indexOf(_id) + 1;
    return this.stringHelperService.addLeadingZeros(indx, 4);
  }
}
