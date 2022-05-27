import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Atm } from "../models/atm";
import { AtmHistory } from "../models/atm-history";

@Injectable({
  providedIn: "root"
})
export class AtmApiService {
  constructor(private http: HttpClient) {}

  baseUrl: String = "http://localhost:4500/api/atm";
  httpOptions = {
    headers: new HttpHeaders({ "content-type": "application/json" })
  };

  getAtm(): Observable<Atm> {
    return this.http.get<Atm>(`${this.baseUrl}`);
  }

  getHistory(_id: String): Observable<AtmHistory[]> {
    return this.http.get<AtmHistory[]>(
      `${this.baseUrl}/transactions?_id=${_id}`
    );
  }

  postTransactions(atm: Atm): Observable<AtmHistory[]> {
    return this.http.post<AtmHistory[]>(
      `${this.baseUrl}/transactions/post`,
      atm,
      this.httpOptions
    );
  }

  patchAtmStatus(atm: Atm): Observable<Atm> {
    return this.http.patch<Atm>(
      `${this.baseUrl}/patch-status`,
      atm,
      this.httpOptions
    );
  }

  createAtm(atm: Atm): Observable<Atm> {
    return this.http.post<Atm>(`${this.baseUrl}/create`, atm, this.httpOptions);
  }
}
