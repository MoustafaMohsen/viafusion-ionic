import { ICreateChckoutPage, IdentityVerification } from 'src/app/interfaces/rapyd/iwallet';
import { BehaviorSubject } from 'rxjs';
import { ITransaction } from "./db/idbmetacontact";
import { IWallet2Wallet } from './db/idbwallet';
import { PostCreatePayment } from './rapyd/ipayment';
import { ICreatePayout, IGetPayoutRequiredFields } from "./rapyd/ipayout";
import { ListIssuedVcc } from "./rapyd/ivcc";
import { TransferToWallet } from './rapyd/iwallet';
import { categories } from './rapyd/types';

// ======== Transactions
export interface Transaction {
  id?: string;
  name?: string;
  description?: string;
  points?: TransactionPoint[];
  direction?: TDirection;
  amount?: number;
  status?: TStatus;
  start_date?: Date;
}

export interface TransactionPoint {
  id?: string;
  name?: string;
  type?: TPoint;
  amount?: number;
  status?: TStatus;
  start_date?: Date;
}

export enum TDirection {
  up = 1,
  down = -1,
  internal = 0
}

export enum TPoint {
  wallet = 0,
  bank = 1,
  pcard = 2,
  cash = 3,
  crypto = 4,
  vcard = 5,
  stock = 6,
}


export enum TStatus {
  success = 1,
  failed = 0,
  pending = -1,
}


// ========== Sources

export interface ISource {
  id?: string;
  name?: string;
  description?: string;
  type?: TSourcePoint;
  amount?: number;
  status?: TStatus;
  start_date?: Date;
  metadata?: any;
}

export enum TSourcePoint {
  wallet = 0,
  bank = 1,
  pcard = 2,
  cash = 3,
  crypto = 4,
  vcard = 5,
  stock = 6,
}


// ==== int
export interface IAddSourceItem {
  id?: number,
  title?: string,
  description?: string,
  type?: TSourcePoint,
  available_funds: number,
}


export interface ICountry {
  name: string;
  alpha2Code: string;
  flag: string;
}


export interface ITemp {
  transaction: IRXTransaction;
  destination_queries: {
    [key: string]: {
      request_query: IGetPayoutRequiredFields.QueryRequest
      response_query: IGetPayoutRequiredFields.Response
    }
  },
  view_transaction: BehaviorSubject<ITransaction>,
  vcc_details?: ListIssuedVcc.Response,
  wallet2wallet:BehaviorSubject<IWallet2Wallet>,
  checkouts:ICreateChckoutPage.Response[]
  idv:IdentityVerification.Response
}


export interface IRXTransaction {
  id: string;
  source_amount?: string;
  destination_amount?: string;
  payments: BehaviorSubject<PostCreatePayment.Request[]>;
  payouts: BehaviorSubject<ICreatePayout.Request[]>;

  transfer_resoponse?: TransferToWallet.Response;

  payments_executed?: boolean;
  payouts_executed?: boolean;

  execute_payments: boolean;
  execute_payouts: boolean;

  executed: boolean;

  closed_payments_amount:number;
  closed_payouts_amount:number;

  execution_date:number;

  description:string;

  status:"closed" | "requires_action" | "canceled" | "saved" | "created"

  type: "many2many" | "w2w"| "many2w" | "w2many" | `${categories}2${categories}`

}

export interface ActionStatusesTypes {
  btn_active: boolean;
  btn: string;
  message: string;
}


export interface PaymentPayoutDetails_internal{
  btn_active: boolean;
  btn_text: string;
  Status: string;
  message: string;
  instructions?: any;
  redirect_url: string;
  amount: number;
  error_message: string;
  category?: string;
  response_code: string;
  cancel_reason?: string;
}


export interface RquiredFormTypes{
  type:"text" | "number" | "date" | "checkbox" | "options" | "disabled";
  label:string;
  name:string;
  description:string;
  disabled_value:string;
  options:{
    value:string
    name:string
  }[]
  is_options:boolean
}
