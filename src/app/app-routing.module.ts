import { CheckoutTestPage } from './pages/checkout-test/checkout-test.page';
import { VccDetailsPage } from './pages/_cc/_vcc/_vcc-details/vcc-details.page';
import { ListOfCcPage } from './pages/_cc/list-of-cc/list-of-cc.page';
import { NfcPaymentPage } from './pages/_payment/nfc-payment/nfc-payment.page';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { AddPccPage } from './pages/_cc/_pcc/add-pcc/add-pcc.page';
import { SchedulePaymentPage } from './pages/_transactions/schedule-payment/schedule-payment.page';
import { TransactionHistoryPage } from './pages/_transactions/transaction-history/transaction-history.page';
import { VerificationPage } from './pages/_verification/verification.page';
import { LoginPage } from './pages/_auth/login/login.page';
import { OtpPage } from './pages/_auth/otp/otp.page';
import { VccSettingsPage } from './pages/_cc/_vcc/_vcc-details/vcc-settings/vcc-settings.page';
import { VccHistoryPage } from './pages/_cc/_vcc/_vcc-details/vcc-history/vcc-history.page';
import { CreateVccPage } from './pages/_cc/_vcc/create-vcc/create-vcc.page';
import { PccDetailsPage } from './pages/_cc/_pcc/_pcc-details/pcc-details.page';
import { PccHistoryPage } from './pages/_cc/_pcc/_pcc-details/pcc-history/pcc-history.page';
import { PccSettingsPage } from './pages/_cc/_pcc/_pcc-details/pcc-settings/pcc-settings.page';
import { InternalTransactionPage } from './pages/_transactions/internal-transaction/internal-transaction.page';
import { FingerprintPage } from './pages/_auth/fingerprint/fingerprint.page';
import { LoginWithPinPage } from './pages/_auth/login-with-pin/login-with-pin.page';
import { ConfirmPinPage } from './pages/_auth/confirm-pin/confirm-pin.page';
import { QrPaymentPage } from './pages/_payment/qr-payment/qr-payment.page';
import { RequestPaymentPage } from './pages/_transactions/request-payment/request-payment.page';
import { CcPaymentPage } from './pages/_payment/cc-payment/cc-payment.page';
import { InstaSendPage } from './pages/insta-send/enter-amount/insta-send.page';
import { EnterPhonePage } from './pages/insta-send/enter-phone/enter-phone.page';
import { RegisterPinPage } from './pages/_auth/register-pin/register-pin.page';
import { VerifyWalletPage } from './pages/_verification/verify-wallet/verify-wallet.page';
import { VerifyCardPage } from './pages/_verification/verify-card/verify-card.page';
import { SelectedSourcesPage } from './pages/_transactions/_sources-sequence/selected-sources/selected-sources.page';
import { AvailabeSourcesPage } from './pages/_transactions/_sources-sequence/availabe-sources/availabe-sources.page';
import { SourcePage } from './pages/_transactions/_sources-sequence/source/source.page';
import { AvailabeDestinationsPage } from './pages/_transactions/_destination-sequence/availabe-destinations/availabe-destinations.page';
import { SelectedDestinationsPage } from './pages/_transactions/_destination-sequence/selected-destinations/selected-destinations.page';
import { DestinationPage } from './pages/_transactions/_destination-sequence/destination/destination.page';
import { MarketplacePage } from './pages/_marketplace/shop/marketplace.page';
import { SellPage } from './pages/_marketplace/sell/sell.page';
import { ProductDetailsPage } from './pages/_marketplace/product-details/product-details.page';
import { CompleteTransactionPage } from './pages/actions/complete-transaction/complete-transaction.page';
import { SettingsPage } from './pages/actions/settings/settings.page';
import { WalletTransactionHistoryPage } from './pages/_transactions/wallet-transaction-history/wallet-transaction-history.page';
import { GenerateCheckoutPage } from './pages/_payment/generate-checkout/generate-checkout.page';
import { IbanDetailsPage } from './pages/_cc/iban/iban-details/iban-details.page';
import { IbanHistoryPage } from './pages/_cc/iban/iban-details/iban-history/iban-history.page';
import { IbanSettingsPage } from './pages/_cc/iban/iban-details/iban-settings/iban-settings.page';


