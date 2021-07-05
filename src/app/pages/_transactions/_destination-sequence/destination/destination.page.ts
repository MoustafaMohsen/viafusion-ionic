import { BehaviorSubject } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { PayoutService } from 'src/app/services/auth/payout';
import { IGetPayoutRequiredFields } from 'src/app/interfaces/rapyd/ipayout';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private payoutSrv: PayoutService, private loading: LoadingService, private router: Router, private route: ActivatedRoute, private rx: RX) { }

  request_query: IGetPayoutRequiredFields.QueryRequest = {} as any;

  required_fields: IGetPayoutRequiredFields.Response = {} as any;
  sender_required_fields_form = new FormGroup({});
  beneficiary_required_fields_form = new FormGroup({});

  diable_submit = true;

  is_edit = false;
  edit_index = -1;
  query_id = ""
  ngOnInit() {

    this.query_id = decodeURIComponent(this.route.snapshot.queryParamMap.get("query_id"));
    this.request_query = this.rx.temp.destination_queries[this.query_id]

    this.render_required_fields();
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

  render_required_fields() {
    this.payoutSrv.get_required_fields(this.request_query).subscribe(res => {
      console.log("get_required_fields");
      console.log(res);
      if (res.success) {
        this.required_fields = res.data.body.data;

        // sender_fields
        for (let i = 0; i < this.required_fields.sender_required_fields.length; i++) {
          let field = this.required_fields.sender_required_fields[i];
          var form
          if (field.regex) {
            form = new FormControl("", [Validators.required, Validators.pattern(field.regex)])
          } else {
            form = new FormControl("", [Validators.required])
          }
          this.sender_required_fields_form.addControl(field.name, form);
        }

        // bene fields
        for (let i = 0; i < this.required_fields.beneficiary_required_fields.length; i++) {
          let field = this.required_fields.beneficiary_required_fields[i];
          var form
          if (field.regex) {
            form = new FormControl("", [Validators.required, Validators.pattern(field.regex)])
          } else {
            form = new FormControl("", [Validators.required])
          }
          this.beneficiary_required_fields_form.addControl(field.name, form);
        }

      }
    })
  }



  submit() {

    return;/*
    let user = this.rx.user$.value;
    let fields = { ...this.fields_form.value };
    delete fields.amount;
    let payout: PostCreatePayout.Request = {
      amount: parseInt(this.fields_form.get("amount").value),
      payout_method: {
        type: this.request_query.payout_method_type as any,
        fields: fields
      },
      metadata: {
        name: decodeURIComponent(this.route.snapshot.queryParamMap.get("name")),
        image: decodeURIComponent(this.route.snapshot.queryParamMap.get("image")),
        category: decodeURIComponent(this.route.snapshot.queryParamMap.get("category")),
      },
      "3DS_requirede": false,
      address: user.rapyd_contact_data.address as any,
      currency: "USD",
      complete_payout_url: "https://google.com/",
      error_payout_url: "https://google.com/",
      description: "",
      capture: true,
      customer: user.customer,
      statement_descriptor: "Test Transfer",
      ewallets: [
        {
          ewallet: user.ewallet,
          percentage: 100
        }
      ]
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
*/
  }

  cancel() {
    this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
  }

}
