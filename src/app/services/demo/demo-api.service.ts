import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IDBMetaContact, ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { ILogin } from 'src/app/interfaces/db/ilogin';
import { ListIssuedVcc, ListIssuedVccTransactions } from 'src/app/interfaces/rapyd/ivcc';
import { IWalletTransaction } from 'src/app/interfaces/rapyd/iwallet';
import { IAPIServerResponse, WalletTransactionTypes } from 'src/app/interfaces/rapyd/types';
import {
  demo_contact, demo_metacontact, demo_payment_methods, demo_payment_response, demo_rapyd_contact, demo_required_fields, demo_transaction,
  demo_wallet_transaction, demo_wallet_transactions, DEMO_CONTACT_REFERENCE_ID, DEMO_MAX_CARDS, DEMO_MAX_TOP_UP, DEMO_OTP, DEMO_PIN
} from './demo-data';

const STORAGE_KEY = "viafusion-demo:backend";
const STATE_VERSION = 2;
const SEED_BALANCE = 2480.75;

/** Everything the simulated backend remembers. Phone numbers, OTPs and PINs typed by the visitor are never stored */
interface IDemoState {
  version: number;
  session: {
    otp_passed: boolean;
    authenticated: boolean;
  };
  /** the wallet balance lives in `rapyd_wallet_data.accounts` */
  contact: IDBContact;
  meta: IDBMetaContact;
  cards: ListIssuedVcc.Response[];
  /** newest first */
  card_transactions: ListIssuedVccTransactions.Response[];
  /** the wallet ledger, newest first: one entry per change of the balance */
  wallet_transactions: IWalletTransaction[];
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

  /** forget the session, the wallet, cards and history stay as they are */
  end_session() {
    this.state.session = { otp_passed: false, authenticated: false };
    this.save();
  }

  private route(method: string, endpoint: string, body: any): IAPIServerResponse<any> {
    switch (method + " " + endpoint) {
      // ======== session
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

      // ======== wallet
      case "POST update-accounts":
        return this.authenticated(() => this.ok(this.contact()));

      case "POST get-db-metacontact":
        return this.authenticated(() => this.ok(this.meta()));

      case "POST update-db-metacontact":
        return this.authenticated(() => this.update_meta(body));

      case "POST wallet-transactions":
        return this.authenticated(() => this.ok({ data: this.state.wallet_transactions }));

      // ======== top-up
      case "POST list-payment-methods":
        return this.authenticated(() => this.ok(this.rapyd(demo_payment_methods(body.country || "US"))));

      case "POST list-payment-required-fields":
        return this.authenticated(() => this.is_demo_payment_method(body.payment_method_type)
          ? this.ok(this.rapyd(demo_required_fields(body.payment_method_type)))
          : this.fail("Demo mode: '" + body.payment_method_type + "' is not a demo payment source."));

      case "POST execute-payments":
        return this.authenticated(() => this.execute_payments(body.tran_id));

      case "POST update-payments-payouts":
        return this.authenticated(() => this.find_transaction(body.tran_id)
          ? this.ok(this.meta())
          : this.fail("Demo mode: this transaction was not found."));

      // ======== virtual cards
      case "POST create-vcc-to-user":
        return this.authenticated(() => this.create_card(body.metadata));

      case "POST list-vccs":
        return this.authenticated(() => this.ok(this.state.cards));

      case "POST list-vcc-transactions":
        return this.authenticated(() => this.find_card(body.card_id)
          ? this.ok(this.rapyd(this.state.card_transactions.filter(t => t.card_id == body.card_id)))
          : this.fail("Demo mode: this card was not found."));

      case "POST set-card-status":
        return this.authenticated(() => this.set_card_status(body.card, body.status));

      case "POST simulate-card-authorization":
        return this.authenticated(() => this.card_purchase(body));

      default:
        this.notify_not_simulated();
        return this.fail("Demo mode: '" + endpoint + "' is not simulated yet.");
    }
  }

  // ======== wallet

  private get account() {
    return this.state.contact.rapyd_wallet_data.accounts[0];
  }

  /** the only place the balance changes: every change also leaves a ledger entry */
  private move_money(amount: number, type: WalletTransactionTypes, reason: string) {
    this.account.balance = this.money(this.account.balance + amount);
    this.state.wallet_transactions.unshift(demo_wallet_transaction("wt_" + this.id(10), amount, this.account.balance, type, this.now(), reason));
  }

  private meta(): IDBMetaContact {
    let transactions = [...this.state.meta.transactions].sort((a, b) => (b.execution_date || 0) - (a.execution_date || 0));
    return { ...this.state.meta, transactions, vcc: this.state.cards as any };
  }

