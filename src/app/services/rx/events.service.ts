import { IUtilitiesResponse } from './../../interfaces/rapyd/rest-response';
import { Api } from './../api/api';
import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Storage } from '@ionic/storage-angular';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { IDBMetaContact, ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { ICreatePayout, IGetPayoutRequiredFields } from 'src/app/interfaces/rapyd/ipayout';
import { TransferToWallet } from 'src/app/interfaces/rapyd/iwallet';
import { categories, IAPIServerResponse } from 'src/app/interfaces/rapyd/types';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { ListIssuedVcc } from 'src/app/interfaces/rapyd/ivcc';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor(private storage: Storage, private api: Api, private alertController: AlertController, private toastController: ToastController) { }

  public user$ = new BehaviorSubject<IDBContact>({
    security: {
      login: {
        authenticated: false,
        // checkes
        otp_passed: false,
        pin_passed: false,
        fp_passed: false,
        device_passed: false,

        // has
        has_otp: false,
        has_pin: false,
        has_fp: false,
        has_device: false,

        // values
        _otp_value: null,
        _pin_value: null,
        _fp_value: null,
        _device_value: null,

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
    transaction: IRXTransaction; destination_queries: {
      [key: string]: {
        request_query: IGetPayoutRequiredFields.QueryRequest
        response_query: IGetPayoutRequiredFields.Response
      }
    },
    view_transaction?:ITransaction,
    vcc_details?:ListIssuedVcc.Response
  } = {
      transaction: {
        payments: new BehaviorSubject<PostCreatePayment.Request[]>([]),
        payouts: new BehaviorSubject<ICreatePayout.Request[]>([]),
        source_amount: "0",
        destination_amount: "0",
        execute: false,
        executed: false,
        type: null,
        id: "tranid_" + this.makeid(5)
      },
      destination_queries: {} as any
    };

  get meta() {
    return this.meta$.asObservable().pipe(filter(user => !!user))
  }

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

    this.storage.get("meta").then(storage_meta => {
      console.log("====== First time ==== storage get meta 🏪>>");
      console.log(this.storage.get("meta"));
      if (storage_meta) {
        this.meta$.next(storage_meta)
      }
    });

    // regulary update storage to match the latest
    this.meta$.subscribe(async (u) => {
      console.log("=== meta$.subscribe Fired 🔥");
      if (!u || !u.contact_reference_id) {
        // this.get_db_metacontact();
      }
      await this.storage.set("meta", u);
      console.log("=== Meta storage was set with value", u);
    })
  }

  async alert(message = "Okay") {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      message: message,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }


  async toast(message = "okay", title = "") {
    const toast = await this.toastController.create({
      header: title,
      message,
      position: 'bottom',
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();

    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  toastError(error: IAPIServerResponse<IUtilitiesResponse>) {
    console.log("toastError");

    console.error(error);

    if (!error.success) {
      if (typeof error.message === "string") {
        this.toast(error.message)
      }else{
        this.toast(error.message.body.status.message + "" + error.message.body.status.error_code)
      }
    }
  }
  // ========== contact handling and updateing

  // =============== Contact
  async get_db_contact(): Promise<IDBContact> {
    return new Promise((resolve, reject) => {
      let contact = this.user$.value
      this.api.post<IDBContact>("update-accounts", contact).subscribe(res => {
        if (res.success) {
          this.user$.next(res.data);
          resolve(res.data)
        }
        else {
          reject(res as IAPIServerResponse)
        }
      })
    })
  }

  async post_db_contact(): Promise<IDBContact> {
    return new Promise((resolve, reject) => {
      let contact = this.user$.value
      this.api.post<IDBContact>("update-db-user", contact).subscribe(res => {
        this.user$.next(res.data);
        resolve(res.data)
      })
    })
  }


  // =============== Meta Contact
  async get_db_metacontact(): Promise<IDBMetaContact> {
    return new Promise((resolve, reject) => {
      let user = this.user$.value
      this.api.post<IDBMetaContact>("get-db-metacontact", { contact_reference_id: user.contact_reference_id }).subscribe(res => {
        this.meta$.next(res.data);
        resolve(res.data)
      })
    })
  }

  async post_db_metacontact(metacontact?): Promise<IDBMetaContact> {
    return new Promise((resolve, reject) => {
      metacontact = metacontact?metacontact:this.meta$.value
      this.api.post<IDBMetaContact>("update-db-metacontact", metacontact).subscribe(res => {
        this.meta$.next(res.data);
        resolve(res.data)
      })
    })
  }

  makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

}

export interface IRXTransaction {
  id: string;
  source_amount?: string;
  destination_amount?: string;
  payments: BehaviorSubject<PostCreatePayment.Request[]>;
  payouts: BehaviorSubject<ICreatePayout.Request[]>;

  transfer_resoponse?: TransferToWallet.Response;

  execute: boolean;
  executed: boolean;
  type: "w2w" | "many2many" | `${categories}2${categories}`

}
