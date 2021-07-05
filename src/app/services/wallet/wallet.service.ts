import { Injectable } from '@angular/core';
import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { RX } from '../rx/events.service';
import { Api } from '../api/api';
import { ICreateWallet } from 'src/app/interfaces/db/idbwallet';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { WalletBallanceResponse } from 'src/app/interfaces/rapyd/iwallet';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) { }

  create_wallet(form: ICreateWallet.Form) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBContact>("create-wallet",{
      form,contact_reference_id
    })

  }


  // === helpers
  reduce_accounts_to_amount(accounts: WalletBallanceResponse[], currency: string) {
    let filterd = accounts.filter(a => a.currency == currency);
    if (filterd) {
        let balance: number = filterd.reduce((a, b) => {
            return (a.balance + b.balance) as any
        }) as any
        return balance;
    } else {
        return 0
    }
}

}
