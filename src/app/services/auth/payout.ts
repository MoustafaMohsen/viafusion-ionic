import { LoadingService } from '../loading.service';
import { Router } from '@angular/router';
import { RX } from '../rx/events.service';
import { Injectable } from '@angular/core';
import { ILogin, ILoginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Api } from '../api/api';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { ICreatePayout, IGetPayoutRequiredFields, IListPayout, ISimulateTransaction } from 'src/app/interfaces/rapyd/ipayout';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) {
  }

  list_payout_methods(country:string){
    return this.api.post<IUtilitiesResponse<IListPayout.Response[]>>("list-payout-methods",{country})
  }
  get_required_fields(obj:IGetPayoutRequiredFields.QueryRequest){
    return this.api.post<IUtilitiesResponse<IGetPayoutRequiredFields.Response>>("list-payout-required-fields",obj)
  }
  simulate_payout(create_payout_object: ICreatePayout.Request){
    return this.api.post<ISimulateTransaction>("simulate-payout",create_payout_object)
  }
}
