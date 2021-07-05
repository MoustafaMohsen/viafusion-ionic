import { BehaviorSubject } from 'rxjs';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PostCreatePayment, RequiredFields } from 'src/app/interfaces/rapyd/ipayment';
import { PaymentService } from 'src/app/services/auth/payment';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-source',
  templateUrl: './source.page.html',
  styleUrls: ['./source.page.scss'],
})
export class SourcePage implements OnInit {

  constructor(private paymentSrv: PaymentService, private loading: LoadingService, private router: Router, private route: ActivatedRoute, private rx: RX, private fb: FormBuilder) { }

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
    for (let i = 0; i < this.rx.temp["transaction"]["payments"].value.length; i++) {
      const source = this.rx.temp["transaction"]["payments"].value[i] as PostCreatePayment.Request;
      if (source.payment_method.type == this.payment_method) {
        console.log("payment edited");
        this.is_edit = true;
        this.edit_index = i;
        return;
      }
    }

    this.cc_form = this.fb.group({
      creditCard: [],
      creditCardDate: [],
      creditCardCvv: [],
    });
  }

  cc_form: FormGroup;
  is_cc = false;

  render_required_fields() {
    this.paymentSrv.get_required_fields(this.payment_method).subscribe(res => {
      console.log("get_required_fields");
      console.log(res);
      if (res.success) {
        let fields = [...res.data.body.data.fields];
        this.required_fields = res.data.body.data;
        this.required_fields.fields = [];
        console.log(fields);

        for (let i = 0; i < fields.length; i++) {
          let field = fields[i];
          // check if field of cc else add form
          let name = field.name;
          const condition = name == "number" || name == "expiration_month" || name == "expiration_year" || name == "cvv"
          if (condition) {
            this.is_cc = true;
          } else {
            var form: FormControl;
            if (field.regex) {
              form = new FormControl("", [Validators.required, Validators.pattern(field.regex)])
            } else {
              form = new FormControl("", [Validators.required])
            }
            this.fields_form.addControl(name, form);
            this.required_fields.fields.push(field);
            console.log("added field", field);

          }
        }
        console.log("==>this.required_fields");
        console.log(this.required_fields);
      }
    })
  }



  cc_to_fields(fields,cc_form: FormGroup) {
    // cc values
    console.log(cc_form.value);

    let datevalue = cc_form.controls.creditCardDate.value;
    let number = cc_form.controls.creditCard.value
    let expiration_month = datevalue[0] + datevalue[1]
    let expiration_year = datevalue[5] + datevalue[6]
    let cvv = cc_form.controls.creditCardCvv.value
    fields = {
      ...fields,
      number, expiration_month, expiration_year, cvv
    }

    return fields
  }

  submit() {

    let user = this.rx.user$.value;
    var fields: PostCreatePayment.IFields = { ...this.fields_form.value };

    if (this.is_cc) {
      fields = this.cc_to_fields(fields,this.cc_form);
    }

    console.log(fields);
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
      "3DS_requirede": false,
      address: user.rapyd_contact_data.address as any,
      currency: "USD",
      complete_payment_url: "https://google.com/",
      error_payment_url: "https://google.com/",
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

    let sources = [...this.rx.temp["transaction"]["payments"].value]
    // validate payment is uniqe
    if (this.is_edit) {
      sources[this.edit_index] = payment;
      console.log(this.rx.temp["transaction"]["payments"].next(sources));
      this.router.navigateByUrl("/transaction/sources-sequence/selected-sources");

    } else {
      sources.push(payment)
      this.rx.temp["transaction"]["payments"].next(sources)
      this.router.navigateByUrl("/transaction/sources-sequence/selected-sources");
      console.log(this.rx.temp["transaction"]["payments"]);
      console.log(payment);
    }

  }

  cancel() {
    this.router.navigateByUrl("/transaction/sources-sequence/selected-sources");
  }

}
