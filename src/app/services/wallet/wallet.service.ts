import { HelperService } from './../util/helper';
import { IDBMetaContact, ITransaction, ITransactionFull_payment } from './../../interfaces/db/idbmetacontact';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { Api } from '../api/api';
import { ICreateWallet, ILookup_user, IWallet2Wallet } from 'src/app/interfaces/db/idbwallet';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ICurrency, WalletBalanceResponse } from 'src/app/interfaces/rapyd/iwallet';
import { IRXTransaction } from 'src/app/interfaces/interfaces';
import { RX } from '../rx/events.service';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService, private h:HelperService) { }

  create_wallet(form: ICreateWallet.Form) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBContact>("create-wallet", {
      form, contact_reference_id
    })

  }

  balance$ = new BehaviorSubject<number>(0);

  //#region Payments
  async do_payments(tran?: ITransaction) {
    tran = tran ? tran : this.convert_rxtran_to_transaction(this.rx.temp["transaction"]);
    tran.execute_payments = true;
    tran.id || (tran.id = "tran_" + this.rx.makeid(5))
    this.post_transaction(tran).then(async (res) => {
      await this.rx.get_db_metacontact();
      this.execute_payment_transactions(tran.id).subscribe((res) => {
        this.rx.reset_temp_value();
        this.rx.get_db_metacontact();
        if (res.success) {
          this.rx.toast("Payments Done")
          console.log(res.data);
        } else {
          this.rx.toastError(res as any)
        }
      }, err => {
        this.rx.toastError(err)
      })
    }).catch(this.rx.toastError)
  }

  execute_payment_transactions(tran_id: string) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBMetaContact>("execute-payments", { contact_reference_id, tran_id })
  }
  get_payment(payment_id: string) {
    return this.api.post<IDBMetaContact>("get-payments", { payment_id })
  }
  complete_payment(payment_id: string) {
    return this.api.post<PostCreatePayment.Response>("complete-payment", { payment_id })
  }

  get_rates(query: ICurrency.QueryRequest) {
    return this.api.post<ICurrency.Response>("get-rates", query)
  }

  //#endregion
  //#region Payments
  save_transaction(tran?: ITransaction) {
    tran = tran ? tran : this.convert_rxtran_to_transaction(this.rx.temp["transaction"])
    return this.post_transaction(tran);
  }

  async do_payouts(tran?: ITransaction) {
    tran = tran ? tran : this.convert_rxtran_to_transaction(this.rx.temp["transaction"])
    tran.execute_payouts = true;
    this.post_transaction(tran).then(async (res) => {
      await this.rx.get_db_metacontact();
      this.execute_payout_transactions(tran.id).subscribe((res) => {
        if (res.success) {
          this.rx.toast("Payouts Done")
          console.log(res.data);
        } else {
          this.rx.toastError(res as any)
        }
      }, err => {
        this.rx.toastError(err)
      }).unsubscribe();
    }).catch(this.rx.toastError)
  }

  execute_payout_transactions(tran_id: string) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBMetaContact>("execute-payouts", { contact_reference_id, tran_id })
  }
  get_payout(payout_id: string) {
    return this.api.post<IDBMetaContact>("get-payouts", { payout_id })
  }
  complete_payout(payout_id: string) {
    return this.api.post<IDBMetaContact>("complete-payouts", { payout_id })
  }

  refresh_transaction_responses(tran_id) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBMetaContact>("update-payments-payouts", { contact_reference_id, tran_id })
  }

  update_transactions_status(trans: ITransaction[]) {
    if (!trans) return trans;
    trans.forEach(t => {
      let requries_action = false;
      let canceled = false;
      let closed = false;
      let update = false;

      // update closed amount if you can
      let r = this.h.reduce_transaction_amounts(t);
      t.source_amount = r.source_amount as any
      t.destination_amount = r.destination_amount as any
      t.closed_payments_amount = r.closed_payments_amount
      t.closed_payouts_amount = r.closed_payouts_amount
      console.log("-----> closed t.closed_payments_amount", t.closed_payments_amount);

      // === loop payments
      t.payments?.forEach(p => {
        // Check if hase response
        if (p.response && p.response.body.status.status == "SUCCESS") {
          var payment_res = p.response.body.data;

          // is one active
          if (payment_res.status == "ACT") {
            requries_action = true
            update = true;
          }
          // is all closed
          if (payment_res.status == "CLO") {
            closed = true
            update = true;
          }
          // is cancaled
          if (payment_res.status == "CAN") {
            canceled = true;
            update = false;
          }
        }
      })

      if (update)
        t.status = canceled ? "canceled" : closed ? "closed" : requries_action ? "requires_action" : "saved";
    })
    return trans;
  }
  //#endregion

  lookup_user(phone_number) {
    console.log("looking up:", phone_number);

    return this.api.post<ILookup_user>("get-like-db-user", { phone_number })
  }

  // todo:
  do_wallet_2_wallet(w2w: IWallet2Wallet) {
    console.log("sending W2W:", w2w);
    w2w.contact_reference_id = this.rx.user$.value.contact_reference_id
    return this.api.post<IDBMetaContact>("w2w", w2w)
  }

  async get_wallet_balance(make_request = false, currency = "USD"): Promise<number> {
    this.rx.get_db_metacontact();
    this.rx.get_db_contact();
    return new Promise((resolve, reject) => {
      var sub = this.rx.user$.subscribe(u => {
        this.rx.meta$.value.transactions = this.update_transactions_status(this.rx.meta$.value.transactions);
        this.rx.meta$.next(this.rx.meta$.value);
        if (u && u.rapyd_wallet_data && u.rapyd_wallet_data.accounts && u.rapyd_wallet_data.accounts.length > 0) {
          let accounts = u.rapyd_wallet_data.accounts
          console.log("accounts");
          console.log(accounts);
          let balance = this.reduce_accounts_to_amount(accounts, currency)
          console.log("balance");
          console.log(balance);
          this.balance$.next(balance);
          resolve(balance)
        }
      }).unsubscribe()
    })
  }


  // ==== Create Transaction


  post_transaction(tran: ITransaction): Promise<IDBMetaContact> {
    var tran_id = tran.id || "tran_" + this.rx.makeid(5);
    tran.id = tran_id

    return new Promise((resolve, reject) => {
      this.rx.get_db_metacontact().then(async (meta) => {
        let push = true;
        for (let i = 0; i < meta.transactions.length; i++) {
          const metatran = meta.transactions[i];
          if (metatran.id == tran.id) {
            meta.transactions[i] = tran;
            push = false;
            break;
          }
        }
        push && meta.transactions.push(tran);
        let update_meta = await this.rx.post_db_metacontact(meta)
        resolve(update_meta)
      })
    })

  }

  convert_rxtran_to_transaction(rxtran: IRXTransaction) {
    let payments: ITransactionFull_payment[] = [];
    rxtran.payments.value && rxtran.payments.value.forEach(p => payments.push({ request: p } as any))
    let payouts = [];
    rxtran.payouts.value && rxtran.payouts.value.forEach(p => payouts.push({ request: p } as any))
    let tran: ITransaction = {
      payments,
      id: rxtran.id || this.rx.makeid(5),
      source_amount: parseInt(rxtran.source_amount as any) as any,
      destination_amount: parseInt(rxtran.destination_amount as any) as any,

      payouts,

      transfer_resoponse: {} as any,

      closed_payments_amount: rxtran.closed_payments_amount || 0,
      closed_payouts_amount: rxtran.closed_payouts_amount || 0,
      description: rxtran.description,
      type: "many2many",
      execution_date: rxtran.execution_date,
      status: rxtran.status,
      payments_executed: rxtran.payments_executed,
      payouts_executed: rxtran.payouts_executed
    } as any
    return tran;
  }


  // === helpers

  // if we will use currencies in the future
  reduce_accounts_to_amount(accounts: WalletBalanceResponse[], currency: string) {
    let filterd = accounts.filter(a => a.currency == currency);
    if (filterd) {
      let balance: number = filterd.reduce((a, b) => {
        return (a.balance + b.balance) as any
      }).balance as any
      return balance;
    } else {
      return 0
    }
  }

}
