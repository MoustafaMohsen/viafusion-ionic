import { FormControl, Validators, FormGroup } from '@angular/forms';
import { LoginService } from './../../../services/auth/login.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import parsePhoneNumber from 'libphonenumber-js'

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {

  form = new FormGroup({
    phone:new FormControl("",[Validators.required])
  })
  constructor(private login_srv:LoginService, public loading:LoadingService) {}

  async submit(){
    // let phone_number = this.form.controls.phone.value //(this.form.controls.phone.value as string).replace(/ |\(|\)|-/g,"");
    const phone_number = parsePhoneNumber(this.form.controls.phone.value)

    // console.log(this.form.controls.phone.value);
    // let rex = /^\+?[1-9]\d{1,14}$/;
    if(this.form.valid){
      console.log(phone_number.number);
      // return;
      this.login_srv.send_login(phone_number.number as string);
    }else{
      // this.error = "Invalid Phone Number";
    }
  }
}
