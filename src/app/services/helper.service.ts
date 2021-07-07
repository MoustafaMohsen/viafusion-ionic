import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RquiredFormTypes } from '../interfaces/interfaces';
import { RequiredFields } from '../interfaces/rapyd/ipayment';
import { ICreatePayout, IGetPayoutRequiredFields } from '../interfaces/rapyd/ipayout';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }
  formate_name(s: string) {
    return s ? s.replace(/_/g, " ") : s;
  }
  // format html field from regx rules
  formate_field(f: RequiredFields.Field) {
    let res: RquiredFormTypes = {} as any;
    var get_label = () => {
      return this.formate_name(f.name)
    }
    var get_description = () => {
      return  f.instructions || f.description || ""
    }
    var is_options = () => {
      return /\([a-z|_ ]+\)/gm.test(f.regex)
    }
    var get_disabled = () => {
      let value = "";
      /^[a-z]+$/.test(f.regex) && (value = f.regex)
      return value;
    }

    var get_options = () => {
      let options = []
      if (is_options()) {
        let regoptions = f.regex.replace(/\)|\(/gm, "").split("|")
        regoptions.forEach(o => {
          options.push({
            name: this.formate_name(o),
            value: o
          })
        })
      }
      return options
    }

    res.name = f.name
    res.label = get_label();
    res.description = get_description();
    res.options = get_options();
    res.disabled_value = get_disabled();
    // number
    if ((f.type == 'number' || f.type == 'integer') && !res.disabled_value) {
      res.type = "number"
    }
    if ((f.type == 'string' || f.type == 'text') && !res.disabled_value) {
      res.type = "text"
    }
    if ((f.type == 'date' || f.type == 'datetime') && !res.disabled_value) {
      res.type = "number"
    }
    res.type = is_options() ? "options" : "text";
    return res;
  }

  get_html_fields(fields: RequiredFields.Field[]) {
    let res = []
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      res.push(this.formate_field(f))
    }
    return res;
  }

  create_payout_object(request_query:IGetPayoutRequiredFields.QueryRequest,effected_ewallet:string,sender:ICreatePayout.Sender,beneficiary:ICreatePayout.Beneficiary){
    let payout: ICreatePayout.Request = {
      payout_amount: parseInt(request_query.payout_amount as any),
      payout_method_type: request_query.payout_method_type,
      payout_currency: request_query.payout_currency,

      beneficiary_country: request_query.beneficiary_country,
      beneficiary_entity_type: "individual",
      beneficiary,

      // sender data
      sender,
      sender_country: request_query.sender_country,
      sender_currency: "USD",
      sender_entity_type: "individual",
      ewallet: effected_ewallet,
      merchant_reference_id: this.makeid(5),

      // other data
      metadata: request_query.metadata,
      description: "",
      confirm_automatically: true,
      statement_descriptor: "Test Transfer",
    }
    return payout;
  }


  merge_fields_to_with_cc_form(fields, cc_form: FormGroup) {
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

  makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

}
