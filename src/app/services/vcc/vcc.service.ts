import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { IssueVccRequestForm } from 'src/app/interfaces/rapyd/ivcc';
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
}
