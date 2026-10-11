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
import { from_usd, is_money, round_money, sum_money, to_cents, to_usd } from '../util/money';
import {
  demo_contact, demo_metacontact, demo_payment_methods, demo_payment_response, demo_payout_methods, demo_payout_required_fields, demo_payout_response,
  demo_rapyd_contact, demo_required_fields, demo_transaction, demo_wallet_transaction, demo_wallet_transactions,
  DEMO_CONTACT_REFERENCE_ID, DEMO_EWALLET, DEMO_MAX_CARDS, DEMO_MAX_TOP_UP, DEMO_OTP, DEMO_PIN, DEMO_RATES, DEMO_RECIPIENTS
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

  is_authenticated() {
    return !!this.state.session.authenticated;
  }

  /** back to the seeded wallet, cards and history, logged out. Removes only this demo's own storage keys */
  reset() {
    try {
      Object.keys(localStorage).filter(key => key.indexOf("viafusion-demo") == 0).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn("[demo api] demo data could not be cleared", error);
    }
    this.state = this.seed();
    this.save();
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

      // ======== sending money
      case "POST list-payout-methods":
        return this.authenticated(() => this.ok(this.rapyd(demo_payout_methods(body.country || "US"))));

      case "POST list-payout-required-fields":
        return this.authenticated(() => this.is_demo_payout_method(body.payout_method_type)
          ? this.ok(this.rapyd(demo_payout_required_fields(body)))
          : this.fail("Demo mode: '" + body.payout_method_type + "' is not a demo destination."));

      case "POST get-rates":
        return this.authenticated(() => this.rate(body.buy_currency));

      case "POST simulate-payout":
        return this.authenticated(() => this.ok(this.payout_dry_run(body)));

      case "POST execute-payouts":
        return this.authenticated(() => this.execute_payouts(body.tran_id));

      // ======== wallet to wallet
      case "POST get-like-db-user":
        return this.authenticated(() => this.ok({ users: this.lookup_recipients(body.phone_number) }));

      case "POST w2w":
        return this.authenticated(() => this.wallet_to_wallet(body));

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
    let settled = (s: ITransaction) => s.payments_executed || s.payouts_executed || s.executed;
    let merged = incoming.map(t => stored.find(s => s.id == t.id && settled(s)) || this.sanitize_transaction(t));
    stored.filter(s => settled(s) && !merged.some(t => t.id == s.id)).forEach(s => merged.push(s));
    this.state.meta.transactions = merged;
    this.save();
    return this.ok(this.meta());
  }

  /** a transaction the app is still building: nothing typed as payment or recipient details is kept, and it cannot arrive already paid */
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
    (tran.payouts || []).forEach((p: any) => {
      if (p.request) {
        p.request.beneficiary = {};
        p.request.sender = {};
      }
      delete p.response;
    });
    tran.payments_executed = false;
    tran.payouts_executed = false;
    tran.executed = false;
    tran.closed_payments_amount = 0;
    tran.closed_payouts_amount = 0;
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
      return this.fail("These payments were already completed. Your balance was not changed again.");
    }
    if (tran.type != "many2w" && tran.type != "many2many") {
      return this.fail("Demo mode: this kind of transaction has no payments to run.");
    }
    let top_up = tran.type == "many2w";
    let payments = tran.payments || [];
    // a refused top-up stays in the history as failed, it never touches the balance
    let decline = (message: string) => {
      tran.status = "canceled";
      this.describe(tran, top_up ? "Top-up declined" : "Transfer declined");
      this.save();
      return this.fail(message);
    };
    if (!payments.length) {
      return decline("Add at least one source before confirming.");
    }
    for (let p of payments) {
      if (!is_money(p.request && p.request.amount)) {
        return decline("Enter an amount greater than zero, with at most two decimals, for every source.");
      }
      if (!this.is_demo_payment_method(p.request.payment_method && p.request.payment_method.type)) {
        return decline("Demo mode: only the demo payment sources can be used.");
      }
    }
    let total = sum_money(payments.map(p => p.request.amount));
    if (total > DEMO_MAX_TOP_UP) {
      return decline("Demo top-ups are limited to $" + DEMO_MAX_TOP_UP.toLocaleString("en-US") + " at a time.");
    }

    let now = this.now();
    let sources = payments.map(p => (p.request.metadata && p.request.metadata.name) || p.request.payment_method.type).join(", ");
    // a transfer with destinations is not finished by collecting its payments: the payouts still have to run
    let payouts_pending = !top_up && (tran.payouts || []).length > 0;
    this.describe(tran, (top_up ? "Wallet top-up via " : "Transfer funded by ") + sources + (payouts_pending ? " (payouts pending)" : ""));
    payments.forEach((p, i) => {
      p.request.metadata = { ...p.request.metadata, executed: true };
      p.response = demo_payment_response(tran.id + "_" + i, p.request.amount, tran.description, now) as any;
    });
    tran.execute_payments = true;
    tran.payments_executed = true;
    tran.executed = !payouts_pending;
    tran.status = payouts_pending ? "requires_action" : "closed";
    tran.source_amount = total;
    tran.closed_payments_amount = total;
    tran.execution_date = now;
    this.move_money(total, "payment_funds_in", (top_up ? "Wallet top-up via " : "Transfer funded by ") + sources);
    this.save();
    return this.ok(this.meta());
  }

  /** fills in a description unless the visitor wrote one; a later step may refine what an earlier step wrote */
  private describe(tran: ITransaction, text: string) {
    if (!tran.description || (tran as any).demo_auto_description) {
      tran.description = text;
      (tran as any).demo_auto_description = true;
    }
  }

  // ======== sending money

  private is_demo_payout_method(type: string) {
    return demo_payout_methods("US").some(m => m.payout_method_type == type);
  }

  /** fixed demo rate: units of `currency` per 1 USD */
  private rate(currency: string) {
    let rate = DEMO_RATES[currency];
    if (!rate) {
      return this.fail("Demo mode: there is no simulated exchange rate for " + currency + ".");
    }
    return this.ok({ sell_currency: "USD", buy_currency: currency, action_type: "payout", fixed_side: null, rate, date: "simulated", sell_amount: null, buy_amount: null });
  }

  /** why a payout cannot be made, or nothing when it can */
  private payout_problem(request: any): string {
    if (!is_money(request && request.payout_amount)) {
      return "Enter an amount greater than zero, with at most two decimals, for every destination.";
    }
    if (!this.is_demo_payout_method(request.payout_method_type)) {
      return "Demo mode: only the demo destinations can be used.";
    }
    if (!DEMO_RATES[request.payout_currency]) {
      return "Demo mode: there is no simulated exchange rate for " + request.payout_currency + ".";
    }
    // the amount in the destination currency, when the app sent it, must cost exactly the USD amount at the demo rate
    let entered = request.metadata && request.metadata.payout_currency_amount;
    if (entered !== undefined && entered !== null && (!is_money(entered) || to_cents(to_usd(entered, DEMO_RATES[request.payout_currency])) != to_cents(request.payout_amount))) {
      return "The amount does not match the simulated exchange rate. Enter the destination again.";
    }
    return "";
  }

  /** what the recipient gets, in the destination currency: the amount that was entered, or the USD amount converted */
  private paid_amount(request: any): number {
    let rate = DEMO_RATES[request.payout_currency];
    let entered = request.metadata && request.metadata.payout_currency_amount;
    return is_money(entered) ? round_money(entered) : from_usd(request.payout_amount, rate);
  }

  /** the "Simulate Payout" button: checks one destination without moving anything */
  private payout_dry_run(request: any) {
    let problem = this.payout_problem(request);
    return problem
      ? { success: false, message: problem, error_code: "DEMO_INVALID_PAYOUT" }
      : { success: true, message: "This destination would be accepted. Nothing was sent, this is a simulation.", error_code: "" };
  }

  /**
   * Pays the destinations of a transfer out of the wallet. A transfer funded by sources ("many2many") must have run
   * its payments first, so the wallet only ever pays out what those sources brought in; a transfer from the wallet
   * ("w2many") is paid from the balance.
   */
  private execute_payouts(tran_id: string) {
    let tran = this.find_transaction(tran_id);
    if (!tran) {
      return this.fail("Demo mode: this transaction was not found.");
    }
    if (tran.payouts_executed) {
      return this.fail("This transfer was already completed. Your balance was not changed again.");
    }
    if (tran.type != "many2many" && tran.type != "w2many") {
      return this.fail("Demo mode: this kind of transaction has no payouts to run.");
    }
    let funded_by_sources = tran.type == "many2many";
    if (funded_by_sources && !tran.payments_executed) {
      return this.fail("Run the payments first: the destinations are paid from the money your sources bring in.");
    }
    let payouts = tran.payouts || [];
    // a refused wallet transfer stays in the history as failed, it never touches the balance
    let decline = (message: string) => {
      if (!funded_by_sources) {
        tran.status = "canceled";
        this.describe(tran, "Transfer declined");
        this.save();
      }
      return this.fail(message);
    };
    if (!payouts.length) {
      return decline("Add at least one destination before confirming.");
    }
    for (let p of payouts) {
      let problem = this.payout_problem(p.request);
      if (problem) {
        return decline(problem);
      }
    }
    let total = sum_money(payouts.map(p => p.request.payout_amount));
    if (funded_by_sources) {
      let funded = sum_money((tran.payments || []).map(p => p.request.amount));
      if (to_cents(total) > to_cents(funded)) {
        return this.fail("The destinations add up to more than the sources ($" + total + " of $" + funded + ").");
      }
    }
    if (to_cents(total) > to_cents(this.account.balance)) {
      return decline("Not enough balance in your wallet for this transfer.");
    }

    let now = this.now();
    let names = payouts.map(p => (p.request.metadata && p.request.metadata.name) || p.request.payout_method_type).join(", ");
    this.describe(tran, (funded_by_sources ? "Transfer to " : "Wallet transfer to ") + names);
    payouts.forEach((p, i) => {
      let currency = p.request.payout_currency, rate = DEMO_RATES[currency], amount = p.request.payout_amount;
      p.request.metadata = { ...p.request.metadata, executed: true };
      let paid = this.paid_amount(p.request);
      p.response = demo_payout_response(tran.id + "_" + i, amount, currency, rate, now, paid) as any;
      let name = (p.request.metadata && p.request.metadata.name) || p.request.payout_method_type;
      this.move_money(-amount, "payout_funds_out", name + (currency == "USD" ? "" : " (" + paid + " " + currency + " at the simulated rate " + rate + ")"));
    });
    tran.execute_payouts = true;
    tran.payouts_executed = true;
    tran.executed = true;
    tran.status = "closed";
    if (!funded_by_sources) {
      tran.source_amount = total;
    }
    tran.destination_amount = total;
    tran.closed_payouts_amount = total;
    tran.execution_date = now;
    this.save();
    return this.ok(this.meta());
  }

  // ======== wallet to wallet

  /** the demo recipients whose number contains the typed digits */
  private lookup_recipients(query: any): string[] {
    let digits = ((query === null || query === undefined) ? "" : query + "").replace(/\D/g, "");
    if (!digits) {
      return [];
    }
    return DEMO_RECIPIENTS.filter(r => r.phone.replace(/\D/g, "").indexOf(digits) != -1).map(r => r.phone);
  }

  private wallet_to_wallet(body: { phone_number?: string, amount?: any, message?: string, transfer_id?: string }) {
    let recipient = DEMO_RECIPIENTS.find(r => r.phone == body.phone_number + "");
    if (!recipient) {
      return this.fail("This number is not one of the demo recipients.");
    }
    if (!is_money(body.amount)) {
      return this.fail("Enter an amount greater than zero, with at most two decimals.");
    }
    let amount = round_money(body.amount);
    // one transfer per confirmation: the app sends the same id again when a confirmation is repeated
    let tran_id = "tranid_w2w" + ((body.transfer_id || this.id(10)) + "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
    if (this.find_transaction(tran_id)) {
      return this.fail("This transfer was already sent. Your balance was not changed again.");
    }
    if (to_cents(amount) > to_cents(this.account.balance)) {
      return this.fail("Not enough balance in your wallet for this transfer.");
    }
    let now = this.now();
    let message = (body.message || "").toString().trim().slice(0, 80);
    let description = "To " + recipient.name + " (" + recipient.phone + ")" + (message ? ": " + message : "");
    let tran: ITransaction = {
      id: tran_id,
      type: "w2w",
      description,
      source_amount: amount,
      destination_amount: amount,
      payments: [],
      payouts: [],
      transfer_resoponse: {
        id: "transfer_demo_" + this.id(10), status: "CLO", amount, currency_code: "USD", destination_phone_number: recipient.phone,
        destination_ewallet_id: "ewallet_demo_recipient", source_ewallet_id: DEMO_EWALLET, created_at: now,
      } as any,
      execute_payments: false,
      execute_payouts: false,
      executed: true,
      closed_payments_amount: 0,
      closed_payouts_amount: 0,
      execution_date: now,
      status: "closed",
    };
    this.state.meta.transactions.push(tran);
    this.move_money(-amount, "p2p_transfer", description);
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
    if (!is_money(body.amount)) {
      return this.fail("Enter an amount greater than zero, with at most two decimals.");
    }
    let amount = round_money(body.amount);
    if ((body.currency || "USD") != "USD") {
      return this.fail("Demo mode: only USD is simulated.");
    }
    if (card.status != "ACT") {
      return this.fail("This card is frozen. Activate it again before using it.");
    }
    if (to_cents(amount) > to_cents(this.account.balance)) {
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
    return round_money(value);
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
