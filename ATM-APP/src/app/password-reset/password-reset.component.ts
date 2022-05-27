import { Component, OnInit } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { TokenValidatorService } from "../shared/token-validator.service";
import { Users } from "../models/users";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl
} from "@angular/forms";
import { Router } from "@angular/router";
import { UserAuthService } from "../apiService/user-auth.service";

@Component({
  selector: "app-password-reset",
  templateUrl: "./password-reset.component.html",
  styleUrls: [ "./password-reset.component.css" ]
})
export class PasswordResetComponent implements OnInit {
  hide = true;
  submitted = false;
  user?: Users;

  changePinForm?: FormGroup;

  constructor(
    private tokenValidatorService: TokenValidatorService,
    private router: Router,
    private userAuthService: UserAuthService
  ) {}

  ngOnInit(): void {
    const token = this.tokenValidatorService.getToken();
    this.tokenValidatorService.validateToken(token!).then(() => {
      this.user = this.tokenValidatorService.getUser;

      if (!this.user) {
        this.router.navigate([ `/login` ]);
      }
    });

    this.changePinForm = new FormGroup(
      {
        userAuth: new FormGroup({
          _id: new FormControl(""),
          userPin: new FormControl("", [
            Validators.required,
            Validators.pattern(/^-?(0|[0-9]\d*)?$/),
            Validators.minLength(6)
          ]),
          confirmPin: new FormControl("", [
            Validators.required,
            Validators.pattern(/^-?(0|[0-9]\d*)?$/),
            Validators.minLength(6)
          ])
        })
      },
      {
        validators: this.ConfirmPin()
      }
    );
  }

  // CUSTOM VALIDATION
  ConfirmPin(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const userPin = formGroup.get("userAuth.userPin");
      const confirmPin = formGroup.get("userAuth.confirmPin");
      if (userPin!.value === confirmPin!.value) {
        return null;
      }
      else {
        return { valuesNotMatch: true };
      }
    };
  }

  get userPin() {
    return this.changePinForm!.get("userAuth.userPin")!;
  }

  get confirmPin() {
    return this.changePinForm!.get("userAuth.confirmPin")!;
  }

  submit() {
    if (this.changePinForm!.valid) {
      this.changePinForm!.patchValue({
        userAuth: {
          _id: this.user!.userAuth._id
        }
      });

      console.log(this.changePinForm!.value);

      this.userAuthService
        .patchUserPin(this.changePinForm!.value)
        .subscribe((resp) => {
          this.tokenValidatorService.setUserAuth(resp.userAuth).then(() => {
            if (this.user!.userAuth.userType === "007") {
              this.router.navigate([ `/clients` ]);
              return;
            }

            this.router.navigate([ "/customer" ]);
          });
        });
    }
  }

  logout() {
    localStorage.removeItem("token");
    this.router.navigate([ "/login" ]);
  }
}