  /**
   * The app sends its whole copy back after every change. Transactions that were already executed here are settled,
   * so the stored version wins over whatever the app holds; everything else follows the app.
   */
  private update_meta(body: IDBMetaContact) {
    if (!body || !Array.isArray(body.transactions)) {
      return this.fail("Demo mode: the request could not be read.");
    }
    let stored = this.state.meta.transactions;
    let incoming: ITransaction[] = this.clone(body.transactions).filter(t => t && t.id);
    let merged = incoming.map(t => stored.find(s => s.id == t.id && s.payments_executed) || this.sanitize_transaction(t));
    stored.filter(s => s.payments_executed && !merged.some(t => t.id == s.id)).forEach(s => merged.push(s));
    this.state.meta.transactions = merged;
    this.save();
    return this.ok(this.meta());
  }

  /** a transaction the app is still building: nothing typed as payment details is kept, and it cannot arrive already paid */
  private sanitize_transaction(tran: ITransaction): ITransaction {
    (tran.payments || []).forEach((p: any) => {
      if (p.request) {
        if (p.request.payment_method) {
          p.request.payment_method = { type: p.request.payment_method.type };
        }
        delete p.request.address;
        delete p.request.customer;
      }
      delete p.response;
    });
    tran.payments_executed = false;
    tran.executed = false;
    tran.closed_payments_amount = 0;
    return tran;
  }

  // ======== top-up

  private is_demo_payment_method(type: string) {
    return demo_payment_methods("US").some(m => m.type == type);
  }

  private find_transaction(tran_id: string) {
    return this.state.meta.transactions.find(t => t.id == tran_id);
  }

  private execute_payments(tran_id: string) {
    let tran = this.find_transaction(tran_id);
    if (!tran) {
      return this.fail("Demo mode: this transaction was not found.");
    }
    if (tran.payments_executed) {
      return this.fail("This top-up was already completed. Your balance was not changed again.");
    }
    if (tran.type != "many2w") {
      return this.fail("Demo mode: only wallet top-ups are simulated, transfers to other destinations are not.");
    }
    let payments = tran.payments || [];
    // a refused top-up stays in the history as failed, it never touches the balance
    let decline = (message: string) => {
      tran.status = "canceled";
      tran.description = tran.description || "Top-up declined";
      this.save();
      return this.fail(message);
    };
    if (!payments.length) {
      return decline("Add at least one source before confirming.");
    }
    for (let p of payments) {
      let amount = p.request && p.request.amount;
      if (typeof amount != "number" || !isFinite(amount) || amount <= 0) {
        return decline("Enter an amount greater than zero for every source.");
      }
      if (!this.is_demo_payment_method(p.request.payment_method && p.request.payment_method.type)) {
        return decline("Demo mode: only the demo payment sources can be used.");
      }
    }
    let total = this.money(payments.reduce((sum, p) => sum + p.request.amount, 0));
    if (total > DEMO_MAX_TOP_UP) {
      return decline("Demo top-ups are limited to $" + DEMO_MAX_TOP_UP.toLocaleString("en-US") + " at a time.");
    }

    let now = this.now();
    let sources = payments.map(p => (p.request.metadata && p.request.metadata.name) || p.request.payment_method.type).join(", ");
    tran.description = (tran.description && tran.description != "Top-up declined") ? tran.description : "Wallet top-up via " + sources;
    payments.forEach((p, i) => {
      p.request.metadata = { ...p.request.metadata, executed: true };
      p.response = demo_payment_response(tran.id + "_" + i, p.request.amount, tran.description, now) as any;
    });
    tran.execute_payments = true;
    tran.payments_executed = true;
    tran.executed = true;
    tran.status = "closed";
    tran.source_amount = total;
    tran.closed_payments_amount = total;
    tran.execution_date = now;
    this.move_money(total, "payment_funds_in", tran.description);
    this.save();
    return this.ok(this.meta());
  }

  // ======== virtual cards

  private find_card(card: string) {
    return this.state.cards.find(c => c.card_id == card || c.card_number == card || c.id == card);
  }

  private create_card(metadata: { name?: string }) {
    let name = ((metadata && metadata.name) || "").toString().trim();
    if (!name) {
      return this.fail("Give the card a name first.");
    }
    if (name.length > 30) {
      return this.fail("Card names can be up to 30 characters.");
    }
    if (this.state.cards.length >= DEMO_MAX_CARDS) {
      return this.fail("The demo is limited to " + DEMO_MAX_CARDS + " virtual cards.");
    }
    let now = this.now();
    let expires = new Date();
    let card_id = "card_demo_" + this.id(12);
    // a made-up number in a block no bank issues from, never a real card
    let digits = "55550100" + this.digits(8);
    let card: ListIssuedVcc.Response = {
      id: "ci_demo_" + this.id(12),
      card_id,
      ewallet_contact: demo_rapyd_contact() as any,
      status: "ACT",
      assigned_at: now,
      activated_at: now,
      created_at: now,
      metadata: { name },
      country_iso_alpha_2: "US",
      blocked_reason: "",
      card_program: "cardprog_demo",
      card_number: digits.replace(/(\d{4})(?=\d)/g, "$1 "),
      cvv: this.digits(3),
      expiration_month: ("0" + (expires.getMonth() + 1)).slice(-2),
      expiration_year: ((expires.getFullYear() + 3) + "").slice(-2),
      bin: digits.slice(0, 6),
      sub_bin: digits.slice(6, 8),
    };
    this.state.cards.unshift(card);
    this.save();
    return this.ok(this.contact());
  }

