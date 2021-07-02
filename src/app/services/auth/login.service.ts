import { LoadingService } from './../loading.service';
import { Router } from '@angular/router';
import { RX } from './../rx/events.service';
import { Injectable } from '@angular/core';
import { ILogin, ILOginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Api } from '../api/api';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) {
  }

  async send_login(phone_number: number | string) {
    this.loading.start();
    let login = {
      phone_number,
      security: "{}"
    }
    await this.api.post<ILOginTransportObj<IDBContact>>("login", login).subscribe((res) => {
      this.loading.stop();
      console.log("send_login() res.data");
      console.log(res.data);
      if (res.success && res.data) {
        let user:IDBContact = {
          contact_reference_id:res.data.contact_reference_id,
          security:{
            login:res.data.login
          }
        }
        console.log("Sending logged in user to user$", user);
        this.rx.user$.next(user);
        // continue to otp
        this.router.navigateByUrl("/auth/otp")
      }
    },
      err => {
        this.loading.stop();
      }

    )
  }

  confirm_otp(otp: number | string) {
    let user = this.rx.user$.value
    return this.api.post<IDBContact>("confirm-otp", {
      user:{contact_reference_id:user.contact_reference_id},
      otp
    })
  }

  login_register_sequence(){
    var user = this.rx.user$.value;

    // TODO: login sequence
    if (user.security.login.user_exsits) {

    }
  }


}
