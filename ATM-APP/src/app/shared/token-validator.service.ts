import { Injectable } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserAuthService } from "../apiService/user-auth.service";
import { UserAuth } from "../models/user-auth";
import { ApiConfigs } from "../models/api-configs";
import * as moment from "moment";
import { Users } from "../models/users";

@Injectable({
  providedIn: "root"
})
export class TokenValidatorService {
  constructor(
    private router: Router,
    private userAuthService: UserAuthService,
    private route: ActivatedRoute
  ) {}

  private userAuth?: UserAuth;
  private user?: Users;

  getToken(): String {
    return localStorage.getItem("token")!;
  }

  async validateToken(token: String): Promise<Users> {
    return new Promise((res) => {
      if (token) {
        this.userAuthService.validateToken(token).subscribe({
          next: (resp) => {
            if (resp) {
              this.user = resp;
              this.userAuth = resp.userAuth;
            }
            res(resp);
          },
          error: (err) => {
            // this.user = [];
            // this.userAuth = [];
            localStorage.removeItem("token");
            this.router.navigate([ "/login" ]);
          },
          complete: () => {
            this.isTokenExpired(this.userAuth!.apiConfig);
          }
        });
      }
    });
  }

  isTokenExpired(data: ApiConfigs) {
    const dt = moment.utc();
    const expiredAt = moment.utc(data.expiredAt);
    console.log(`EpiredAt: ${expiredAt} : Today: ${dt}`);

    if (moment.utc(dt).isAfter(expiredAt)) {
      this.user = undefined;
      this.userAuth = undefined;

      console.log(`Token is Expired`);
      localStorage.removeItem("token");
      this.router.navigate([ "/login" ]);
    }
  }

  get getUserAuth() {
    return this.userAuth;
  }

  setUserAuth = async (userAuth: UserAuth) => {
    return new Promise((resp) => {
      this.userAuth = userAuth;
      resp(this.userAuth);
    });
  };

  get getUser() {
    return this.user;
  }
}
