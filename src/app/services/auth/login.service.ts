import { AlertController } from '@ionic/angular';
import { StorageService } from './../storage/storage.service';
import { LoadingService } from './../loading.service';
import { Router } from '@angular/router';
import { RX } from './../rx/events.service';
import { Injectable } from '@angular/core';
import { ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Api } from '../api/api';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService, private storage: StorageService, private alertController:AlertController) {
  }

  async send_login(phone_number: string) {
    this.loading.start();
    let login = {
      phone_number,
      login: {}
    }
    await this.api.post<ILoginTransportObj<IDBContact>>("login", login).subscribe((res) => {
      this.loading.stop();
      console.log("send_login() res.data");
      console.log(res.data);
      if (res.success && res.data) {
        let user: IDBContact = {
          contact_reference_id: res.data.contact_reference_id,
          security: {
            login: res.data.login
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
        this.rx.toastError(err)
      }

    )
  }

  confirm_otp(otp: number | string) {
    let user = this.rx.user$.value
    return this.api.post<IDBContact>("confirm-otp", {
      user: { contact_reference_id: user.contact_reference_id },
      otp
    })
  }

  confirm_pin(pin: number | string) {
    let user = this.rx.user$.value
    return this.api.post<IDBContact>("confirm-pin", {
      user: { contact_reference_id: user.contact_reference_id },
      pin
    })
  }

  set_pin(pin: number | string) {
    let user = this.rx.user$.value
    return this.api.post<IDBContact>("set-pin", {
      user: { contact_reference_id: user.contact_reference_id },
      pin
    })
  }




  async delete_db_contact(): Promise<IDBContact> {
    return new Promise((resolve, reject) => {
      let contact = this.rx.user$.value
      this.api.post<IDBContact>("delete-db-user", contact).subscribe(res => {
        if (res.success) {
          this.rx.toast("You account was deleted");
          this.logout();
        }else{
          this.rx.toastError(res as any)
        }
      })
    })
  }

  async critical_error_delete_account(){
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header:"Critical Error",
      message: "An Important security check has failed, your account will be deleted, don't worry you can sign up again",
      buttons: [{
        text:"DELETE",
        role:"delete"
      },
      {
        text:"cancel"
      }
    ]
    });
    await alert.present();
    this.delete_db_contact();
  }


  login_register_sequence() {
    var user = this.rx.user$.value;
    // TODO: login sequence
    if (user.security.login.has_pin) {
      console.log("user HAVE pin");

      this.router.navigateByUrl("/auth/login-with-pin");
    } else {
      console.log("user DOESN'T HAVE pin");

      this.router.navigateByUrl("/auth/register-pin");
    }
  }

  async logout() {
    this.rx.init_service();
    await this.rx.reset_storage()
    window.location.href = '/auth/login';
  }

  is_loggedin(){
    return new Promise(async (resolve,reject)=>{
      setTimeout(async () => {
        return resolve((await this.storage.get("user") as IDBContact)?.security?.login?.authenticated)
      }, 0);
    })
  }


}
