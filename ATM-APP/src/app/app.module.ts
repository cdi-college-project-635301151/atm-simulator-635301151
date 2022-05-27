import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material/material.module";

import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginFormComponent } from "./login-form/login-form.component";
import { ClientsComponent } from "./clients/clients.component";
import { ClientFormComponent } from "./client-form/client-form.component";
import { ClientsAccountComponent } from "./clients-account/clients-account.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { AtmDashboardComponent } from "./atm-dashboard/atm-dashboard.component";
import { AtmDepositFormComponent } from "./atm-deposit-form/atm-deposit-form.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { ClientsAccountCreateFormComponent } from "./clients-account-create-form/clients-account-create-form.component";
import { ClientsAccountMenuButtonComponent } from "./clients-account-menu-button/clients-account-menu-button.component";
import { ClientsAccountHistoryComponent } from './clients-account-history/clients-account-history.component';
import { ClientsAccountPayInterestComponent } from './clients-account-pay-interest/clients-account-pay-interest.component';
import { ClientsLoanPaymentComponent } from './clients-loan-payment/clients-loan-payment.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { CustomerDashboardButtonComponent } from './customer-dashboard-button/customer-dashboard-button.component';
import { CustomerDepositFormComponent } from './customer-deposit-form/customer-deposit-form.component';
import { CustomerWithdrawalFormComponent } from './customer-withdrawal-form/customer-withdrawal-form.component';
import { CustomerBalanceTransferFormComponent } from './customer-balance-transfer-form/customer-balance-transfer-form.component';
import { CustomerPayBillsFormComponent } from './customer-pay-bills-form/customer-pay-bills-form.component';
import { CustomerPayBillsAddPayeeComponent } from './customer-pay-bills-add-payee/customer-pay-bills-add-payee.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    ClientsComponent,
    ClientFormComponent,
    ClientsAccountComponent,
    NavBarComponent,
    AtmDashboardComponent,
    AtmDepositFormComponent,
    PasswordResetComponent,
    ClientsAccountMenuButtonComponent,
    ClientsAccountCreateFormComponent,
    ClientsAccountHistoryComponent,
    ClientsAccountPayInterestComponent,
    ClientsLoanPaymentComponent,
    CustomerDashboardComponent,
    CustomerDashboardButtonComponent,
    CustomerDepositFormComponent,
    CustomerWithdrawalFormComponent,
    CustomerBalanceTransferFormComponent,
    CustomerPayBillsFormComponent,
    CustomerPayBillsAddPayeeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
