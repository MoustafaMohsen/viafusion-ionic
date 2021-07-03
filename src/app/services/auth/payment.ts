import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { RX } from '../rx/events.service';
import { Injectable } from '@angular/core';
import { ILogin, ILOginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Api } from '../api/api';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ListPayments } from 'src/app/interfaces/rapyd/ipayment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) {
  }

  list_payment_methods(country:string){
    return this.api.get<ListPayments.Response[]>("list-payment-methods")
  }
}
