import { IContact } from "../rapyd/icontact";
import { customer_id, ewallet_id, kycid_id } from "../rapyd/types";
import { IResponseCreateWallet } from "./idbwallet";
import { IDBSecurity } from "./isecurity";
/**
 *
contact_reference_id VARCHAR ( 255 ) PRIMARY KEY,
id VARCHAR ( 255 ),
phone_number VARCHAR ( 255 ),
email VARCHAR ( 255 ),
wallet_id VARCHAR ( 255 ),
wallet_refrence_id VARCHAR ( 255 ),
data TEXT

 */

export interface IDBContact {
  /** local contact id */
  contact_reference_id?: number;
  /** rapyd id */
  contact?: string;
  /** rapyd id */
  email?: string;
  /** rapyd id */
  ewallet?: ewallet_id;
  /** rapyd id */
  customer?: customer_id;
  /** rapyd id */
  kycid?: kycid_id;

  /** data stored in rapyd servers */
  rapyd_contact_data?: IContact;
  /** data stored in rapyd servers */
  rapyd_wallet_data?: IResponseCreateWallet.Root;

  phone_number?: string;
  security?: IDBSecurity;
  meta?: object;
}

export interface ICreateCustomer {
  business_vat_id: string
  email: string
  ewallet: string
  invoice_prefix: string
  metadata: any
  name: string
  phone_number: string
}

export interface ICreateCustomerResponse {
  id: string
  delinquent: boolean
  discount: any
  name: string
  default_payment_method: string
  description: string
  email: string
  phone_number: string
  invoice_prefix: string
  addresses: any[]
  payment_methods: any
  subscriptions: any
  created_at: number
  metadata: any
  business_vat_id: string
  ewallet: string
}
