import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IGetPayoutRequiredFields } from 'src/app/interfaces/rapyd/ipayout';
import { RquiredFormTypes } from 'src/app/interfaces/interfaces';
import { HelperService } from 'src/app/services/util/helper';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private rx: RX, private fb: FormBuilder,public h:HelperService) { }

  request_query: IGetPayoutRequiredFields.QueryRequest = {} as any;
  response_query: IGetPayoutRequiredFields.Response = {} as any;

  required_fields: IGetPayoutRequiredFields.Response = {} as any;
  sender_required_fields_form = new FormGroup({});
  beneficiary_required_fields_form = new FormGroup({});

  bene_html_fields:RquiredFormTypes[]
  sender_html_fields:RquiredFormTypes[]
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
      this.router.navigateByUrl("/dashboard");
    }
    this.request_query = this.rx.temp.destination_queries[query_id].request_query
    this.response_query = this.rx.temp.destination_queries[query_id].response_query

    if (!this.request_query) {
      this.router.navigateByUrl("/dashboard");
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
    let fields = data.beneficiary_required_fields?[...data.beneficiary_required_fields]:[];
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

    this.bene_html_fields = this.h.get_html_fields(this.required_fields.beneficiary_required_fields)
    this.sender_html_fields = this.h.get_html_fields(this.required_fields.sender_required_fields)
    console.log("==>this.bene_html_fields");
    console.log(this.bene_html_fields);
    console.log("==>this.sender_html_fields");
    console.log(this.sender_html_fields);
    console.log("==>this.required_fields");
    console.log(this.required_fields);
    //#endregion
  }


  submit() {
    let beneficiary = this.beneficiary_required_fields_form.value;
    if (this.bene_is_cc) {
      beneficiary = this.h.merge_fields_to_with_cc_form(beneficiary, this.beneficiary_cc_form);
    }

    let sender = this.beneficiary_required_fields_form.value;
    if (this.sender_is_cc) {
      sender = this.h.merge_fields_to_with_cc_form(sender, this.sender_cc_form);
    }

    let ewallet = this.rx.user$.value.ewallet;

    var payout = this.h.create_payout_object(this.request_query,ewallet,sender,beneficiary)


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
    console.log("----");
    console.log("this.sender_required_fields_form",this.sender_required_fields_form);
    console.log("this.beneficiary_required_fields_form",this.beneficiary_required_fields_form);
    console.log("----");
    return ;
    this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
  }

  get is_disable() {
    let d = false;

    // Validate sender cc fields
    if (this?.sender_is_cc && this?.sender_cc_form?.invalid) {
      d = true;
      return d;
    }

    // Validate bene cc fields
    if (this?.bene_is_cc && this?.beneficiary_cc_form?.invalid) {
      d = true;
      return d;
    }

    // Validate sender form fields if it has any
    if (this?.sender_required_fields_form?.invalid && this?.response_query?.sender_required_fields?.length > 0) {
      d = true;
      return d;
    }

    // Validate bene form fields if it has any
    if (this?.beneficiary_required_fields_form?.invalid && this?.response_query?.beneficiary_required_fields?.length > 0) {
      d = true;
      return d;
    }

    return d;
  }

}

