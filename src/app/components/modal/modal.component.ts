import { Router } from '@angular/router';
import { WalletService } from 'src/app/services/wallet/wallet.service';
import { Subscription } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {

  @Input() number: string;
  @Input() amount: number;
  @Input() message: string;

  constructor(
    private modalCtr: ModalController, private rx:RX,private walletSrv:WalletService,private router:Router,private alertCtr:AlertController
  ) { }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  transfer() {
    console.log("==== Transfer to ====V");

    console.log(this.rx.temp.wallet2wallet.value);
    setTimeout(() => {
      this.walletSrv.do_wallet_2_wallet(this.rx.temp.wallet2wallet.value).subscribe(async (res)=>{
        console.log("w2w res",res);

        if (res.success) {
          this.alertCtr.create({
            header:"Sent " + this.amount+"$ to " + this.rx.temp.wallet2wallet.value.phone_number,
            subHeader:new Date().toLocaleString(),
            message:this.message,
            buttons:['Okay']
          }).then(m=>m.present())

          this.rx.temp.wallet2wallet.next({} as any) //rest status
          // this.rx.get_db_metacontact();
          // this.rx.get_db_contact();
          this.walletSrv.get_wallet_balance().then();
          this.close();
          this.router.navigateByUrl("/dashboard");
        }else{
          this.rx.toastError(res as any)
        }
      },
      error=>{
        this.rx.toastError(error as any)
      }
      )
    }, 500);

  }
  _sub:Subscription
  ngOnInit() {
    this._sub = this.rx.temp.wallet2wallet.subscribe(d=>{
      this.number = d.phone_number
      this.amount = d.amount
      this.message= d.message
    })
  }
  ngOnDestroy(): void {
    this._sub.unsubscribe();
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

  }

}




