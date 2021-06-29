import { VccDetailsPage } from '../pages/_cc/_vcc/vcc-details/vcc-details.page';
import { ListOfCcPage } from '../pages/_cc/list-of-cc/list-of-cc.page';
import { NfcPaymentPage } from '../pages/_payment/nfc-payment/nfc-payment.page';
import { SourcesPage } from '../pages/_transactions/_sources/list-sources/sources.page';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardPage } from '../pages/dashboard/dashboard.page';
import { AddPccPage } from '../pages/_cc/_pcc/add-pcc/add-pcc.page';
import { SchedulePaymentPage } from '../pages/_transactions/schedule-payment/schedule-payment.page';
import { TransactionHistoryPage } from '../pages/_transactions/transaction-history/transaction-history.page';
import { VerificationPage } from '../pages/verification/verification.page';
import { AddDestinationPage } from '../pages/_transactions/_destinations/add-destination/add-destination.page';
import { LoginPage } from '../pages/_auth/login/login.page';
import { OtpPage } from '../pages/_auth/otp/otp.page';
import { DestinationPage } from '../pages/_transactions/_destinations/list-destinations/destination.page';
import { VccSettingsPage } from '../pages/_cc/_vcc/vcc-settings/vcc-settings.page';
import { VccHistoryPage } from '../pages/_cc/_vcc/vcc-history/vcc-history.page';
import { AddSourcePage } from '../pages/_transactions/_sources/add-source/add-source.page';
import { CreateVccPage } from '../pages/_cc/_vcc/create-vcc/create-vcc.page';

const routes: Routes = [
  //
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // _auth
  {
    path: 'auth',
    redirectTo: 'login',
    pathMatch: 'full',
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'otp',
        component: OtpPage,
      },
    ],
  },

  // _cc
  {
    path: 'cc',
    redirectTo: 'list-of-cc',
    pathMatch: 'full',
    children: [
      {
        path: 'pcc',
        redirectTo: 'pcc-details',
        children: [
          {
            path: 'add-pcc',
            component: AddPccPage,
          },
        ],
      },
      {
        path: 'vcc',
        redirectTo: 'vcc-details',
        children: [
          {
            path: 'create-vcc',
            component: CreateVccPage,
          },
          {
            path: 'vcc-details',
            component: VccDetailsPage,
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
      {
        path: 'list-of-cc',
        component: ListOfCcPage,
      },
    ],
  },

  //_payment
  {
    path: 'payment',
    redirectTo: 'nfc-payment',
    pathMatch: 'full',
    children: [
      {
        path: 'nfc-payment',
        component: NfcPaymentPage,
      },
    ],
  },

  //_transaction
  {
    path: 'transaction',
    redirectTo: 'transaction-history',
    pathMatch: 'full',
    children: [
      {
        path: 'destinations',
        redirectTo: 'list-destinations',
        children: [
          {
            path: 'add-destination',
            component: AddDestinationPage,
          },
          {
            path: 'list-destinations',
            component: DestinationPage,
          },
        ],
      },
      {
        path: 'sources',
        redirectTo: 'list-sources',
        children: [
          {
            path: 'add-source',
            component: AddSourcePage,
          },
          {
            path: 'list-sources',
            component: SourcesPage,
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
    component: VerificationPage,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
