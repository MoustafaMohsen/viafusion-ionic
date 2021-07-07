import { HelperService } from './../../../services/util/helper';
import { ModalController, AlertController } from '@ionic/angular';
import { WalletService } from 'src/app/services/wallet/wallet.service';
import { LoadingService } from './../../../services/loading.service';
import { Router } from '@angular/router';
import { ITransaction, ITransactionFull_payment, ITransactionFull_payout } from './../../../interfaces/db/idbmetacontact';
import { RX } from './../../../services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionStatusesTypes } from 'src/app/interfaces/interfaces';
import { PaymentModalComponent } from 'src/app/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-complete-transaction',
  templateUrl: './complete-transaction.page.html',
  styleUrls: ['./complete-transaction.page.scss'],
})
export class CompleteTransactionPage implements OnInit {



  constructor(private rx: RX, private router: Router, private walletSrv: WalletService, public loading: LoadingService, private modalCtrl: ModalController, private h: HelperService, private alertController: AlertController) { }

  @Input() transaction: ITransaction;
  _sub: Subscription
  ionViewWillEnter() {
    console.log("Entred: Complete Transaction ionViewWillEnter()");

    this._sub = this.rx.temp.view_transaction.subscribe(t => {
      console.log("transaction overview updated");
      console.log(this.transaction);
      if (!t) return;
      this.transaction = t
    })
  }

  ionViewWillLeave() {
    this._sub.unsubscribe();
  }
  ngOnInit() {
    console.log("left: Complete Transaction ionViewWillEnter()");
  }

  payment_action(payment: ITransactionFull_payment) {
    return;
    if (payment.response && payment.response.body) {
      this.walletSrv.complete_payment(payment.response.body.data.id).subscribe(res => {
        if (!res.success) {
          this.rx.toastError(res as any);
        } else {
          var trans = this.rx.meta$.value.transactions
          for (let i = 0; i < trans.length; i++) {
            const t = trans[i];
            if (t.id == this.transaction.id) {
              t.payments.forEach(p => {
                if (p.response && p.response.body) {
                  p.response.body.data = res.data
                }
              })
            }
          }
          this.rx.meta$.value.transactions = trans;
          this.rx.meta$.next(this.rx.meta$.value)
        }
      })
    }
    console.log("compelete_payment()");
    console.log(payment);
  }


  refresh_transaction(event?) {
    // TODO: remove return
    setTimeout(() => {
      event && event.target.complete();
    }, 20000);
    if (!this.transaction || !this.transaction.id) {
      return;
    }
    this.loading.start();
    this.walletSrv.refresh_transaction_responses(this.transaction.id).subscribe(data => {
      this.loading.stop();
      if (data.success) {
        this.rx.toast("Transactions Updated", "", 5000);
        data.data.transactions = this.h.update_transactions_status(data.data.transactions)
        this.rx.reset_temp_value();
        this.rx.get_db_metacontact();
        let newTran = data.data.transactions.find(t => t.id == this.transaction.id);
        newTran && this.rx.temp.view_transaction && this.rx.temp.view_transaction.next(newTran);
      }
      setTimeout(() => {
        event && event.target.complete();
      }, 1000);
    })
  }

  disable_do_payments_btn() {
    let is_loading = this.loading.loading;
    let is_closed = this.transaction.status == "closed";
  }

  save_transaction() {
    if (!this.transaction || !this.transaction.id) {
      this.rx.toast("Transaction not found!")
      return;
    }
    // this.loading.start();
    this.rx.temp["transaction"].status = this.transaction.status = "saved";
    this.walletSrv.save_transaction()
  }




  async open_payment_details(payment: ITransactionFull_payment) {
    console.log(payment);
    let modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: { payment, operation_type: "payment" },
      backdropDismiss: true,
      showBackdrop: true
    });
    modal.present();
  }

  async open_payout_details(payment: ITransactionFull_payout) {
    console.log(payment);
    let modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: { payment, operation_type: "payout" },
      backdropDismiss: true,
      showBackdrop: true
    });
    modal.present();
  }

  async do_payments() {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      message: "You might have done this action before, are you sure you want to repeat is?",
      buttons: [{
        text: "Yes",
        role: "do_action"
      }, {
        text: "No",
        role: "cancel"
      }]
    });

    var do_action = ()=>{
      console.log("do_payments() btn");
      this.loading.start();
      this.transaction.status = "created"
      this.transaction.execute_payments = true
      this.walletSrv.do_payments(this.transaction).then(d => this.loading.stop())
    }

    if(this.transaction.execute_payments || this.transaction.payments.filter(p=>p.response).length){
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      role=="yes" && do_action();
    }
    else{
      do_action();
    }


  }

  do_payouts() {
    console.log("do_payouts() btn");
    this.loading.start()
    this.transaction.status = "created"
    this.transaction.execute_payouts = true
    this.walletSrv.do_payouts(this.transaction).then(d => this.loading.stop())
  }
}
