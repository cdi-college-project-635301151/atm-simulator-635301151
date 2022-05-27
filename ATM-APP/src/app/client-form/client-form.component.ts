import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Users } from "../models/users";
import { UsersApiService } from "../apiService/users-api.service";
import { TokenValidatorService } from "../shared/token-validator.service";

interface ClientsFormInterface {
  uid: String,
  title: String
}

@Component({
  selector: "app-client-form",
  templateUrl: "./client-form.component.html",
  styleUrls: [ "./client-form.component.css" ]
})
export class ClientFormComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientsFormInterface ,
    private userApiService: UsersApiService,
    private tokenValidatorService: TokenValidatorService
  ) {}

  userForm = new FormGroup({
    _id: new FormControl(""),
    userAuth: new FormGroup({
      userCode: new FormControl(Date.now()),
      userPin: new FormControl(123456)
    }),
    firstName: new FormControl("", [ Validators.required ]),
    lastName: new FormControl("", [ Validators.required ]),
    phoneNumber: new FormControl("", [ Validators.required ]),
    email: new FormControl("", [ Validators.required, Validators.email ]),
    address: new FormGroup({
      streetAddress: new FormControl("", [ Validators.required ]),
      addressDesc: new FormControl(""),
      city: new FormControl("", [ Validators.required ]),
      province: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2)
      ]),
      postal: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ])
    })
  });

  submit() {
    this.dialogRef.close(this.userForm.value);
  }

  ngOnInit(): void {
    const token = this.tokenValidatorService.getToken();
    this.tokenValidatorService.validateToken(token).then(() => {
      this.getUserInfor();
    });
  }

  getUserInfor() {
    if (this.data) {
      this.userApiService.getUser(this.data.uid).subscribe({
        next: (resp) => {
          this.userForm.patchValue({
            _id: resp._id,
            firstName: resp.firstName,
            lastName: resp.lastName,
            phoneNumber: resp.phoneNumber,
            email: resp.email,
            address: {
              streetAddress: resp.address.streetAddress,
              addressDesc: resp.address.addressDesc,
              city: resp.address.city,
              province: resp.address.province,
              postal: resp.address.postal
            }
          });
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }
}
