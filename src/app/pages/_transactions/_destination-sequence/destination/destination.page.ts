import { BehaviorSubject } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PostCreatePayment, RequiredFields } from 'src/app/interfaces/rapyd/ipayment';
import { PaymentService } from 'src/app/services/auth/payment';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private paymentSrv: PaymentService, private loading: LoadingService, private router: Router, private route: ActivatedRoute, private rx: RX) { }

  payment_method: string = "";
  required_fields: RequiredFields.Response = {} as any;
  fields_form = new FormGroup({
    amount: new FormControl("", [Validators.required])
  });
  diable_submit = true;

  is_edit = false;
  edit_index = -1;
  ngOnInit() {
    this.payment_method = decodeURIComponent(this.route.snapshot.queryParamMap.get("payment_method"));
    this.render_required_fields();
    // validate payment is uniqe
    for (let i = 0; i < this.rx.temp["transaction"]["payouts"].value.length; i++) {
      const destination = this.rx.temp["transaction"]["payouts"].value[i] as PostCreatePayment.Request;
      if (destination.payment_method.type == this.payment_method) {
        console.log("payment edited");
        this.is_edit = true;
        this.edit_index = i;
        return;
      }
    }
  }

  render_required_fields() {
    this.paymentSrv.get_required_fields(this.payment_method).subscribe(res => {
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
    let payment: PostCreatePayment.Request = {
      amount: parseInt(this.fields_form.get("amount").value),
      payment_method: {
        type: this.payment_method as any,
        fields: fields
      },
      metadata: {
        name: decodeURIComponent(this.route.snapshot.queryParamMap.get("name")),
        image: decodeURIComponent(this.route.snapshot.queryParamMap.get("image")),
        category: decodeURIComponent(this.route.snapshot.queryParamMap.get("category")),
      },
      "3DS_requirede":false,
      address:user.rapyd_contact_data.address as any,
      currency:"USD",
      complete_payment_url:"https://google.com/",
      error_payment_url:"https://google.com/",
      description:"",
      capture:true,
      customer:user.customer,
      statement_descriptor:"Test Transfer",
      ewallets:[
        {
          ewallet:user.ewallet,
          percentage:100
        }
      ]
    }

    let destinations = [...this.rx.temp["transaction"]["payouts"].value]
    // validate payment is uniqe
    if (this.is_edit) {

      destinations[this.edit_index] = payment;
      console.log(this.rx.temp["transaction"]["payouts"].next(destinations));
      this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");

    } else {
      destinations.push(payment)
      this.rx.temp["transaction"]["payouts"].next(destinations)
      this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
      console.log(this.rx.temp["transaction"]["payouts"]);
      console.log(payment);
    }

  }

  cancel() {
    this.router.navigateByUrl("/transaction/destinations-sequence/selected-destinations");
  }

}
