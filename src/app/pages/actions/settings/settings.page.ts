import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  phone_number = "";
  name = "";
  constructor(private rx:RX,private loginSrv:LoginService,private router:Router,private alertController:AlertController) { }

  ngOnInit() {
    this.rx.user$.subscribe(u=>{
      this.phone_number = u.phone_number
      if (!u.rapyd_contact_data) {
        return
      }
      this.name = u.rapyd_contact_data.first_name + u.rapyd_contact_data.last_name
    })
  }
  wallet_trans(){
    this.router.navigateByUrl("/transaction/wallet-transaction-history")
  }
  iban(){
    this.router.navigateByUrl("/cc/iban/iban-details")
  }

  logout(){
    this.loginSrv.logout()
  }

  async delete_user(){
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header:"Are you sure you want to delete your account",
      message: "Click yes to delete, for compliance porposes we might stil keep some of your transactions in our servers",
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
    const { role } = await alert.onDidDismiss();
    (role == "delete" && this.loginSrv.delete_db_contact())
  }
}
