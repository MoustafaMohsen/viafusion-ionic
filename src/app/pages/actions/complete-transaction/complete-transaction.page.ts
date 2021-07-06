import { ModalController } from '@ionic/angular';
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



  constructor(private rx: RX, private router: Router, private walletSrv: WalletService, public loading: LoadingService, private modalCtrl:ModalController) { }

  @Input() transaction: ITransaction ;
  _sub: Subscription
  ionViewWillEnter() {
  }

  ionViewWillLeave() {
  }
  ngOnInit() {
    this._sub = this.rx.temp.view_transaction.subscribe(t => {
      console.log("transaction overview updated");
      console.log(this.transaction);
      if(!t)return;
      this.transaction = t
    })
  }

  action_status_type(status): ActionStatusesTypes {
    let text =
      status === "ACT" ? { btn_active: true, btn: "Waiting Confirmation", message: "Active and awaiting payment. Can be updated." } :
        status === "CAN" ? { btn_active: false, btn: "Canceled", message: "Canceled by the merchant or the customer's bank." } :
          status === "CLO" ? { btn_active: false, btn: "Done", message: "Closed and paid." } :
            status === "ERR" ? { btn_active: false, btn: "Errored", message: "Error. An attempt was made to create or complete a payment, but it failed." } :
              status === "EXP" ? { btn_active: false, btn: "Expired", message: "The payment has expired." } :
                status === "NEW" ? { btn_active: true, btn: "New", message: "Not closed." } :
                  status === "REV" ? { btn_active: false, btn: "", message: "Reversed by Rapyd. See cancel_reason, above." } : { btn_active: false, btn: "??", message: "Unkown Error" }
    return text;
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
    }, 2000);
    if (!this.transaction || !this.transaction.id) {
      return;
    }
    this.loading.start();
    this.walletSrv.refresh_transaction_responses(this.transaction.id).subscribe(data => {
      this.loading.stop();
      if (data.success) {
        this.rx.toast("Transactions Updated", "", 5000);
        data.data.transactions = this.walletSrv.update_transactions_status(data.data.transactions)
        this.rx.meta$.next(data.data);
        let newTran = data.data.transactions.find(t => t.id == this.transaction.id);
        newTran && this.rx.temp.view_transaction && this.rx.temp.view_transaction.next(newTran);
      }
      setTimeout(() => {
        event && event.target.complete();
      }, 2000);
    })
  }

  save_transaction(){
    if (!this.transaction || !this.transaction.id) {
      this.rx.toast("Transaction not found!")
      return;
    }
    this.loading.start();
    this.walletSrv.save_transaction()
  }
  btn_active(payment: ITransactionFull_payment | ITransactionFull_payout) {
    if (payment?.response?.body?.data?.status) {
      return this.action_status_type(payment.response.body.data.status).btn_active && this.loading.loading
    }
    if (!payment.response || !payment.response.body) {
      return false && this.loading.loading; // Change false to true if you want to enable manual payment
    }
    return false && this.loading.loading
  }

  async card_clicked(payment: ITransactionFull_payment | ITransactionFull_payout) {
    console.log(payment);
    let modal = await this.modalCtrl.create({
      component:PaymentModalComponent,
      componentProps:{payment},
      backdropDismiss:true,
      showBackdrop:true
    });
    modal.present();
  }

  do_payments() {
    this.loading.start();
    this.walletSrv.do_payments(this.transaction).then(d => this.loading.stop())
  }

  do_payouts() {
    this.loading.start()
    this.walletSrv.do_payouts(this.transaction).then(d => this.loading.stop())
  }
}
