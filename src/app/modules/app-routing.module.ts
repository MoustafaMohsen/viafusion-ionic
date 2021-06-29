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
import { AddDestinationPage } from '../pages/_transactions/_destination/add-destination/add-destination.page';
import { LoginPage } from '../pages/_auth/login/login.page';
import { OtpPage } from '../pages/_auth/otp/otp.page';
import { DestinationPage } from '../pages/_transactions/_destination/list-destination/destination.page';
import { VccSettingsPage } from '../pages/_cc/_vcc/vcc-settings/vcc-settings.page';
import { VccHistoryPage } from '../pages/_cc/_vcc/vcc-history/vcc-history.page';
import { AddSourcePage } from '../pages/_transactions/_sources/add-source/add-source.page';
import { CreateVcc } from '../pages/_cc/_vcc/create-vcc/create-vcc.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'otp',
    component: OtpPage
  },
  {
    path: 'dashboard',
    component: DashboardPage
  },
  {
    path: 'sources',
    component:SourcesPage
  },
  {
    path: 'destination',
    component:DestinationPage
  },
  {
    path: 'create-virtual-credit-card',
    component:CreateVcc
  },
  {
    path: 'nfc-payment',
    component:NfcPaymentPage
  },
  {
    path: 'list-of-cc',
    component:ListOfCcPage
  },
  {
    path: 'vcc-details',
    component:VccDetailsPage,

    children:[
      {
        path: 'settings',
        component: VccSettingsPage
      },
      {
        path: 'history',
        component:VccHistoryPage,
      }
    ]
  },

   {
        path: 'add-pcc',
        component:AddPccPage,
      },
  {
    path: 'schedule-payment',
    component:SchedulePaymentPage,
    },
  {
    path: 'transaction-history',
    component:TransactionHistoryPage,

  },
  {
    path: 'verification',
    component:VerificationPage,
  },
  {
    path: 'add-source',
    component:AddSourcePage,
  },
  {
    path: 'add-destination',
    component:AddDestinationPage,
  },












];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
