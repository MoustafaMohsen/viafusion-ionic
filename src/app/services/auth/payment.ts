import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { RX } from '../rx/events.service';
import { Injectable } from '@angular/core';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Api } from '../api/api';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ListPayments, RequiredFields } from 'src/app/interfaces/rapyd/ipayment';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) {
  }

  list_payment_methods(country:string){
    return this.api.post<IUtilitiesResponse<ListPayments.Response[]>>("list-payment-methods",{country})
  }
  get_required_fields(payment_method_type:string){
    return this.api.post<IUtilitiesResponse<RequiredFields.Response>>("list-payment-required-fields",{payment_method_type})
  }
}
