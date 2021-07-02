import { LoginService } from './../../../services/auth/login.service';
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
  constructor(private login_srv:LoginService, public loading:LoadingService) {}

  async submit(){
    this.login_srv.send_login(this.phone);
  }
}
