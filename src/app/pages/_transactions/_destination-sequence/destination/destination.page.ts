import { BehaviorSubject } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { PayoutService } from 'src/app/services/auth/payout';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private payoutSrv: PayoutService, private loading: LoadingService, private router: Router, private route: ActivatedRoute, private rx: RX) { }

  payout_method: string = "";
  required_fields: RequiredFields.Response = {} as any;
  fields_form = new FormGroup({
    amount: new FormControl("", [Validators.required])
  });
  diable_submit = true;

  is_edit = false;
  edit_index = -1;
  ngOnInit() {
    this.payout_method = decodeURIComponent(this.route.snapshot.queryParamMap.get("payout_method"));
    this.render_required_fields();
    // validate payout is uniqe
    for (let i = 0; i < this.rx.temp["transaction"]["payouts"].value.length; i++) {
      const destination = this.rx.temp["transaction"]["payouts"].value[i];
      if (destination.payout_method_type.type == this.payout_method) {
        console.log("payout edited");
        this.is_edit = true;
        this.edit_index = i;
        return;
      }
    }
  }

  render_required_fields() {
    this.payoutSrv.get_required_fields(this.payout_method).subscribe(res => {
      console.log("get_required_fields");
      console.log(res);
      if (res.success) {
        this.required_fields = res.data.body.data;
        for (let i = 0; i < this.required_fields.fields.length; i++) {
          let field = this.required_fields.fields[i];
          let form = new FormControl("", [Validators.required]) // TODO: set default values here
          this.fields_form.addControl(field.name, form);
        }

      }
    })
  }



  submit() {

    let user = this.rx.user$.value;
    let fields = { ...this.fields_form.value };
    delete fields.amount;
    let payout: PostCreatePayout.Request = {
      amount: parseInt(this.fields_form.get("amount").value),
      payout_method: {
        type: this.payout_method as any,
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

  }

  cancel() {
    this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
  }

}
