import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UserPayees } from "../models/user-payees";
import { Observable } from "rxjs";
import { UserPayeeCustomers } from '../models/user-payee-customers';

@Injectable({
  providedIn: "root"
})
export class UserPayeesApiService {
  constructor(private http: HttpClient) {}

  baseUrl = "http://localhost:4500/api/payee";
  httpOptions = {
    headers: new HttpHeaders({
      "content-type": "application/json"
    })
  };

  createPayee(userPayees: UserPayees): Observable<UserPayeeCustomers[]> {
    return this.http.post<UserPayeeCustomers[]>(
      `${this.baseUrl}/create`,
      userPayees,
      this.httpOptions
    );
  }

  getPayees(uid: String): Observable<UserPayeeCustomers[]> {
    return this.http.get<UserPayeeCustomers[]>(`${this.baseUrl}/payees?uid=${uid}`);
  }

  patchPPayee(userPayees: UserPayees): Observable<UserPayees[]> {
    return this.http.patch<UserPayees[]>(
      `${this.baseUrl}/patch-payee`,
      userPayees,
      this.httpOptions
    );
  }
}
