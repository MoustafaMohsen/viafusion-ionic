import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IDBMetaContact, ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { ListPayments, RequiredFields } from 'src/app/interfaces/rapyd/ipayment';
import { IWalletTransaction } from 'src/app/interfaces/rapyd/iwallet';
import { WalletTransactionTypes } from 'src/app/interfaces/rapyd/types';

/** Sample credentials shown to the visitor, nothing typed into the app is compared against anything else */
export const DEMO_PHONE = "+12025550143";
export const DEMO_PHONE_DISPLAY = "+1 202 555 0143";
export const DEMO_OTP = "123456";
export const DEMO_PIN = "654321";

export const DEMO_CONTACT_REFERENCE_ID = 10000001;
export const DEMO_EWALLET = "ewallet_demo000000000000000000000001";
export const DEMO_CONTACT_ID = "cont_demo000000000000000000000001";

/** limits of the simulated operations */
export const DEMO_MAX_TOP_UP = 10000;
export const DEMO_MAX_CARDS = 6;

/** Fictional user, the security object is added per response from the session state */
export function demo_contact(balance = 0): IDBContact {
  return {
    contact_reference_id: DEMO_CONTACT_REFERENCE_ID,
    contact: DEMO_CONTACT_ID,
    customer: "cus_demo000000000000000000000001",
    ewallet: DEMO_EWALLET,
    email: "sam.rivera@example.com",
    phone_number: DEMO_PHONE,
    rapyd_contact_data: demo_rapyd_contact() as any,
    rapyd_wallet_data: {
      id: DEMO_EWALLET,
      ewallet_reference_id: "demo-wallet-" + DEMO_CONTACT_REFERENCE_ID,
      type: "person",
      status: "ACT",
      verification_status: "verified",
      first_name: "Sam",
      last_name: "Rivera",
      email: "sam.rivera@example.com",
      phone_number: DEMO_PHONE,
      category: null,
      metadata: {},
      contacts: { data: [], has_more: false, total_count: 0, url: "" },
      accounts: [{
        id: "demo-account-usd",
        currency: "USD",
        alias: "USD",
        balance,
        received_balance: 0,
        on_hold_balance: 0,
        reserve_balance: 0,
        limits: null,
        limit: null,
      }],
    },
    meta: {},
  };
}

/** The identity details a card needs, all invented, so no onboarding form has to be filled in */
export function demo_rapyd_contact() {
  return {
    id: DEMO_CONTACT_ID,
    ewallet: DEMO_EWALLET,
    contact_type: "personal",
    first_name: "Sam",
    last_name: "Rivera",
    email: "sam.rivera@example.com",
    phone_number: DEMO_PHONE,
    country: "US",
    date_of_birth: "01/01/1990",
    verification_status: "verified",
    address: {
      name: "Sam Rivera",
      line_1: "100 Example Street",
      city: "Demoville",
      state: "NY",
      country: "US",
      zip: "00000",
    },
  };
}

/** Sample history, newest first. Amounts are derived by the app from the payments of each transaction */
export function demo_metacontact(now_seconds: number): IDBMetaContact {
  const day = 24 * 60 * 60;
  return {
    contact_reference_id: DEMO_CONTACT_REFERENCE_ID,
    transactions: [
      demo_transaction("tranid_demo4", "many2w", 1200.75, "Top up from Visa card", now_seconds - 1 * day, "us_visa_card", "card"),
      demo_transaction("tranid_demo3", "w2many", 220, "Rent share to Jordan Lee", now_seconds - 3 * day, "rapyd_ewallet", "rapyd_ewallet", "us_ach_bank"),
      demo_transaction("tranid_demo2", "many2many", 180, "Design invoice #1042", now_seconds - 6 * day, "us_mastercard_card", "card", "us_ach_bank"),
      demo_transaction("tranid_demo1", "many2w", 1500, "Freelance payment from Northwind Studio", now_seconds - 9 * day, "us_ach_bank", "bank_transfer"),
    ],
    senders: [],
    benes: [],
    vcc: [],
    actions: [],
    pcc: [],
    meta: {},
  };
}

