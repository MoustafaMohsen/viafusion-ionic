import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IDBMetaContact, ITransaction } from 'src/app/interfaces/db/idbmetacontact';

/** Sample credentials shown to the visitor, nothing typed into the app is compared against anything else */
export const DEMO_PHONE = "+12025550143";
export const DEMO_PHONE_DISPLAY = "+1 202 555 0143";
export const DEMO_OTP = "123456";
export const DEMO_PIN = "654321";

export const DEMO_CONTACT_REFERENCE_ID = 10000001;
const DEMO_EWALLET = "ewallet_demo000000000000000000000001";
const DEMO_BALANCE = 2480.75;

/** Fictional user, the security object is added per response from the session state */
export function demo_contact(): IDBContact {
  return {
    contact_reference_id: DEMO_CONTACT_REFERENCE_ID,
    contact: "cont_demo000000000000000000000001",
    customer: "cus_demo000000000000000000000001",
    ewallet: DEMO_EWALLET,
    email: "sam.rivera@example.com",
    phone_number: DEMO_PHONE,
    rapyd_contact_data: {
      id: "cont_demo000000000000000000000001",
      ewallet: DEMO_EWALLET,
      contact_type: "personal",
      first_name: "Sam",
      last_name: "Rivera",
      email: "sam.rivera@example.com",
      phone_number: DEMO_PHONE,
      country: "US",
      verification_status: "verified",
    } as any,
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
        balance: DEMO_BALANCE,
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

function demo_transaction(id: string, type: ITransaction["type"], amount: number, description: string, date: number, payment_method: string, category: string, payout_method?: string): ITransaction {
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
        ewallets: [{ ewallet: DEMO_EWALLET }],
      },
      response: {
        statusCode: 200,
        headers: {},
        body: {
          status: { status: "SUCCESS", error_code: "", message: "", response_code: "", operation_id: "demo-" + id },
          data: { id: "payment_demo_" + id, amount, original_amount: amount, currency_code: "USD", status: "CLO", description, paid: true, paid_at: date, created_at: date },
        },
      },
    }] as any,
    payouts: (payout_method ? [{
      request: {
        payout_amount: amount,
        payout_currency: "USD",
        payout_method_type: payout_method,
        description,
        ewallet: DEMO_EWALLET,
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
