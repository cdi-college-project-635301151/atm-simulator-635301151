import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Atm } from "../models/atm";
import { AtmApiService } from "../apiService/atm-api.service";
import { AtmHistory } from "../models/atm-history";
import { MatDialog } from "@angular/material/dialog";
import { AtmDepositFormComponent } from "../atm-deposit-form/atm-deposit-form.component";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { StringHelperService } from "../helpers/string-helper.service";

@Component({
  selector: "app-atm-dashboard",
  templateUrl: "./atm-dashboard.component.html",
  styleUrls: [ "./atm-dashboard.component.css" ]
})
export class AtmDashboardComponent implements OnInit, AfterViewInit {
  atm?: Atm;
  atmTransactions?: AtmHistory[];
  dataSource?: MatTableDataSource<AtmHistory>;

  columnDef = [ "createdAt", "status", "index", "accountNumber", "value" ];

  constructor(
    private atmApiService: AtmApiService,
    private dialogRef: MatDialog,
    private stringHelperService: StringHelperService,
    private fb: FormBuilder
  ) {}

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  ngOnInit(): void {
    this.getAtm();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator!;
      this.dataSource.sort = this.sort!;
    }
  }

  patchAtmStatus(isOpen: Boolean) {
    const atm: FormGroup = this.fb.group({
      _id: [ this.atm!._id ],
      isOpen: [ isOpen ]
    });

    this.atmApiService.patchAtmStatus(atm.value).subscribe({
      next: (resp) => {
        this.atm = resp;
        this.stringHelperService.openSnackBar(
          `The ATM is now ${!isOpen ? "CLOSED" : "OPEN"}.`,
          "x"
        );
      },
      error: (err) => {
        console.log({
          errorMessage: "An error occured while updating ATM status.",
          error: err
        });
      }
    });
  }

  getAtm() {
    this.atmApiService.getAtm().subscribe({
      next: (resp) => {
        if (resp) {
          this.atm = resp;
          this.getAtmTransactions(resp._id);
        }
        else {
          this.createAtm();
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "Error occured while getting ATM information",
          error: err
        });
      }
    });
  }

  createAtm() {
    const form: FormGroup = this.fb.group({
      atmCode: [ "004" ],
      atmName: [ "Red Ribbon ATM" ]
    });

    this.atmApiService.createAtm(form.value).subscribe({
      next: (resp) => {
        if (resp) {
          this.atm = resp;
        }
      },
      error: (err) => {
        console.log({
          errorMessage: "Error occured while creating the ATM",
          error: err
        });
      }
    });
  }

  getAtmTransactions(_id: String) {
    this.atmApiService.getHistory(_id).subscribe((resp) => {
      this.atmTransactions = resp;

      this.atmTransactions.sort((a, b) => {
        const da = new Date(a.createdAt),
          db = new Date(b.createdAt);

        return db.getTime() - da.getTime();
      });

      this.dataSource = new MatTableDataSource(this.atmTransactions);

      this.ngAfterViewInit();
    });
  }

  openAtmDeposit() {
    const dialogRef = this.dialogRef.open(AtmDepositFormComponent, {
      width: "350px",
      data: this.atm,
      panelClass: "custom-dialog-container"
    });

    dialogRef.afterClosed().subscribe((form: FormGroup) => {
      if (form) {
        this.atmApiService.postTransactions(form.value).subscribe({
          next: (resp) => {
            this.atmTransactions = resp;
          },
          error: (err) => {
            console.log({
              errMessage: "Error occured while posting ATM transactions.",
              error: err
            });
          },
          complete: () => {
            this.dataSource = new MatTableDataSource(this.atmTransactions);
            if (this.atmTransactions) {
              const sum = this.atmTransactions!.reduce((acc, obj) => {
                return Number(acc) + Number(obj.value);
              }, 0);

              this.atm!.balance = sum;
            }
          }
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource!.filter = filterValue.trim().toLowerCase();

    if (this.dataSource!.paginator) {
      this.dataSource!.paginator.firstPage();
    }
  }

  getIndex(_id: String): String {
    const indx = this.atmTransactions!.map((x) => x._id).indexOf(_id) + 1;
    return this.stringHelperService.addLeadingZeros(indx, 5);
  }
}
