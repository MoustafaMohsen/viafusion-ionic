// ======== Transactions
export interface Transaction{
  id?:string;
  name?:string;
  description?:string;
  points?:TransactionPoint[];
  direction?:TDirection;
  amount?:number;
  status?:TStatus;
  start_date?:Date;
}

export interface TransactionPoint{
  id?:string;
  name?:string;
  type?:TPoint;
  amount?:number;
  status?:TStatus;
  start_date?:Date;
}

export enum TDirection{
  up=1,
  down=-1,
  internal=0
}

export enum TPoint{
  wallet=0,
  bank=1,
  pcard=2,
  cash=3,
  crypto=4,
  vcard=5,
  stock=6,
}


export enum TStatus{
  success=1,
  failed=0,
  pending=-1,
}


// ========== Sources

export interface ISource{
  id?:string;
  name?:string;
  description?:string;
  type?:TSourcePoint;
  amount?:number;
  status?:TStatus;
  start_date?:Date;
}

export enum TSourcePoint{
  wallet=0,
  bank=1,
  pcard=2,
  cash=3,
  crypto=4,
  vcard=5,
  stock=6,
}


// ==== int
export interface IAddSourceItem{
  id?:number,
  title?: string,
  description?: string ,
  type?: TSourcePoint,
  available_funds:number,
}
