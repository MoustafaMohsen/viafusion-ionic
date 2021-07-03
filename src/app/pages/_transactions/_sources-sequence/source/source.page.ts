import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

    // init temp value
    if (!this.rx.temp["transaction"]) {
      this.rx.temp["transaction"] = {}
    }
    if (!this.rx.temp["transaction"]["sources"]) {
      this.rx.temp["transaction"]["sources"] = []
    }
    // validate payment is uniqe
    for (let i = 0; i < this.rx.temp["transaction"]["sources"].length; i++) {
      const source = this.rx.temp["transaction"]["sources"][i] as PostCreatePayment.ICreate;
      if (source.payment_method.type == this.payment_method) {
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
    if (this.fields_form.valid) {
      let fields = { ...this.fields_form.value };
      delete fields.amount;
      let payment: PostCreatePayment.ICreate = {
        amount: parseInt(this.fields_form.get("amount").value),
        payment_method: {
          type: this.payment_method,
          fields: fields
        }
      }

      // validate payment is uniqe
      if (this.is_edit) {
        this.rx.temp["transaction"]["sources"][this.edit_index] = payment;
        console.log(this.rx.temp["transaction"]["sources"][this.edit_index]);
      } else {
        this.rx.temp["transaction"]["sources"].push(payment)
        this.router.navigateByUrl("/transaction/sources-sequence/available-sources");
        console.log(this.rx.temp["transaction"]["sources"]);
        console.log(payment);
      }
    }
  }

}
