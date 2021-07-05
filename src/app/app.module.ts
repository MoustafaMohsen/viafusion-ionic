import { StorageService } from './services/storage/storage.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './components/entry/app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { MethodsDashboardComponent } from './components/methods-dashboard/methods-dashboard.component';
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { icons } from './components/svg/index';
import { CreditCardComponent } from './components/views/credit-card/credit-card.component';
import { DestinationItemComponent } from './components/items/destination-item/destination-item.component';
import { CcComponent } from './components/views/cc/cc.component';
import { ListOfCcPage } from './pages/_cc/list-of-cc/list-of-cc.page';
import { AddPccPage } from './pages/_cc/_pcc/add-pcc/add-pcc.page';
import { SchedulePaymentPage } from './pages/_transactions/schedule-payment/schedule-payment.page';
import { TransactionHistoryPage } from './pages/_transactions/transaction-history/transaction-history.page';
import { VerificationPage } from './pages/_verification/verification.page';
import { VerificationFormComponent } from './components/verification/verification-form/verification-form.component';
import { LoginPage } from './pages/_auth/login/login.page';
import { OtpPage } from './pages/_auth/otp/otp.page';
import { NfcPaymentPage } from './pages/_payment/nfc-payment/nfc-payment.page';
import { VccHistoryPage } from './pages/_cc/_vcc/_vcc-details/vcc-history/vcc-history.page';
import { VccSettingsPage } from './pages/_cc/_vcc/_vcc-details/vcc-settings/vcc-settings.page';
import { VccDetailsPage } from './pages/_cc/_vcc/_vcc-details/vcc-details.page';
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
import { CcPaymentPage } from './pages/_payment/cc-payment/cc-payment.page';
import { InstaSendPage } from './pages/insta-send/enter-amount/insta-send.page';
import { HeaderComponent } from './components/header/header.component';
import { EnterPhonePage } from './pages/insta-send/enter-phone/enter-phone.page';
import { ModalComponent } from './components/modal/modal.component';
import { LoginService } from './services/auth/login.service';
import { Api } from './services/api/api';
import { Drivers, Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { DataService } from './services/data/data.service';
import { RX } from './services/rx/events.service';
import { RegisterPinPage } from './pages/_auth/register-pin/register-pin.page';
import { VerifyCardPage } from './pages/_verification/verify-card/verify-card.page';
import { VerifyWalletPage } from './pages/_verification/verify-wallet/verify-wallet.page';
import { CheckoutTestPage } from './pages/checkout-test/checkout-test.page';
import { SelectedSourcesPage } from './pages/_transactions/_sources-sequence/selected-sources/selected-sources.page';
import { AvailabeSourcesPage } from './pages/_transactions/_sources-sequence/availabe-sources/availabe-sources.page';
import { SourcePage } from './pages/_transactions/_sources-sequence/source/source.page';
import { PaymentService } from './services/auth/payment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { WalletService } from './services/wallet/wallet.service';
import { VccService } from './services/vcc/vcc.service';
import { SelectedDestinationsPage } from './pages/_transactions/_destination-sequence/selected-destinations/selected-destinations.page';
import { AvailabeDestinationsPage } from './pages/_transactions/_destination-sequence/availabe-destinations/availabe-destinations.page';
import { PayoutService } from './services/auth/payout';
import { DestinationPage } from './pages/_transactions/_destination-sequence/destination/destination.page';
import { ModalDestinationComponent } from './components/modal-destination/modal.component';
import {MatSelectModule} from '@angular/material/select';
import { LacMatTelInputModule } from 'lac-mat-tel-input';
import { MarketplacePage } from './pages/_marketplace/shop/marketplace.page';
import { NgxCcModule } from "ngx-cc";
import { CategoryComponent } from './components/category/category.component';
import { ProductComponent } from './components/category/product/product.component';
import { SellPage } from './pages/_marketplace/sell/sell.page';
import { ProductDetailsPage } from './pages/_marketplace/product-details/product-details.page';
import { CategoriesModalComponent } from './components/categories-modal/categories-modal.component';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    }),
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
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LacMatTelInputModule,
    NgxCcModule
  ],
  declarations: [
    AppComponent,
    LoginPage,
    OtpPage,
    DashboardPage,
    MethodsDashboardComponent,
    TransactionItemComponent,
    SelectedSourcesPage,
    CreateVccPage,
    CreditCardComponent,
    NfcPaymentPage,
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
    AvailabeSourcesPage,
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
    CcPaymentPage,
    InstaSendPage,
    HeaderComponent,
    EnterPhonePage,
    ModalComponent,
    RegisterPinPage,
    VerifyCardPage,
    VerifyWalletPage,
    CheckoutTestPage,
    SourcePage,
    SelectedDestinationsPage,
    AvailabeDestinationsPage,
    DestinationPage,
    ModalDestinationComponent,
    MarketplacePage,
    CategoryComponent,
    ProductComponent,
    SellPage,
    ProductDetailsPage,
    CategoriesModalComponent
    
  ],
  entryComponents: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Api, LoginService, DataService, RX, StorageService, PaymentService,WalletService,VccService,PayoutService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
