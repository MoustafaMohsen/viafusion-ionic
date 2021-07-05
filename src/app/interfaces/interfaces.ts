import { BehaviorSubject } from 'rxjs';
import { ITransaction } from "./db/idbmetacontact";
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
  view_transaction?: ITransaction,
  vcc_details?: ListIssuedVcc.Response
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
