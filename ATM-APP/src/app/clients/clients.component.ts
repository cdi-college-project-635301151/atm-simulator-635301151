import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { UsersApiService } from "../apiService/users-api.service";
import { Users } from "../models/users";
import { ClientFormComponent } from "../client-form/client-form.component";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";
import { StringHelperService } from "../helpers/string-helper.service";

@Component({
  selector: "app-clients",
  templateUrl: "./clients.component.html",
  styleUrls: [ "./clients.component.css" ]
})
export class ClientsComponent implements OnInit, AfterViewInit {
  constructor(
    private usersApiService: UsersApiService,
    private dialogRef: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private stringHelperService: StringHelperService
  ) {}

  users: Users[] = [];
  usersDataSource = new MatTableDataSource(this.users);
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  columnHeaders: String[] = [
    "index",
    "fullName",
    "address",
    "email",
    "phoneNumber",
    "isEnabled",
    "actions"
  ];

  ngOnInit(): void {
    this.usersDataSource = new MatTableDataSource(this.users);
    this.getUsers();
  }

  ngAfterViewInit(): void {
    if (this.usersDataSource) {
    }

    this.usersDataSource.paginator = this.paginator!;
    this.usersDataSource.sort = this.sort!;
  }

  getUsers() {
    this.usersApiService.getUsers().subscribe({
      next: (resp) => {
        this.users = resp;
        this.usersDataSource = new MatTableDataSource(this.users);
        this.ngAfterViewInit();
      },
      error: (err) => {
        console.log(err);
        this.usersDataSource = new MatTableDataSource(this.users);
        this.ngAfterViewInit();
      },
      complete: () => {}
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersDataSource!.filter = filterValue.trim().toLowerCase();
  }

  updateDb = (user: Users) => {
    console.log(user);
    const users = this.users.map((x) => (x._id !== user._id ? x : user));
    this.users = [ ...users ];
    this.usersDataSource = new MatTableDataSource(this.users);
  };

  updateUserAccess(isBlocked: Boolean, _id: String) {
    const form: FormGroup = this.fb.group({
      _id: _id,
      isBlocked: isBlocked
    });

    this.usersApiService.patchUserAccess(form.value).subscribe({
      next: (resp) => {
        this.updateDb(resp);
        this.stringHelperService.openSnackBar(
          `User access have been successfully updated.`,
          "x"
        );
      },
      error: (err) => {
        console.log({
          errorMessage: "Error occured while updating user access.",
          error: err
        });
      }
    });
  }

  openClientForm() {
    const dialogRef = this.dialogRef.open(ClientFormComponent, {
      width: "500px",
      panelClass: "custom-dialog-container",
      data: {
        uid: "",
        title: "Client Registration Form"
      }
    });

    dialogRef.afterClosed().subscribe((resp: Users) => {
      if (resp) {
        this.usersApiService.createUser(resp).subscribe({
          next: (resp) => {
            console.log(resp);
            this.ngOnInit();
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }

  updateUserInfo(_id: String) {
    const dialogRef = this.dialogRef.open(ClientFormComponent, {
      width: "500px",
      panelClass: "custom-dialog-container",
      data: {
        uid: _id,
        title: "Client Update Form"
      }
    });

    dialogRef.afterClosed().subscribe((resp: Users) => {
      if (resp) {
        this.usersApiService.patchUserInfo(resp).subscribe((res) => {
          this.stringHelperService.openSnackBar(
            `User information have been successfully updated.`,
            "x"
          );
          this.updateDb(resp);
        });
      }
    });
  }

  getIndex(_id: String): Number {
    return this.users!.map((x) => x._id).indexOf(_id) + 1;
  }

  viewClientsAccount(_id: String) {
    this.router.navigate([ `/clients/account` ], { queryParams: { uid: _id } });
  }
}
