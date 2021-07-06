import { WalletService } from 'src/app/services/wallet/wallet.service';
import { LoadingService } from './../../../services/loading.service';
import { Router } from '@angular/router';
import { ITransaction, ITransactionFull_payment, ITransactionFull_payout } from './../../../interfaces/db/idbmetacontact';
import { RX } from './../../../services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionStatusesTypes } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-complete-transaction',
  templateUrl: './complete-transaction.page.html',
  styleUrls: ['./complete-transaction.page.scss'],
})
export class CompleteTransactionPage implements OnInit {



  constructor(private rx: RX, private router: Router, private walletSrv: WalletService, public loading: LoadingService) { }

  @Input() transaction: ITransaction = {
    "payments": [
      {
        "request": {
          "amount": 333,
          "payment_method": {
            "type": "us_mastercard_card",
            "fields": {
              "name": "fasf",
              "number": "5446627313825177",
              "expiration_month": "12",
              "expiration_year": "25",
              "cvv": "555"
            }
          },
          "metadata": {
            "name": "Mastercard",
            "image": "https://iconslib.rapyd.net/checkout/us_mastercard_card.png",
            "category": "card"
          },
          "3DS_requirede": false,
          "address": {
            "id": "address_c487057e5e227bf36ce24a459cc56b88",
            "name": "asfds",
            "line_1": "asdfsdaf",
            "line_2": "",
            "line_3": "",
            "city": "asdf",
            "state": "fadsf",
            "country": "US",
            "zip": "5500",
            "phone_number": "",
            "metadata": {},
            "canton": "",
            "district": "",
            "created_at": 1625479611
          },
          "currency": "USD",
          "complete_payment_url": "https://google.com/",
          "error_payment_url": "https://google.com/",
          "description": "",
          "capture": true,
          "customer": "cus_89358af8f82d0d61ccad7055efd22f5e",
          "statement_descriptor": "Test Transfer",
          "ewallets": [
            {
              "ewallet": "ewallet_eba088836a8e0fe6d29c8909be7cbe13",
              "percentage": 100
            }
          ]
        }
      }
    ],
    "id": "tranid_bQrWd",
    "source_amount": "333",
    "destination_amount": "0333",
    "payouts": [
      {
        "request": {
          "payout_amount": "333",
          "payout_method_type": "us_mastercard_card",
          "payout_currency": "USD",
          "beneficiary_country": "US",
          "beneficiary_entity_type": "individual",
          "beneficiary": {
            "email": "ffas@ffsdf.com",
            "company_name": "af",
            "postcode": "165165",
            "number": "5446627313825177",
            "expiration_month": "12",
            "expiration_year": "25",
            "cvv": "555"
          },
          "sender": {
            "email": "ffas@ffsdf.com",
            "company_name": "af",
            "postcode": "165165"
          },
          "sender_country": "US",
          "sender_currency": "USD",
          "sender_entity_type": "individual",
          "ewallet": "ewallet_eba088836a8e0fe6d29c8909be7cbe13",
          "merchant_reference_id": "vZjGq",
          "metadata": {
            "name": "null",
            "image": "null",
            "category": "null"
          },
          "description": "",
          "confirm_automatically": true,
          "statement_descriptor": "Test Transfer"
        }
      }
    ],
    "transfer_resoponse": {},
    "execute": true,
    "executed": false,
    "type": "many2many"
  } as any;
  _sub: Subscription
  ionViewWillEnter() {
    this.transaction
    this._sub = this.rx.temp.view_transaction.subscribe(t => {
      this.transaction = t
      console.log("transaction overview updated");
      console.log(this.transaction);
    })
  }

  ionViewWillLeave() {
    this._sub.unsubscribe();
  }
  ngOnInit() {
  }

  action_status_type(status): ActionStatusesTypes {
    let text =
      status === "ACT" ? { btn_active: true, btn: "Active & Waiting", message: "Active and awaiting payment. Can be updated." } :
        status === "CAN" ? { btn_active: false, btn: "Canceled", message: "Canceled by the merchant or the customer's bank." } :
          status === "CLO" ? { btn_active: false, btn: "", message: "Closed and paid." } :
            status === "ERR" ? { btn_active: false, btn: "", message: "Error. An attempt was made to create or complete a payment, but it failed." } :
              status === "EXP" ? { btn_active: false, btn: "", message: "The payment has expired." } :
                status === "NEW" ? { btn_active: true, btn: "", message: "Not closed." } :
                  status === "REV" ? { btn_active: false, btn: "", message: "Reversed by Rapyd. See cancel_reason, above." } : { btn_active: false, btn: "??", message: "Unkown Error" }
    return text;
  }

  payment_action(payment: ITransactionFull_payment) {
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
    if (!this.transaction || !this.transaction.id || this.transaction.payments_executed) {
      setTimeout(() => {
        event && event.target.complete();
      }, 2000);

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

  btn_active(payment: ITransactionFull_payment) {
    if (payment?.response?.body?.data?.status) {
      return this.action_status_type(payment.response.body.data.status).btn_active && this.loading.loading
    }
    if (!payment.response || !payment.response.body) {
      return false && this.loading.loading; // Change false to true if you want to enable manual payment
    }
    return false && this.loading.loading
  }

  card_clicked(payment: ITransactionFull_payment | ITransactionFull_payout) {
    console.log(payment)
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
