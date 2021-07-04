import { FormControl, Validators } from '@angular/forms';
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
  phoneControler= new FormControl("",[Validators.pattern(/^\+?[1-9]\d{1,14}$/)]);
  constructor(private login_srv:LoginService, public loading:LoadingService) {}

  async submit(){
    let rex = /^\+?[1-9]\d{1,14}$/;
    if(rex.test(this.phoneControler.value)){
      this.login_srv.send_login(this.phone);
    }else{
      // this.error = "Invalid Phone Number";
    }
  }
}
