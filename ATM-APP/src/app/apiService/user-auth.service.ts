import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserAuth } from "../models/user-auth";
import { Users } from '../models/users';
import { ApiConfigs } from "../models/api-configs";

@Injectable({
  providedIn: "root"
})
export class UserAuthService {
  constructor(private http: HttpClient) {}

  baseUrl: String = "http://localhost:4500/api/auth";
  httpOptions = {
    headers: new HttpHeaders({ "content-type": "application/json" })
  };

  authUser(userAuth: UserAuth): Observable<Users> {
    return this.http.post<Users>(
      `${this.baseUrl}/login`,
      userAuth,
      this.httpOptions
    );
  }

  validateToken(token: String): Observable<Users> {
    return this.http.get<Users>(`${this.baseUrl}?token=${token}`);
  }

  patchUserPin(user: Users): Observable<Users> {
    return this.http.patch<Users>(
      `${this.baseUrl}/pin_update`,
      user,
      this.httpOptions
    );
  }
}
