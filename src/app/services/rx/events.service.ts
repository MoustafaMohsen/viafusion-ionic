import { IRapydStatusResponse, IUtilitiesResponse } from './../../interfaces/rapyd/rest-response';
import { Api } from './../api/api';
import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Storage } from '@ionic/storage-angular';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { IDBMetaContact, ITransaction, ITransactionFull_payment } from 'src/app/interfaces/db/idbmetacontact';
import { ICreatePayout, IGetPayoutRequiredFields } from 'src/app/interfaces/rapyd/ipayout';
import { TransferToWallet } from 'src/app/interfaces/rapyd/iwallet';
import { categories, IAPIServerResponse } from 'src/app/interfaces/rapyd/types';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { ListIssuedVcc } from 'src/app/interfaces/rapyd/ivcc';
import { ITemp, PaymentDetails_internal } from 'src/app/interfaces/interfaces';
import { IWallet2Wallet } from 'src/app/interfaces/db/idbwallet';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor(private storage: Storage, private api: Api, private alertController: AlertController, private toastController: ToastController) {
    this.init_service();
  }

  public user$: BehaviorSubject<IDBContact>;

  public meta$: BehaviorSubject<IDBMetaContact>;

  init_service() {
    this.user$ = new BehaviorSubject<IDBContact>({
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
    this.meta$ = new BehaviorSubject<IDBMetaContact>(null);
    this.reset_temp_value();
  }


  temp: ITemp = {} as any;
  reset_temp_value() {
    this.temp = {
      view_transaction: new BehaviorSubject<ITransaction>(null),
      wallet2wallet: new BehaviorSubject<IWallet2Wallet>({} as any),
      transaction: {}
    } as any;
    this.reset_temp_transactions();

  }
  reset_temp_transactions() {

    this.temp.transaction.source_amount = "0",
      this.temp.transaction.destination_amount = "0",
      this.temp.transaction.execute_payments = false,
      this.temp.transaction.execute_payouts = false,
      this.temp.transaction.executed = false,
      this.temp.transaction.type = null,
      this.temp.transaction.id = "tranid_" + this.makeid(5),
      this.temp.transaction.closed_payments_amount = 0,
      this.temp.transaction.closed_payouts_amount = 0,
      this.temp.transaction.description = "",
      this.temp.transaction.execution_date = new Date().getTime() / 1000,
      this.temp.transaction.status = "saved"

    // don't lose current subscribers
    if (!this.temp.transaction.payments) {
      this.temp.transaction.payments = new BehaviorSubject<PostCreatePayment.Request[]>([])
    }
    if (!this.temp.transaction.payouts) {
      this.temp.transaction.payouts = new BehaviorSubject<ICreatePayout.Request[]>([])
    }

    this.temp.destination_queries = {}
    console.log("Temp Transaction reset");
    console.log("this.temp");
    console.log(this.temp);


  }
  get meta() {
    return this.meta$.asObservable().pipe(filter(user => !!user))
  }

  async reset_storage() {
    await this.storage.set("user", null);
    await this.storage.set("meta", null);
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

  // save_temp() {
  //   console.log("Storage set temp 🏪>>");
  //   this.storage.set("temp", this.temp);
  // }

  // load_temp() {
  //   this.storage.get("temp").then(temp => {
  //     console.log("Storage load temp 🏪>>");
  //     this.temp = temp ? JSON.parse(temp) : this.temp
  //   });
  // }


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


  async toast(message = "okay", title = "", duration = 600000) {
    const toast = await this.toastController.create({
      header: title,
      message,
      position: 'bottom',
      duration,
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
    console.log("toast");
  }

  toastError(error: IAPIServerResponse<IUtilitiesResponse>) {
    console.log("toastError");

    console.error(error);

    if (!error.success) {
      if (typeof error.message === "string") {
        this.toast(error.message, "Error")
      } else {
        this.toast(error.message.body.status.message + "" + error.message.body.status.error_code, "Error")
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
      metacontact = metacontact ? metacontact : this.meta$.value
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

  // === get status
  action_status_type(full_payment: ITransactionFull_payment): PaymentDetails_internal {

    var payment_response:PostCreatePayment.Response = full_payment.response?.body?.data
    var payment_status_response:IRapydStatusResponse = full_payment.response?.body?.status
    var result: PaymentDetails_internal = {} as any

    console.log("=== action_status_type started ===> full_payment");
    console.log(full_payment);

    console.log("payment_response");
    console.log(payment_response);

    // If payment doesn't have server response and was not requested
    if (!payment_response) {
      result = {
        btn_active: false,
        btn_text: "Waiting",
        Status: "Not executed",
        message: "Payment was not executed, go back and click Do Payments to continue",
        instructions: "" as any,
        redirect_url: "",
        amount: full_payment?.request?.amount,
        error_message: "",
        response_code: "",
      }
      return result;
    }
    // status = response?.body?.data?.status as any;
    result.amount = payment_response.amount
    switch (payment_response.status) {
      // case "Confirmation":
      //   result = {
      //     btn_active: false,
      //     btn_text: "Confirmation",
      //     Status: "The payout is waiting for a confirmation of the FX rate",
      //     message: "you might need to click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
      //     instructions: payment_response.instructions,
      //     redirect_url: payment_response.redirect_url,
      //     amount: payment_response.amount,
      //     error_message: payment_status_response.message,
      //     response_code: payment_status_response.response_code,
      //   }
      //   break;
      case "ACT":
        result = {
          btn_active: true,
          btn_text: "Click to Confirm manually",
          Status: "Active and awaiting payment. Can be updated",
          message: "Click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CAN":
      // case "Canceled":
        result = {
          btn_active: false,
          btn_text: "Cancled",
          Status: "Cancled",
          message: "Canceled by the merchant or the customer's bank.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CLO":
      // case "Completed":
        result = {
          btn_active: false,
          btn_text: "Done",
          Status: "Done",
          message: "Closed and paid.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "ERR":
      // case "Error":
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "EXP":
      // case "Expired":
        result = {
          btn_active: false,
          btn_text: "Expired",
          Status: "Active and awaiting payment. Can be updated",
          message: "The payment has expired.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "REV":
        result = {
          btn_active: true,
          btn_text: "REV",
          Status: "New, refresh after a while",
          message: "Reversed by Rapyd. See cancel reason",
          cancel_reason: payment_response.cancel_reason,
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      default:
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
    }
    console.log("===action_status_type done ===> status");
    console.log(status);

    return result;
  }
}

