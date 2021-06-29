import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {

  phone="";
  constructor(private router:Router, public loading:LoadingService) {}

  async submit(){
    this.loading.loading$.next(true);
    setTimeout(async () => {
      await this.router.navigateByUrl("/otp");
      this.loading.loading$.next(false);
    }, 0);
  }
}
