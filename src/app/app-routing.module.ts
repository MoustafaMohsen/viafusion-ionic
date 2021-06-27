import { ListOfCcPage } from './pages/list-of-cc/list-of-cc.page';
import { DestinationPage } from './pages/send/destination/destination.page';
import { NfcPaymentPage } from './pages/create/nfc-payment/nfc-payment.page';
import { CreateVirtualCreditCardPage } from './pages/create/create-virtual-credit-card/create-virtual-credit-card.page';
import { SourcesPage } from './pages/send/sources-page/sources.page';
import { OtpPage } from './pages/otp/otp.page';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';

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
    component:CreateVirtualCreditCardPage
  },
  {
    path: 'nfc-payment',
    component:NfcPaymentPage
  },
  {
    path: 'list-of-cc',
    component:ListOfCcPage
  },





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
