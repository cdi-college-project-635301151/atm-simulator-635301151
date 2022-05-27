import { Component, OnInit, Inject } from "@angular/core";
import { UserPayeesApiService } from "../apiService/user-payees-api.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Users } from "../models/users";
import { UserPayeeCustomers } from "../models/user-payee-customers";

interface AddPayeeInterface {
  user: Users;
  payeeCustomers: UserPayeeCustomers[];
}

@Component({
  selector: "app-customer-pay-bills-add-payee",
  templateUrl: "./customer-pay-bills-add-payee.component.html",
  styleUrls: [ "./customer-pay-bills-add-payee.component.css" ]
})
export class CustomerPayBillsAddPayeeComponent implements OnInit {
  constructor(
    private userPayeesApiService: UserPayeesApiService,
    private dialogRef: MatDialogRef<CustomerPayBillsAddPayeeComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: AddPayeeInterface
  ) {}

  addPayeeForm?: FormGroup;

  countLenAccountNumber: number = 0;
  isPayeeExisting: Boolean = false;
  addPayeeFormErrorMessage: String = "";

  ngOnInit(): void {
    this.initPayeeForm();
  }

  initPayeeForm = () => {
    const accountNumber = Date.now();
    this.countLenAccountNumber = accountNumber.toString().length;

    this.addPayeeForm = this.fb.group({
      uid: [ this.data.user._id ],
      customers: this.fb.group({
        customerName: [
          null,
          [ Validators.required, Validators.minLength(3) ]
        ],
        accountNumber: [
          accountNumber,
          [ Validators.required, Validators.minLength(6) ]
        ]
      })
    });

    this.customerAccountNumber.valueChanges.subscribe({
      next: (value) => {
        this.countLenAccountNumber = value.length;

        this.isPayeeExisting = false;
        this.addPayeeFormErrorMessage = "";

        const customerNumber = this.validateAccountNumber(Number(value));
        if (customerNumber > 0) {
          this.isPayeeExisting = true;
          this.addPayeeFormErrorMessage =
            "Account number already exists in your payee lists";
        }
      }
    });
  };

  get customerName() {
    return this.addPayeeForm!.get("customers.customerName")!;
  }

  get customerAccountNumber() {
    return this.addPayeeForm!.get("customers.accountNumber")!;
  }

  countLength(value: string): number {
    const len = value ? value.length : 0;
    return len;
  }

  submitPayee = () => {
    if (this.isPayeeExisting) {
      return;
    }

    this.userPayeesApiService.createPayee(this.addPayeeForm!.value).subscribe({
      next: (resp) => {
        this.dialogRef.close(resp);
      },
      error: (err) => {
        console.log({
          errorMessage: "Error while adding a payee.",
          error: err
        });
      }
    });
  };

  validateAccountNumber = (accountNumber: Number): Number => {
    const userPayeeCustomer = this.data.payeeCustomers.filter(
      (x) => x.accountNumber === accountNumber
    );

    return userPayeeCustomer.length > 0
      ? userPayeeCustomer[0].accountNumber
      : 0;
  };
}
