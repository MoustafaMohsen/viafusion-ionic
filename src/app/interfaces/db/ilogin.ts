export interface ILogin<T=any>{
    authenticated:boolean;
    otp_passed?:boolean;
    pin_passed?:boolean;
    pf_passed?:boolean;
    user_exsits:boolean;
    data?:T
    resend_otp_after:number;
    _otp_value?:number;
}

export interface ILOginTransportObj<T>{
  contact_refrence_id:number;
  login:ILogin<T>
}
