import { RX } from 'src/app/services/rx/events.service';
import { WalletService } from 'src/app/services/wallet/wallet.service';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { ILookup_user } from 'src/app/interfaces/db/idbwallet';
import { throttleTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-enter-phone',
  templateUrl: './enter-phone.page.html',
  styleUrls: ['./enter-phone.page.scss'],
})
export class EnterPhonePage implements OnInit {

  constructor(public modalCtrl: ModalController,private walletSrv:WalletService,private rx:RX) {}

  search_form:FormControl=new FormControl("",[Validators.required]);
  entred_phone_numer;
  results:ILookup_user = {users:[]}



  ngOnInit() {
    this.search_form.valueChanges.pipe().subscribe(v=>{
      this.walletSrv.lookup_user(v).subscribe(r=>{
        if (r.success) {
          this.results=r.data;
          this.results.users.filter(p=>p!=this.rx.user$.value.phone_number)
        }else{
          this.rx.toastError(r.message)
        }
      })
    })
  }

  async initModal(number:string) {
    this.rx.temp.wallet2wallet.value.phone_number=number
    this.rx.temp.wallet2wallet.next(this.rx.temp.wallet2wallet.value)
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      cssClass:"bottom-drawer"
    });
      return await modal.present();
  }
  search_contacts(){
    document.getElementById("searchphones")?.focus()
  }
}
