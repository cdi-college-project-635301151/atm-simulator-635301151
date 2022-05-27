import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { UserAuth } from "../models/user-auth";
import { UserAuthService } from "../apiService/user-auth.service";
import { Router } from "@angular/router";
import { ApiConfigs } from "../models/api-configs";
import { TokenValidatorService } from "../shared/token-validator.service";
import { Users } from "../models/users";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: [ "./nav-bar.component.css" ],
  encapsulation: ViewEncapsulation.None
})
export class NavBarComponent implements OnInit {
  userAuth?: UserAuth;
  apiConfigs?: ApiConfigs;
  user?: Users;

  constructor(
    private tokenValidatorService: TokenValidatorService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.initContent();
  }

  initContent() {
    const token = this.tokenValidatorService!.getToken();
    console.log(token);
    if (token) {
      this.tokenValidatorService!.validateToken(token).then((resp) => {
        this.userAuth = resp.userAuth;
        this.user = resp;
      });
    }
    else {
      this.route.navigate([ "/login" ]);
    }
  }

  customers() {
    this.route.navigate([ "/clients" ]);
  }

  atm() {
    this.route.navigate([ "/dashboard" ]);
  }

  logout() {
    localStorage.removeItem("token");
    this.route.navigate([ "/login" ]);
  }
}
