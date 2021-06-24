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
  amount?:number;
  status?:string;
  start_date?:Date;
}

export enum TDirection{
  up=1,
  down=-1,
  internal=0
}
export enum TStatus{
  success=1,
  failed=0,
  pending=-1,
}
