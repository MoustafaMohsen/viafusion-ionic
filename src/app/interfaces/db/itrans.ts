import { customert_id } from '../rapyd/types';
import { ewallet_id } from "../rapyd/types";
import { IPayment } from '../rapyd/ipayment';
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

export interface IDBMetaContact {
  /** Internal id for calling actions */
  id?: string;
  contact_reference_id?: ewallet_id;
  wallet_refrence_id?: string;
  customer?: customert_id;
  meta?: object;
  transactions?: ITransaction[];
}

export interface ITransaction{
  id:string
  amout:string
  sources:IPayment[]
  destinations:any[]
  executed:boolean
}
