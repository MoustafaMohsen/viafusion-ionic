import { WalletService } from 'src/app/services/wallet/wallet.service';
import { RX } from 'src/app/services/rx/events.service';
import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup, AbstractControl } from '@angular/forms';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
import { PayoutService } from 'src/app/services/auth/payout';
import { ICurrency } from 'src/app/interfaces/rapyd/iwallet';
import { environment } from 'src/environments/environment';
import { MONEY_PATTERN, round_money, to_cents, to_usd } from 'src/app/services/util/money';
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
  demo = environment.demo;
  ionViewWillEnter() {
    if (this.rx.temp["transaction"].source_amount == "0") {
      this.remaing_ballance = round_money(this.walletSrv.balance$.value - (Number(this.rx.temp["transaction"].destination_amount) || 0))
    }else{
      this.remaing_ballance = round_money((this.rx.temp["transaction"].source_amount as any) - (this.rx.temp["transaction"].destination_amount as any));
    }

    this.form.controls.amount.setValidators(this.amount_validators())

    this.form.controls.currency.valueChanges.subscribe(async (v) => {
      this.selected_buy_currency = v;
      await this.get_rates();
      // the limit depends on the rate of the chosen currency
      this.form.controls.amount.updateValueAndValidity();
    })
    this.form.controls.amount.valueChanges.subscribe(async (v) => {
      this.amount = v;
    })
  }
  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(0.01)]),
    currency: new FormControl("", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx: RX, private payoutSrv: PayoutService, private loading: LoadingService, private walletSrv: WalletService
  ) { }

  /** units of the chosen currency per 1 USD */
  get rate() {
    let currency = this.selected_buy_currency;
    return (!currency || currency == "USD") ? 1 : (this.rates[currency]?.rate || 1);
  }

  /** false while the rate of the chosen currency is still being fetched */
  get rate_ready() {
    let currency = this.selected_buy_currency;
    return !currency || currency == "USD" || !!this.rates[currency]?.rate;
  }

  /** what the typed amount costs in USD, to the cent */
  get usd_amount() {
    return to_usd(this.amount || 0, this.rate);
  }

  /** a positive amount with at most two decimals whose cost in USD fits in what is left */
  amount_validators() {
    return [
      Validators.required, Validators.min(0.01), Validators.pattern(MONEY_PATTERN),
      (control: AbstractControl) => to_cents(to_usd(control.value || 0, this.rate)) > to_cents(this.remaing_ballance) ? { max: true } : null,
    ];
  }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }
  continue() {
    console.log("this.form", this.form);
    console.log("this.request_query", this.request_query);
    this.request_query.payout_currency = this.form.value.currency
    // the wallet pays in USD, the recipient gets exactly the amount typed here
    this.request_query.payout_amount = to_usd(this.form.value.amount, this.rate)
    this.request_query.metadata = { ...this.request_query.metadata, payout_currency_amount: round_money(this.form.value.amount), fx_rate: this.rate } as any
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
      } else {
        resolve(null)
      }
    })
  }
  ngOnInit() {
    console.log(this.request_query);

  }

}




