import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OtpPage } from './pages/otp/otp.page';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './components/entry/app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './services/api.service';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { MethodsDashboardComponent } from './components/methods-dashboard/methods-dashboard.component';
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import  {icons} from './components/svg/index';
import { SourcesPage } from './pages/send/sources-page/sources.page';

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
  ],
  declarations: [
    AppComponent,
    LoginPage,
    OtpPage,
    DashboardPage,
    MethodsDashboardComponent,
    TransactionItemComponent,
    SourcesPage,
  ],
  entryComponents: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ApiService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
