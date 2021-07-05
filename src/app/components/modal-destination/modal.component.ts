import { RX } from 'src/app/services/rx/events.service';
import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
import { PayoutService } from 'src/app/services/auth/payout';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalDestinationComponent implements OnInit {

  @Input() currencies: string[];
  @Input() remaing_ballance ;
  @Input() request_query: IGetPayoutRequiredFields.QueryRequest;

  ionViewWillEnter() {
    this.remaing_ballance = (this.rx.temp["transaction"].source_amount as any) - (this.rx.temp["transaction"].destination_amount as any)
  }
  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx:RX, private payoutSrv: PayoutService, private loading: LoadingService
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

    var query_id = this.rx.makeid(5);


    this.payoutSrv.get_required_fields(this.request_query).subscribe(res => {
      console.log("get_required_fields");
      console.log(res);
      var response_query = res.data.body.data
      this.rx.temp.destination_queries[query_id] || (this.rx.temp.destination_queries[query_id] = {} as any)

      this.rx.temp.destination_queries[query_id].response_query = response_query

      this.rx.temp.destination_queries[query_id].request_query = this.request_query

      console.log(this.rx.temp.destination_queries[query_id]);


      this.router.navigateByUrl("/transaction/destinations-sequence/destination?query_id="+query_id)
      this.close();

    })

  }
  ngOnInit() {
    console.log(this.request_query);

  }

}




