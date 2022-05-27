import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserAccountTransactionHistory } from "../models/user-account-transaction-history";
import { UserAccountTransactions } from '../models/user-account-transactions';

@Injectable({
  providedIn: "root"
})
export class UserAccountTransactionsApiService {
  constructor(private http: HttpClient) {}

  baseUrl: String = "http://localhost:4500/api/accounts/transaction";
  httpOptions = {
    headers: new HttpHeaders({ "content-type": "application/json" })
  };

  postAccountTransaction(
    history: UserAccountTransactions
  ): Observable<UserAccountTransactionHistory[]> {
    return this.http.post<UserAccountTransactionHistory[]>(
      `${this.baseUrl}/post`,
      history,
      this.httpOptions
    );
  }

  getAccountTransactions(
    accountNumber: Number
  ): Observable<UserAccountTransactions> {
    return this.http.get<UserAccountTransactions>(
      `${this.baseUrl}?account_number=${accountNumber}`
    );
  }
}
