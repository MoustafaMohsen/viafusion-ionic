import { RX } from 'src/app/services/rx/events.service';
import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalDestinationComponent implements OnInit {

  @Input() currencies: string[];
  @Input() request_query: IGetPayoutRequiredFields.QueryRequest;

  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx:RX
  ) { }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  continue() {
    console.log("this.form", this.form);
    console.log("this.request_query", this.request_query);
    this.request_query.payout_currency = this.form.value.currency
    this.request_query.payout_amount = this.form.value.amount
    console.log("done this.request_query", this.request_query);

    let query_id = this.rx.makeid(5);
    this.rx.temp.destination_queries[query_id]=this.request_query


    this.router.navigateByUrl("/transaction/destinations-sequence/destination?query_id="+query_id)

  }
  ngOnInit() {
    console.log(this.request_query);

  }

}




