import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { UserAuthService } from "../apiService/user-auth.service";
import { UserAuth } from "../models/user-auth";
import { TokenValidatorService } from "../shared/token-validator.service";
import { Users } from "../models/users";
import { Atm } from "../models/atm";
import { AtmApiService } from "../apiService/atm-api.service";

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: [ "./login-form.component.css" ]
})
export class LoginFormComponent implements OnInit {
  hide = true;
  isError = false;
  errorMsg?: String;
  userAuth?: UserAuth;
  user?: Users;
  atm?: Atm;

  /**
   * ADMIN
   * 123456789
   */

  loginForm = new FormGroup({
    userCode: new FormControl(1653446888614, [
      Validators.required,
      Validators.pattern(/^-?(0|[1-9]\d*)?$/)
    ]),
    userPin: new FormControl(123456, [
      Validators.required,
      Validators.pattern(/^-?(0|[1-9]\d*)?$/)
    ])
  });

  constructor(
    private userAuthService: UserAuthService,
    private router: Router,
    private atmApiService: AtmApiService
  ) {}

  ngOnInit(): void {
    this.getATM().then((atm) => {
      this.atm = atm;
    });
  }

  ngOnDestroy() {}

  getATM = (): Promise<Atm> => {
    return new Promise((promise) => {
      this.atmApiService.getAtm().subscribe({
        next: (resp) => {
          promise(resp);
        },
        error: (error) => {
          console.log({
            errorMessage: "An error occured while get atm",
            error: error
          });
        }
      });
    });
  };

  login() {
    this.userAuthService.authUser(this.loginForm.value).subscribe({
      next: (res) => {
        this.user = res;
        this.redirect();
      },
      error: (err) => {
        this.userAuth = err;
        this.errorMsg = this.userAuth!.error.errorMessage;
      },
      complete: () => {}
    });
  }

  redirect() {
    if (this.user) {
      /**
       * Rejects all transaction if login user is not the administrator.
       */
      if (this.atm) {
        if (!this.atm.isOpen && this.user!.userAuth.userType === "001") return;
      }

      window.localStorage.setItem(
        "token",
        this.user.userAuth.apiConfig.apiKey.toString()
      );

      if (this.user.userAuth.pinUpdate && this.user.userAuth.attemps < 3) {
        this.router.navigate([ `/password-update` ]);
        return;
      }
      else if (this.user.userAuth.attemps == 3) {
        this.errorMsg =
          "Your account is blocked. Please contact administrator.";
        this.isError = true;
        return;
      }
      else {
        if (this.user.userAuth.userType === "007") {
          this.router.navigate([ `/clients` ]);
          return;
        }

        this.router.navigate([ "/customer" ]);
      }
    }
  }
}
