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

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  declarations: [
    AppComponent,
    LoginPage,
    OtpPage,
    DashboardPage,
    MethodsDashboardComponent,
  ],
  entryComponents: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ApiService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