  private set_card_status(card_ref: string, status: string) {
    let card = this.find_card(card_ref);
    if (!card) {
      return this.fail("Demo mode: this card was not found.");
    }
    if (status == "block") {
      card.status = "BLO";
      card.blocked_reason = "";
    } else if (status == "unblock" || status == "active") {
      card.status = "ACT";
      card.blocked_reason = "";
    } else {
      return this.fail("Demo mode: card status '" + status + "' is not supported.");
    }
    this.save();
    return this.ok(this.rapyd(card));
  }

  /** a purchase with the card is paid from the wallet balance */
  private card_purchase(body: { card_id?: string, amount?: any, currency?: string, merchant_name_location?: string }) {
    let card = this.find_card(body.card_id);
    if (!card) {
      return this.fail("Demo mode: this card was not found.");
    }
    let amount = this.money(Number(body.amount));
    if (!isFinite(amount) || amount <= 0) {
      return this.fail("Enter an amount greater than zero.");
    }
    if ((body.currency || "USD") != "USD") {
      return this.fail("Demo mode: only USD is simulated.");
    }
    if (card.status != "ACT") {
      return this.fail("This card is frozen. Activate it again before using it.");
    }
    if (amount > this.account.balance) {
      return this.fail("Not enough balance in your wallet for this purchase.");
    }
    let now = this.now();
    let merchant = (body.merchant_name_location || "Demo merchant").toString().slice(0, 60);
    let description = "Card payment at " + merchant + " (" + ((card.metadata && card.metadata.name) || "card") + ")";
    let tran_id = "tranid_card" + this.id(8);
    let card_transaction: ListIssuedVccTransactions.Response = {
      id: "cit_demo_" + this.id(12),
      amount,
      currency: "USD",
      // the card history shows this value as a date as it is, so it is kept in milliseconds
      created_at: now * 1000,
      card_id: card.card_id,
      merchant_category_code: "5999",
      merchant_name_location: merchant,
      auth_code: this.digits(6),
      bin: card.bin,
      last4: card.card_number.replace(/\s/g, "").slice(-4),
      issuing_txn_type: "SALE",
      pos_entry_mode: "ecommerce",
      systems_trace_audit_number: this.digits(6),
      retrieval_reference_number: this.digits(12),
      original_transaction_id: "",
      original_txn_amount: null,
      original_txn_currency: "",
      fx_rate: null,
      card_program: "cardprog_demo",
      wallet_transaction_id: tran_id,
      authorization_approved_by: "demo",
      card_authorization: "cardauth_demo_" + this.id(8),
    };
    this.state.card_transactions.unshift(card_transaction);
    this.state.meta.transactions.push(demo_transaction(tran_id, "w2many", amount, description, now, "rapyd_ewallet", "rapyd_ewallet"));
    this.move_money(-amount, "card_issuing_out", description);
    this.save();
    return this.ok(this.rapyd(card_transaction));
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

  /** the wrapper the server puts around data it relays from the payment provider */
  private rapyd<T>(data: T) {
    return {
      statusCode: 200,
      headers: {},
      body: { status: { status: "SUCCESS", error_code: "", message: "", response_code: "", operation_id: "demo-" + this.id(8) }, data },
    };
  }

  private authenticated(handler: () => IAPIServerResponse<any>): IAPIServerResponse<any> {
    if (!this.state.session.authenticated) {
      return this.fail("Demo mode: you are not logged in, please log in again.");
    }
    return handler();
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

  // ======== helpers

  private now() {
    return Math.floor(Date.now() / 1000);
  }

  private money(value: number) {
    return Math.round(value * 100) / 100;
  }

  private id(length: number) {
    let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private digits(length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  // ======== storage

  private load(): IDemoState {
    try {
      let state: IDemoState = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (state && state.session && state.contact && state.meta && Array.isArray(state.meta.transactions)) {
        if (state.version === 1) {
          state = this.upgrade_from_1(state);
        }
        if (state.version === STATE_VERSION && Array.isArray(state.cards) && Array.isArray(state.card_transactions) && Array.isArray(state.wallet_transactions)) {
          return state;
        }
      }
    } catch (error) {
      console.warn("[demo api] stored demo data could not be read, starting from the seed", error);
    }
    return this.seed();
  }

  /** version 1 had no cards and no ledger, and nothing could change its balance or history yet */
  private upgrade_from_1(old: IDemoState): IDemoState {
    let seed = this.seed();
    return { ...seed, session: old.session };
  }

  private seed(): IDemoState {
    let now = this.now();
    return {
      version: STATE_VERSION,
      session: { otp_passed: false, authenticated: false },
      contact: demo_contact(SEED_BALANCE),
      meta: demo_metacontact(now),
      cards: [],
      card_transactions: [],
      wallet_transactions: demo_wallet_transactions(now),
    };
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn("[demo api] demo data could not be saved", error);
    }
  }
}
