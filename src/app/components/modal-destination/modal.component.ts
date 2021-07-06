import { WalletService } from 'src/app/services/wallet/wallet.service';
import { RX } from 'src/app/services/rx/events.service';
import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
import { PayoutService } from 'src/app/services/auth/payout';
import { ICurrency } from 'src/app/interfaces/rapyd/iwallet';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalDestinationComponent implements OnInit {

  @Input() currencies: string[];
  @Input() remaing_ballance;
  @Input() request_query: IGetPayoutRequiredFields.QueryRequest;

  selected_buy_currency: string;
  amount = 0;
  ionViewWillEnter() {
    this.remaing_ballance = (this.rx.temp["transaction"].source_amount as any) - (this.rx.temp["transaction"].destination_amount as any)
    this.form.controls.amount.setValidators([Validators.required, Validators.min(0), Validators.max(this.remaing_ballance)])

    this.form.controls.currency.valueChanges.subscribe(async (v) => {
      this.selected_buy_currency = v;
      await this.get_rates();
      let max_amount = this.rates[v].rate * this.remaing_ballance
      this.form.controls.amount.setValidators([Validators.required, Validators.min(0), Validators.max(max_amount)])
    })
    this.form.controls.amount.valueChanges.subscribe(async (v) => {
      this.amount = v;
    })
  }
  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx: RX, private payoutSrv: PayoutService, private loading: LoadingService, private walletSrv: WalletService
  ) { }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  continue() {
    console.log("this.form", this.form);
    console.log("this.request_query", this.request_query);
    this.request_query.payout_currency = this.form.value.currency
    this.request_query.payout_amount = this.selected_buy_currency=="USD"?this.form.value.amount:(parseInt(this.form.value.amount)/this.rates[this.selected_buy_currency].rate)
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


      this.router.navigateByUrl("/transaction/destinations-sequence/destination?query_id=" + query_id)
      this.close();
    })
  }

  rates: { [key: string]: ICurrency.Response } = {} as any
  async get_rates() {
    return new Promise((resolve,reject)=>{
      var currency = this.form.controls.currency.value;
      if (currency != "USD") {
        if (this.rates[currency]) {
          resolve(this.rates[currency])
        }
        this.walletSrv.get_rates({ buy_currency: currency, sell_currency: "USD", action_type: "payout" }).subscribe(r => {
          this.rates[currency] = r.data;
          resolve(r.data)
        })
      }
    })
  }
  ngOnInit() {
    console.log(this.request_query);

  }

}