const routes: Routes = [
  //
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // _auth
  {
    path: 'auth',
    // redirectTo: 'login',
    // pathMatch: 'full',
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'otp',
        component: OtpPage,
      },
      {
        path: 'fingerprint',
        component: FingerprintPage,
      },
      {
        path: 'login-with-pin',
        component: LoginWithPinPage,
      },
      {
        path: 'confirm-pin',
        component: ConfirmPinPage,
      },
      {
        path: 'register-pin',
        component: RegisterPinPage
      },
    ],
  },

  // _cc
  {
    path: 'cc',
    // redirectTo: 'list-of-cc',
    // pathMatch: 'full',
    children: [
      {
        path: 'pcc',
        // redirectTo: 'pcc-details',
        children: [
          {
            path: 'add-pcc',
            component: AddPccPage,
          },
          {
            path: 'pcc-details',
            component: PccDetailsPage,
            children: [
              {
                path: 'pcc-history',
                component: PccHistoryPage,
              },
              {
                path: 'pcc-settings',
                component: PccSettingsPage,
              },
            ],
          },
        ],
      },
      {
        path: 'vcc',
        // redirectTo: 'vcc-details',
        children: [
          {
            path: 'create-vcc',
            component: CreateVccPage,
          },
          {
            path: 'vcc-details',
            component: VccDetailsPage,
            children: [
              {
                path: '',
                redirectTo: 'vcc-history',
                pathMatch: 'full'
              },
              {
                path: 'vcc-history',
                component: VccHistoryPage,
              },
              {
                path: 'vcc-settings',
                component: VccSettingsPage,
              },
            ],
          },
        ],
      },
      {
        path: 'list-of-cc',
        component: ListOfCcPage,
      },
      {
        path: 'iban',
        children: [
          {
            path: 'iban-details',
            component: IbanDetailsPage,
            children: [
              {
                path: 'iban-history',
                component: IbanHistoryPage
              },
              {
                path: 'iban-settings',
                component: IbanSettingsPage
              },
            ]
          },


        ]

      },
    ],
  },

  //_payment
  {
    path: 'payment',
    // redirectTo: 'nfc-payment',
    // pathMatch: 'full',
    children: [
      {
        path: 'nfc-payment',
        component: NfcPaymentPage,
      },
      {
        path: 'qr-payment',
        component: QrPaymentPage,
      },
      {
        path: 'generate-qr-code',
        component: GenerateCheckoutPage,
      },
      {
        path: 'cc-payment',
        component: CcPaymentPage
      },
    ],
  },

  //_transaction
  {
    path: 'transaction',
    // redirectTo: 'transaction-history',
    // pathMatch: 'full',
    children: [
      {
        path: 'destinations-sequence',
        // redirectTo: 'list-destinations',
        children: [
          {
            path: 'selected-destinations',
            component: SelectedDestinationsPage,
          },
          {
            path: 'available-destinations',
            component: AvailabeDestinationsPage,
          },
          {
            path: 'destination',
            component: DestinationPage,
          },
        ],
      },
      {
        path: 'sources-sequence',
        // redirectTo: 'list-sources',
        children: [
          {
            path: 'selected-sources',
            component: SelectedSourcesPage,
          },
          {
            path: 'available-sources',
            component: AvailabeSourcesPage,
          },
          {
            path: 'source',
            component: SourcePage,
          },
        ],
      },
      {
        path: 'schedule-payment',
        component: SchedulePaymentPage,
      },
      {
        path: 'transaction-history',
        component: TransactionHistoryPage,
      },
      {
        path: 'wallet-transaction-history',
        component: WalletTransactionHistoryPage,
      },
      {
        path: 'internal-transaction',
        component: InternalTransactionPage,
      },
      {
        path: 'request-payment',
        component: RequestPaymentPage,
      },
    ],
  },
  //_dashboard
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  //_verification
  {
    path: 'verification',
    // component: VerificationPage,
    children: [
      {
        path: 'verify-wallet',
        component: VerifyWalletPage
      },
      {
        path: 'verify-card',
        component: VerifyCardPage
      },
    ]
  },

  // insta sending
  {
    path: 'insta-send',

    children: [
      {
        path: 'enter-amount',
        component: InstaSendPage,
      },
      {
        path: 'enter-phone',
        component: EnterPhonePage
      },
    ]
  },
  {
    path: 'checkout-test',
    component: CheckoutTestPage
  },
  {
    path: 'marketplace',
    children: [
      {
        path: 'shop',
        component: MarketplacePage
      },
      {
        path: 'sell',
        component: SellPage
      },
      {
        path: 'product-details',
        component: ProductDetailsPage
      },

    ]
  },
  {
    path: 'action',
    children: [
      {
        path: 'complete-transaction',
        component: CompleteTransactionPage
      },
      {
        path: 'settings',
        component: SettingsPage
      }
    ]
  },







];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
