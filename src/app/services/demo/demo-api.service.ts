import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IDBMetaContact } from 'src/app/interfaces/db/idbmetacontact';
import { ILogin } from 'src/app/interfaces/db/ilogin';
import { IAPIServerResponse } from 'src/app/interfaces/rapyd/types';
import { demo_contact, demo_metacontact, DEMO_CONTACT_REFERENCE_ID, DEMO_OTP, DEMO_PIN } from './demo-data';

const STORAGE_KEY = "viafusion-demo:backend";
const STATE_VERSION = 1;

/** Everything the simulated backend remembers. Phone numbers, OTPs and PINs typed by the visitor are never stored */
interface IDemoState {
  version: number;
  session: {
    otp_passed: boolean;
    authenticated: boolean;
  };
  contact: IDBContact;
  meta: IDBMetaContact;
}

/**
 * Stands in for the API in demo mode: every request is answered here from simulated data,
 * in the same `{ success, data, message }` envelope the server uses, and nothing leaves the browser.
 */
@Injectable({
  providedIn: 'root'
})
export class DemoApi {
  private state: IDemoState;

  constructor(private toastController: ToastController) {
    this.state = this.load();
    this.save();
  }

  request<T = any>(method: string, endpoint: string, body?: any): Observable<IAPIServerResponse<T>> {
    let response: IAPIServerResponse<any>;
    try {
      response = this.route(method, endpoint.replace(/^\/+/, "").split("?")[0], body || {});
    } catch (error) {
      response = this.fail("Demo mode: '" + endpoint + "' failed (" + ((error && error.message) || error) + ")");
    }
    console.log("[demo api]", method, endpoint, response.success ? "ok" : response.message);
    return of(response).pipe(delay(250));
  }

  /** forget the session, the wallet and its history stay as they are */
  end_session() {
    this.state.session = { otp_passed: false, authenticated: false };
    this.save();
  }

  private route(method: string, endpoint: string, body: any): IAPIServerResponse<any> {
    switch (method + " " + endpoint) {
      case "POST login":
        // any phone number signs in as the fictional demo user, the number itself is ignored
        this.state.session = { otp_passed: false, authenticated: false };
        this.save();
        return this.ok({ contact_reference_id: DEMO_CONTACT_REFERENCE_ID, login: this.login() });

      case "POST confirm-otp":
        this.state.session = { otp_passed: body.otp + "" === DEMO_OTP, authenticated: false };
        this.save();
        return this.ok(this.contact());

      case "POST confirm-pin":
        if (!this.state.session.otp_passed) {
          return this.fail("Demo mode: confirm the demo code before entering the PIN.");
        }
        this.state.session.authenticated = body.pin + "" === DEMO_PIN;
        this.save();
        return this.ok(this.contact(this.state.session.authenticated));

      case "POST update-accounts":
        return this.authenticated(() => this.contact());

      case "POST get-db-metacontact":
        return this.authenticated(() => this.state.meta);

      case "POST update-db-metacontact":
        return this.authenticated(() => {
          if (!body || !Array.isArray(body.transactions)) {
            return null;
          }
          this.state.meta = { ...this.state.meta, ...this.clone(body), contact_reference_id: DEMO_CONTACT_REFERENCE_ID };
          this.save();
          return this.state.meta;
        });

      default:
        this.notify_not_simulated();
        return this.fail("Demo mode: '" + endpoint + "' is not simulated yet.");
    }
  }

  // ======== responses

  private notice_open = false;
  /** pages often ignore a failed response, so say why nothing happened (one notice at a time) */
  private async notify_not_simulated() {
    if (this.notice_open) {
      return;
    }
    this.notice_open = true;
    const toast = await this.toastController.create({
      message: "This part of the demo is not simulated yet.",
      position: 'bottom',
      duration: 3000,
    });
    await toast.present();
    await toast.onDidDismiss();
    this.notice_open = false;
  }

  private ok<T>(data: T): IAPIServerResponse<T> {
    return { performance: 0, success: true, data: this.clone(data) };
  }

  private fail(message: string): IAPIServerResponse<any> {
    return { performance: 0, success: false, message, data: {} };
  }

  private authenticated(handler: () => any): IAPIServerResponse<any> {
    if (!this.state.session.authenticated) {
      return this.fail("Demo mode: you are not logged in, please log in again.");
    }
    let data = handler();
    return data ? this.ok(data) : this.fail("Demo mode: the request could not be read.");
  }

  private contact(pin_passed = this.state.session.authenticated): IDBContact {
    return { ...this.state.contact, security: { login: this.login(pin_passed) } };
  }

  /** same shape the server sends, the secret values are never filled in */
  private login(pin_passed = this.state.session.authenticated): ILogin {
    let session = this.state.session;
    return {
      authenticated: session.authenticated,

      otp_passed: session.otp_passed,
      pin_passed,
      fp_passed: false,
      device_passed: false,

      has_otp: true,
      has_pin: true,
      has_fp: false,
      has_device: false,

      _otp_value: null,
      _pin_value: null,
      _fp_value: null,
      _device_value: null,

      user_registred: true,
      user_verified: true,

      resend_otp_after: 60,

      data: null,
      _sandbox: true,
    };
  }

  // ======== storage

  private load(): IDemoState {
    try {
      let state: IDemoState = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (state && state.version === STATE_VERSION && state.session && state.contact && state.meta && Array.isArray(state.meta.transactions)) {
        return state;
      }
    } catch (error) {
      console.warn("[demo api] stored demo data could not be read, starting from the seed", error);
    }
    return this.seed();
  }

  private seed(): IDemoState {
    return {
      version: STATE_VERSION,
      session: { otp_passed: false, authenticated: false },
      contact: demo_contact(),
      meta: demo_metacontact(Math.floor(Date.now() / 1000)),
    };
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn("[demo api] demo data could not be saved", error);
    }
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
