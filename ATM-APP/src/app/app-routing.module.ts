import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginFormComponent } from "./login-form/login-form.component";
import { ClientsComponent } from "./clients/clients.component";
import { AtmDashboardComponent } from "./atm-dashboard/atm-dashboard.component";
import { ClientsAccountComponent } from "./clients-account/clients-account.component";
import { Users } from "./models/users";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { CustomerDashboardComponent } from "./customer-dashboard/customer-dashboard.component";

const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginFormComponent },
  { path: "clients", component: ClientsComponent },
  { path: "clients/account", component: ClientsAccountComponent },
  { path: "password-update", component: PasswordResetComponent },
  { path: "dashboard", component: AtmDashboardComponent },
  { path: "customer", component: CustomerDashboardComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
