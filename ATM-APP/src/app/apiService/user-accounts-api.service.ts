import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserAccounts } from "../models/user-accounts";
import { Users } from "../models/users";
import { Accounts } from "../models/accounts";

@Injectable({
  providedIn: "root"
})
export class UserAccountsApiService {
  baseUrl = "http://localhost:4500/api/accounts";
  httpOptions = {
    headers: new HttpHeaders({ "content-type": "application/json" })
  };

  constructor(private http: HttpClient) {}

  getAccounts(id: String): Observable<UserAccounts[]> {
    return this.http.get<UserAccounts[]>(`${this.baseUrl}?userId=${id}`);
  }

  createAccount(user: Users): Observable<UserAccounts[]> {
    return this.http.post<UserAccounts[]>(
      `${this.baseUrl}/create`,
      user,
      this.httpOptions
    );
  }

  patcheBalance(account: Accounts): Observable<UserAccounts[]> {
    return this.http.patch<UserAccounts[]>(
      `${this.baseUrl}/patch-balance`,
      account,
      this.httpOptions
    );
  }
}
