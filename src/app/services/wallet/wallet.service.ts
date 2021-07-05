import { IDBMetaContact, ITransaction } from './../../interfaces/db/idbmetacontact';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { IRXTransaction, RX } from '../rx/events.service';
import { Api } from '../api/api';
import { ICreateWallet } from 'src/app/interfaces/db/idbwallet';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { WalletBalanceResponse } from 'src/app/interfaces/rapyd/iwallet';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService ) { }

  create_wallet(form: ICreateWallet.Form) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBContact>("create-wallet", {
      form, contact_reference_id
    })

  }

  balance$ = new BehaviorSubject<number>(0)

  async get_wallet_balance(make_request = false, currency = "USD"): Promise<number> {
    this.rx.get_db_contact();
    return new Promise((resolve, reject) => {
      this.rx.user$.subscribe(u => {
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
      })
    })
  }

  // ==== Create Transaction
  execute_payment_transactions(tran_id:string){
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBMetaContact>("execute-payments",{contact_reference_id,tran_id})
  }

  update_user_transactions(tran: ITransaction):Promise<IDBMetaContact>{
    var tran_id =  tran.id || this.rx.makeid(5);
    tran.id =  tran_id
    tran.payments.forEach(p=>{
      if (p.metadata && p.metadata.tran_id != tran_id) {
        p.metadata["tran_id"] = tran_id
      }else{
        p.metadata = {
          tran_id
        }
      }
    });

    tran.payouts.forEach(p=>{
      if (p.metadata && p.metadata.tran_id != tran_id) {
        p.metadata["tran_id"] = tran_id
      }else{
        p.metadata = {
          tran_id
        }
      }
    });

    return new Promise((resolve,reject)=>{
      this.rx.get_db_metacontact().then(async (meta)=>{
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
    let tran: ITransaction = {
      payments: rxtran.payments.value,
      id: rxtran.id || this.rx.makeid(5),
      source_amount: rxtran.source_amount,
      destination_amount: rxtran.destination_amount,

      payouts: rxtran.payouts.value,

      payments_response: [],
      payouts_response: [],

      transfer_resoponse: {} as any,

      execute: true,
      executed: false,
      type: "many2many"

    }
    return tran;
  }


  // === helpers

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
