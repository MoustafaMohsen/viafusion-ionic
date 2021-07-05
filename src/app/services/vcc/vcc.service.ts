import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ICreateVccToUser, ICreateVccToUser_Metadata, ISetCardStatus, IssueVccRequestForm, ListIssuedVcc, ListIssuedVccTransactions } from 'src/app/interfaces/rapyd/ivcc';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { Api } from '../api/api';
import { LoadingService } from '../loading.service';
import { RX } from '../rx/events.service';

@Injectable({
  providedIn: 'root'
})
export class VccService {

  constructor(private api: Api, private rx: RX, private router: Router, private loading: LoadingService) { }

  create_vcc(form: IssueVccRequestForm) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    return this.api.post<IDBContact>("create-vcc", {
      form, contact_reference_id
    })
  }

  get_vccs() {
    return this.api.post<ListIssuedVcc.Response[]>("list-vccs", {
      contact_reference_id: this.rx.user$.value.contact_reference_id
    })

  }

  get_vcc_transactions(card_id) {
    return this.api.post<IUtilitiesResponse<ListIssuedVccTransactions.Response[]>>("list-vcc-transactions", {
      card_id
    })
  }

  set_card_status(status_obj:ISetCardStatus) {
    return this.api.post<IUtilitiesResponse<ListIssuedVccTransactions.Response[]>>("set-card-status",status_obj)
  }

  create_vcc_to_user(metadata: ICreateVccToUser_Metadata) {
    let contact_reference_id = this.rx.user$.value.contact_reference_id;
    let request_obj:ICreateVccToUser = {
      contact_reference_id,
      metadata
    }
    return this.api.post<IDBContact>("create-vcc-to-user",request_obj)
  }


  card_status(card_details) {
    let str =
      card_details.status == "ACT" ? "Active." :
        card_details.status == "BLO" ? "Blocked." :
          card_details.status == "CAN" ? "Cancelled." :
            card_details.status == "IMP" ? "Imported in bulk, but not yet personalized." :
              card_details.status == "INA" ? "Inactive." : ""


    str + card_details.blocked_reason
    return str
  }
}
