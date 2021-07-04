import { Api } from './../api/api';
import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Storage } from '@ionic/storage-angular';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { IDBMetaContact } from 'src/app/interfaces/db/idbmetacontact';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor(private storage: Storage, private api:Api) { }

  public user$ = new BehaviorSubject<IDBContact>({
    security: {
      login: {
        authenticated: false,
        // checkes
        otp_passed: false,
        pin_passed: false,
        fp_passed: false,
        device_passed:false,

        // has
        has_otp: false,
        has_pin: false,
        has_fp: false,
        has_device:false,

        // values
        _otp_value: null,
        _pin_value: null,
        _fp_value: null,
        _device_value:null,

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


  // ========== contact handling and updateing

  // =============== Contact
  async get_db_contact():Promise<IDBContact>{
    return new Promise((resolve,reject)=>{
      let contact = this.user$.value
      this.api.post<IDBContact>("get-db-user",contact).subscribe(res=>{
        this.user$.next(res.data);
        resolve(res.data)
      })
    })
  }

  async post_db_contact():Promise<IDBContact>{
    return new Promise((resolve,reject)=>{
      let contact = this.user$.value
      this.api.post<IDBContact>("update-db-user",contact).subscribe(res=>{
        this.user$.next(res.data);
        resolve(res.data)
      })
    })
  }


  // =============== Meta Contact
  async get_db_metacontact():Promise<IDBMetaContact>{
    return new Promise((resolve,reject)=>{
      let metacontact = this.meta$.value
      this.api.post<IDBMetaContact>("get-db-metacontact",metacontact).subscribe(res=>{
        this.meta$.next(res.data);
        resolve(res.data)
      })
    })
  }

  async post_db_metacontact():Promise<IDBMetaContact>{
    return new Promise((resolve,reject)=>{
      let metacontact = this.meta$.value
      this.api.post<IDBMetaContact>("update-db-metacontact",metacontact).subscribe(res=>{
        this.meta$.next(res.data);
        resolve(res.data)
      })
    })
  }

}
