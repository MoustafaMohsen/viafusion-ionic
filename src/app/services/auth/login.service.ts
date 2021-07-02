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

  constructor(private api: Api, private rx: RX, private router: Router) {
  }

  async send_login(phone_number:number) {
    let login = {
      phone_number,
      security: "{}"
    }
    await this.api.post<ILOginTransportObj<IDBContact>>("login", login).subscribe((res) => {
      if (res.success && res.data) {
        this.rx.auth$.next(res.data);
        // continue to otp
        this.router.navigateByUrl("/auth/otp")
      }
    })
  }

  async send_otp(otp:number) {
    let login = this.rx.auth$.value.;
    let contact_reference_id

    await this.api.post<IDBContact>("confirm-otp", login).subscribe((res) => {
      if (res.success && res.data) {
        this.rx.user$.next(res.data);
        this.rx.auth$.next(res.data.securiy);
        // continue to otp
        this.router.navigateByUrl("/auth/otp")
      }
    })
  }


}
