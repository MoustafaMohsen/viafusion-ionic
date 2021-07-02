
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './components/entry/app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './services/api.service';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { MethodsDashboardComponent } from './components/methods-dashboard/methods-dashboard.component';
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import  {icons} from './components/svg/index';
import { SourcesPage } from './pages/_transactions/_sources/list-sources/sources.page';
import { SourceItemComponent } from './components/items/source-item/source-item.component';
import { CreditCardComponent } from './components/views/credit-card/credit-card.component';
import { DestinationItemComponent } from './components/items/destination-item/destination-item.component';
import { CcComponent } from './components/views/cc/cc.component';
import { ListOfCcPage } from './pages/_cc/list-of-cc/list-of-cc.page';
import { AddPccPage } from './pages/_cc/_pcc/add-pcc/add-pcc.page';
import { SchedulePaymentPage } from './pages/_transactions/schedule-payment/schedule-payment.page';
import { TransactionHistoryPage } from './pages/_transactions/transaction-history/transaction-history.page';
import { VerificationPage } from './pages/verification/verification.page';
import { VerificationFormComponent } from './components/verification/verification-form/verification-form.component';
import { LoginPage } from './pages/_auth/login/login.page';
import { OtpPage } from './pages/_auth/otp/otp.page';
import { NfcPaymentPage } from './pages/_payment/nfc-payment/nfc-payment.page';
import { DestinationPage } from './pages/_transactions/_destinations/list-destinations/destination.page';
import { VccHistoryPage } from './pages/_cc/_vcc/_vcc-details/vcc-history/vcc-history.page';
import { VccSettingsPage } from './pages/_cc/_vcc/_vcc-details/vcc-settings/vcc-settings.page';
import { VccDetailsPage } from './pages/_cc/_vcc/_vcc-details/vcc-details.page';
import { AddSourcePage } from './pages/_transactions/_sources/add-source/add-source.page';
import { CreateVccPage } from './pages/_cc/_vcc/create-vcc/create-vcc.page';
import { PccDetailsPage } from './pages/_cc/_pcc/_pcc-details/pcc-details.page';
import { PccHistoryPage } from './pages/_cc/_pcc/_pcc-details/pcc-history/pcc-history.page';
import { PccSettingsPage } from './pages/_cc/_pcc/_pcc-details/pcc-settings/pcc-settings.page';
import { TransactionOverviewPage } from './pages/_transactions/transaction-overview/transaction-overview.page';
import { InternalTransactionPage } from './pages/_transactions/internal-transaction/internal-transaction.page';
import { ConfirmPinPage } from './pages/_auth/confirm-pin/confirm-pin.page';
import { FingerprintPage } from './pages/_auth/fingerprint/fingerprint.page';
import { LoginWithPinPage } from './pages/_auth/login-with-pin/login-with-pin.page';
import { QrPaymentPage } from './pages/_payment/qr-payment/qr-payment.page';
import { RequestPaymentPage } from './pages/_transactions/request-payment/request-payment.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { PinDialpadComponent } from './components/pin-dialpad/pin-dialpad.component';
import { CcPaymentPage } from './pages/_payment/cc-payment/cc-payment.page';
import { InstaSendPage } from './pages/insta-send/insta-send.page';
import { HeaderComponent } from './components/header/header.component';
import { EnterPhonePage } from './pages/insta-send/enter-phone/enter-phone.page';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    SvgIconsModule.forRoot({
      sizes: {
        xs: '10px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '25px',
        xxl: '30px'
      },
      defaultSize: 'md',
      icons
    }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animation: false,
      responsive: true,
      renderOnClick: false
    }),

  ],
  declarations: [
    AppComponent,
    LoginPage,
    OtpPage,
    DashboardPage,
    MethodsDashboardComponent,
    TransactionItemComponent,
    SourcesPage,
    SourceItemComponent,
    CreateVccPage,
    CreditCardComponent,
    NfcPaymentPage,
    DestinationPage,
    DestinationItemComponent,
    CcComponent,
    ListOfCcPage,
    VccHistoryPage,
    VccSettingsPage,
    VccDetailsPage,
    AddPccPage,
    SchedulePaymentPage,
    TransactionHistoryPage,
    VerificationPage,
    VerificationFormComponent,
    AddSourcePage,
    PccDetailsPage,
    PccHistoryPage,
    PccSettingsPage,
    TransactionOverviewPage,
    InternalTransactionPage,
    ConfirmPinPage,
    FingerprintPage,
    LoginWithPinPage,
    QrPaymentPage,
    RequestPaymentPage,
    PinDialpadComponent,
    CcPaymentPage,
    InstaSendPage,
    HeaderComponent,
    EnterPhonePage,
  ],
  entryComponents: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ApiService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