/** The wallet ledger behind the sample history, newest first; its last balance is the seeded balance */
export function demo_wallet_transactions(now_seconds: number): IWalletTransaction[] {
  const day = 24 * 60 * 60;
  let balance = 0;
  const entry = (id: string, amount: number, type: WalletTransactionTypes, date: number, reason: string) => {
    balance = Math.round((balance + amount) * 100) / 100;
    return demo_wallet_transaction(id, amount, balance, type, date, reason);
  };
  return [
    entry("wt_demo1", 1500, "payment_funds_in", now_seconds - 9 * day, "Freelance payment from Northwind Studio"),
    entry("wt_demo2", 180, "payment_funds_in", now_seconds - 6 * day, "Design invoice #1042"),
    entry("wt_demo3", -180, "payout_funds_out", now_seconds - 6 * day, "Design invoice #1042"),
    entry("wt_demo4", -220, "payout_funds_out", now_seconds - 3 * day, "Rent share to Jordan Lee"),
    entry("wt_demo5", 1200.75, "payment_funds_in", now_seconds - 1 * day, "Top up from Visa card"),
  ].reverse();
}

export function demo_wallet_transaction(id: string, amount: number, balance: number, type: WalletTransactionTypes, date: number, reason: string): IWalletTransaction {
  return { id, amount, currency: "USD", ewallet_id: DEMO_EWALLET, type, balance_type: "available_balance", balance, created_at: date, status: "closed", reason };
}

/** Fictional ways to add money. None of them asks for payment details, only for the amount */
export function demo_payment_methods(country: string): ListPayments.Response[] {
  const method = (type: string, name: string, category: ListPayments.Response["category"], image: string): ListPayments.Response => ({
    type, name, category, image, country,
    payment_flow_type: category,
    currencies: ["USD"],
    status: 1,
    is_cancelable: false,
    payment_options: [],
    is_expirable: false,
    is_online: true,
    is_refundable: false,
    minimum_expiration_seconds: 0,
    maximum_expiration_seconds: 0,
    virtual_payment_method_type: category,
    is_virtual: true,
    multiple_overage_allowed: false,
    amount_range_per_currency: [{ currency: "USD", minimum_amount: 1, maximum_amount: DEMO_MAX_TOP_UP }],
    is_tokenizable: false,
  });
  return [
    method("demo_bank_transfer", "Demo bank transfer", "bank_transfer", "assets/svg/bank_transfer.svg"),
    method("demo_card", "Demo debit card", "card", "assets/images/mc-logo.svg"),
    method("demo_cash", "Demo cash deposit", "cash", "assets/svg/cash.svg"),
  ];
}

export function demo_required_fields(type: string): RequiredFields.Response {
  return { type, fields: [], payment_method_options: [], payment_options: [], minimum_expiration_seconds: 0, maximum_expiration_seconds: 0 };
}

/** A closed payment of `amount`, in the shape the app reads statuses and totals from */
export function demo_payment_response(id: string, amount: number, description: string, date: number) {
  return {
    statusCode: 200,
    headers: {},
    body: {
      status: { status: "SUCCESS", error_code: "", message: "", response_code: "", operation_id: "demo-" + id },
      data: { id: "payment_demo_" + id, amount, original_amount: amount, currency_code: "USD", status: "CLO", description, paid: true, paid_at: date, created_at: date },
    },
  };
}

export function demo_transaction(id: string, type: ITransaction["type"], amount: number, description: string, date: number, payment_method: string, category: string, payout_method?: string): ITransaction {
  return {
    id,
    type,
    description,
    source_amount: amount,
    destination_amount: payout_method ? amount : 0,
    payments: [{
      request: {
        amount,
        currency: "USD",
        description,
        category,
        payment_method: { type: payment_method },
        metadata: { name: description, category, image: "", executed: true },
        ewallets: [{ ewallet: DEMO_EWALLET }],
      },
      response: demo_payment_response(id, amount, description, date),
    }] as any,
    payouts: (payout_method ? [{
      request: {
        payout_amount: amount,
        payout_currency: "USD",
        payout_method_type: payout_method,
        description,
        ewallet: DEMO_EWALLET,
        metadata: { name: description, category: "bank", image: "" },
      },
    }] : []) as any,
    transfer_resoponse: {} as any,
    execute_payments: true,
    execute_payouts: !!payout_method,
    executed: true,
    payments_executed: true,
    payouts_executed: !!payout_method,
    closed_payments_amount: amount,
    closed_payouts_amount: 0,
    execution_date: date,
    status: "closed",
  };
}
