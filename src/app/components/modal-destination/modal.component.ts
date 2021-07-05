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
  @Input() amount: number;
  @Input() request_query: IGetPayoutRequiredFields.QueryRequest;

  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router
  ) { }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  continue() {
    console.log("this.form", this.form);
    console.log("this.request_query", this.request_query);
    this.request_query.payout_currency = this.form.value.currency
    this.request_query.payout_amount = this.form.value.AmountRangePerCurrency
    console.log("done this.request_query", this.request_query);

    // this.router.navigateByUrl("/transaction/destinations-sequence/destination?request_query=" + encodeURIComponent(this.request_query.payout_amount)+"&payment_method=" + encodeURIComponent(this.request_query.payout_method_type) + "&category=" + encodeURIComponent(payment_method.category) + "&image=" + encodeURIComponent(payment_method.image) + "&name=" + encodeURIComponent(payment_method.name))

  }
  ngOnInit() {
    console.log(this.request_query);

  }

}




