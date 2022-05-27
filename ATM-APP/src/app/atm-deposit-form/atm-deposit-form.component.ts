import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Atm } from "../models/atm";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-atm-deposit",
  templateUrl: "./atm-deposit-form.component.html",
  styleUrls: [ "./atm-deposit-form.component.css" ]
})
export class AtmDepositFormComponent implements OnInit {
  atm?: Atm;
  currentDeposit?: string = "0";
  totalDeposit: Number = 0;
  errorMsg?: String;

  deposits = [
    { five: "5000", ten: "10000", fifteen: "15000", twenty: "20000" }
  ];

  formDeposit = new FormGroup({
    _id: new FormControl(""),
    history: new FormGroup({
      value: new FormControl("", Validators.required),
      accountNumber: new FormControl("")
    })
  });

  constructor(
    private dialogRef: MatDialogRef<AtmDepositFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Atm
  ) {}

  ngOnInit(): void {
    this.atm = this.data;
    if (this.data) {
      this.totalDeposit = this.data.balance;
      this.formDeposit.patchValue({
        _id: this.data._id,
        history: {
          acountNumber: 123456789
        }
      });
    }
  }

  addDeposit(value: string) {
    this.currentDeposit = value;
    this.errorMsg = "";
    const balance: number = Number(this.totalDeposit) + Number(value);

    if (balance <= 20000) {
      this.patchForm(value);
    }
    else {
      this.errorMsg = "ATM cannot hold more than $20,000.00 balance.";
      this.patchForm("");
    }
  }

  patchForm(value: String) {
    this.formDeposit.patchValue({
      history: {
        value: value
      }
    });
  }

  submitForm() {
    if (Number(this.currentDeposit) > 0) {
      this.dialogRef.close(this.formDeposit);
    }
  }
}
