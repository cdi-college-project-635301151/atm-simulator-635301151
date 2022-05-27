import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Users } from "../models/users";

@Injectable({
  providedIn: "root"
})
export class UsersApiService {
  constructor(private http: HttpClient) {}

  baseUrl = "http://localhost:4500/api/users";
  httpOptions = {
    headers: new HttpHeaders({
      "content-type": "application/json"
    })
  };

  getUsers(): Observable<Users[]> {
    return this.http.get<Users[]>(`${this.baseUrl}/get_users`);
  }

  getUser(_id: String): Observable<Users> {
    return this.http.get<Users>(`${this.baseUrl}?_id=${_id}`);
  }

  createUser(user: Users): Observable<Users[]> {
    return this.http.post<Users[]>(
      `${this.baseUrl}/create`,
      user,
      this.httpOptions
    );
  }

  patchUserInfo(user: Users): Observable<Users> {
    return this.http.post<Users>(
      `${this.baseUrl}/update/basic_info`,
      user,
      this.httpOptions
    );
  }

  patchUserAccess(user: Users): Observable<Users> {
    return this.http.patch<Users>(
      `${this.baseUrl}/update/user-access`,
      user,
      this.httpOptions
    );
  }
}
