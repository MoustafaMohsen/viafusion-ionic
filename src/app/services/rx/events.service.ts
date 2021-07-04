import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Storage } from '@ionic/storage-angular';
import { IDBMetaContact } from 'src/app/interfaces/db/itrans';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor(private storage: Storage) { }

  public user$ = new BehaviorSubject<IDBContact>({
    security: {
      login: {
        authenticated: false,
        // checkes
        otp_passed: false,
        pin_passed: false,
        pf_passed: false,

        // has
        has_otp: false,
        has_pin: false,
        has_pf: false,

        // values
        _otp_value: null,
        _pin_value: null,
        _fp_value: null,

        user_registred: false,
        user_verified: false,

        resend_otp_after: 60,

        data: null,
        _sandbox: true,

      }
    }
  });

  public meta$ = new BehaviorSubject<IDBMetaContact>(null);


  temp: {
    transaction: {
      sources?: BehaviorSubject<PostCreatePayment.ICreate[]>,
      id?: string
      source_amount?: string
      destination_amount?: string
      destinations?: any[]
      executed?: boolean
    }
    [key: string]: any;
  } = {
      transaction: {
        sources: new BehaviorSubject<PostCreatePayment.ICreate[]>([]),
        source_amount:"0"
      }
    };

  async init_subscribe() {
    this.storage.get("user").then(storage_user => {
      console.log("====== First time ==== storage get user 🏪>>");
      console.log(this.storage.get("user"));
      if (storage_user) {
        this.user$.next(storage_user)
      }
    });

    // regulary update storage to match the latest
    this.user$.subscribe(async (u) => {
      console.log("=== user$.subscribe Fired 🔥");
      await this.storage.set("user", u);
      console.log("=== storage was set with value", u);
    })
  }
}
