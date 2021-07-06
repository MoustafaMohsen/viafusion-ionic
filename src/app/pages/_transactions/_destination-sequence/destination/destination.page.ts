import { BehaviorSubject } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { PayoutService } from 'src/app/services/auth/payout';
import { ICreatePayout, IGetPayoutRequiredFields } from 'src/app/interfaces/rapyd/ipayout';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { IAPIServerResponse } from 'src/app/interfaces/rapyd/types';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private rx: RX, private fb: FormBuilder) { }

  request_query: IGetPayoutRequiredFields.QueryRequest = {} as any;
  response_query: IGetPayoutRequiredFields.Response = {} as any;

  required_fields: IGetPayoutRequiredFields.Response = {} as any;
  sender_required_fields_form = new FormGroup({});
  beneficiary_required_fields_form = new FormGroup({});

  diable_submit = true;

  is_edit = false;
  edit_index = -1;
  query_id = ""

  ionViewWillEnter() {
    this.route.queryParamMap.subscribe(m => {
      this.update_query(m.get("query_id"));

    })
  }
  ngOnInit() {

    this.beneficiary_cc_form = this.fb.group({
      creditCard: [],
      creditCardDate: [],
      creditCardCvv: [],
    });
    this.sender_cc_form = this.fb.group({
      creditCard: [],
      creditCardDate: [],
      creditCardCvv: [],
    });
  }

  update_query(query_id) {
    this.query_id = query_id;
    if (!this.rx.temp.destination_queries[query_id]) {
      this.router.navigateByUrl("/transaction/destinations-sequence/available-destinations");
    }
    this.request_query = this.rx.temp.destination_queries[query_id].request_query
    this.response_query = this.rx.temp.destination_queries[query_id].response_query

    if (!this.request_query) {
      this.router.navigateByUrl("/transaction/destinations-sequence/available-destinations");
    }
    this.render_required_fields(this.response_query);
    // validate payout is uniqe
    for (let i = 0; i < this.rx.temp["transaction"]["payouts"].value.length; i++) {
      const destination = this.rx.temp["transaction"]["payouts"].value[i];
      if (destination.payout_method_type == this.request_query.payout_method_type) {
        console.log("payout edited");
        this.is_edit = true;
        this.edit_index = i;
        return;
      }
    }
  }
  beneficiary_cc_form: FormGroup;
  sender_cc_form: FormGroup;

  bene_is_cc = false
  sender_is_cc = false

  render_required_fields(data: IGetPayoutRequiredFields.Response) {
    this.required_fields = data;

    //#region Beneficiary
    let fields = [...data.beneficiary_required_fields];
    this.required_fields.beneficiary_required_fields = [];
    console.log(fields);

    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      // check if field of cc else add form
      let name = field.name;
      const condition = name == "card_number" || name == "card_expiration_month" || name == "card_expiration_year" || name == "card_cvv"
      if (condition) {
        this.bene_is_cc = true;
      } else {
        var form: FormControl;
        if (field.regex) {
          form = new FormControl("", [Validators.required, Validators.pattern(field.regex)])
        } else {
          form = new FormControl("", [Validators.required])
        }
        this.beneficiary_required_fields_form.addControl(name, form);
        this.required_fields.beneficiary_required_fields.push(field);
        console.log("added field", field);

      }
    }
    console.log("==>this.required_fields");
    console.log(this.required_fields);
    //#endregion

    //#region Sender
    let sender_fields = [...data.sender_required_fields];
    this.required_fields.sender_required_fields = [];
    console.log(sender_fields);

    for (let i = 0; i < sender_fields.length; i++) {
      let field = sender_fields[i];
      // check if field of cc else add form
      let name = field.name;
      const condition = name == "card_number" || name == "card_expiration_month" || name == "card_expiration_year" || name == "card_cvv"
      if (condition) {
        this.sender_is_cc = true;
      } else {
        var form: FormControl;
        if (field.regex) {
          form = new FormControl("", [Validators.required, Validators.pattern(field.regex)])
        } else {
          form = new FormControl("", [Validators.required])
        }
        this.sender_required_fields_form.addControl(name, form);
        this.required_fields.sender_required_fields.push(field);
        console.log("added field", field);

      }
    }
    console.log("==>this.required_fields");
    console.log(this.required_fields);
    //#endregion
  }

  formate_name(s: string) {
    return s ? s.replace("_", " ") : s;
  }
  cc_to_fields(fields, cc_form: FormGroup) {
    // cc values
    console.log(cc_form.value);

    let datevalue = cc_form.controls.creditCardDate.value;
    let card_number = cc_form.controls.creditCard.value
    let card_expiration_month = datevalue[0] + datevalue[1]
    let card_expiration_year = datevalue[5] + datevalue[6]
    let cvv = cc_form.controls.creditCardCvv.value
    fields = {
      ...fields,
      card_number, card_expiration_month, card_expiration_year, cvv,
      number: card_number, expiration_month: card_expiration_month, expiration_year: card_expiration_year
    }

    return fields
  }

  submit() {
    let beneficiary = this.beneficiary_required_fields_form.value;
    if (this.bene_is_cc) {
      beneficiary = this.cc_to_fields(beneficiary, this.beneficiary_cc_form);
    }

    let sender = this.beneficiary_required_fields_form.value;
    if (this.sender_is_cc) {
      sender = this.cc_to_fields(sender, this.sender_cc_form);
    }

    let user = this.rx.user$.value;

    let payout: ICreatePayout.Request = {
      payout_amount: this.request_query.payout_amount,
      payout_method_type: this.request_query.payout_method_type,
      payout_currency: this.request_query.payout_currency,

      beneficiary_country: this.request_query.beneficiary_country,
      beneficiary_entity_type: "individual",
      beneficiary,

      // sender data
      sender,
      sender_country: this.request_query.sender_country,
      sender_currency: "USD",
      sender_entity_type: "individual",
      ewallet: user.rapyd_wallet_data.id,
      merchant_reference_id: this.rx.makeid(5),

      // other data
      metadata: this.request_query.metadata,
      description: "",
      confirm_automatically: true,
      statement_descriptor: "Test Transfer",
    }

    let destinations = [...this.rx.temp["transaction"]["payouts"].value]
    // validate payout is uniqe
    if (this.is_edit) {

      destinations[this.edit_index] = payout;
      console.log(this.rx.temp["transaction"]["payouts"].next(destinations));
      this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");

    } else {
      destinations.push(payout)
      this.rx.temp["transaction"]["payouts"].next(destinations)
      this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
      console.log(this.rx.temp["transaction"]["payouts"]);
      console.log(payout);
    }

    console.log("======= Transaction Object =======");
    console.log(this.rx.temp["transaction"]);


  }

  cancel() {
    this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
  }

  get is_disable() {
    return false
    let d = false;
    if (this.sender_is_cc && this.sender_cc_form.invalid) {
      d = true;
      return d;
    }
    if (this.bene_is_cc && this.beneficiary_cc_form.invalid) {
      d = true;
      return d;
    }

    if (this.beneficiary_required_fields_form.invalid && this.response_query.beneficiary_required_fields.length > 0) {
      d = true;
      return d;
    }

    if (this.sender_required_fields_form.invalid && this.response_query.sender_required_fields.length > 0) {
      d = true;
      return d;
    }
    return d;
  }
}
