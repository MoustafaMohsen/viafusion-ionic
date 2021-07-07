import { FormGroup } from "@angular/forms";
import { IReducedTransaction, ITransaction, ITransactionFull_payment, ITransactionFull_payout } from "src/app/interfaces/db/idbmetacontact";
import { PaymentPayoutDetails_internal, RquiredFormTypes } from "src/app/interfaces/interfaces";
import { PostCreatePayment, RequiredFields } from "src/app/interfaces/rapyd/ipayment";
import { IGetPayoutRequiredFields, ICreatePayout } from "src/app/interfaces/rapyd/ipayout";
import { IRapydStatusResponse } from "src/app/interfaces/rapyd/rest-response";
import { IDBSelect } from "../../interfaces/db/select_rows";

export class HelperService {
  static generate_otp() {
    return this.getRandomInt(100000, 999999);
  }
  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static select_to_object<T>(select_obj: IDBSelect<T>) {
    return Object.values(select_obj)[0]
  }

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
      return f.instructions || f.description || ""
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

  create_payout_object(request_query: IGetPayoutRequiredFields.QueryRequest, effected_ewallet: string, sender: ICreatePayout.Sender, beneficiary: ICreatePayout.Beneficiary) {
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

  reduce_transaction_amounts(tran: ITransaction): IReducedTransaction {
    var source_amount = 0
    var destination_amount = 0
    var closed_payments_amount = 0
    var closed_payouts_amount = 0
    source_amount = tran?.payments?.map(s => s.request?.amount).reduce((a, b) => a + b, 0) || 0;
    destination_amount = tran?.payouts?.map(s => s.request?.payout_amount).reduce((a, b) => a + b, 0) || 0;

    try {
      closed_payments_amount = tran.payments.map(s => s.response?.body?.data?.amount).reduce((a, b) => a + b, 0) || 0;
    } catch (e) {
      closed_payments_amount = 0
    }
    try {
      closed_payouts_amount = tran.payouts.map(s => s.response?.body?.data?.amount).reduce((a, b) => a + b, 0) || 0;
    } catch (e) {
      closed_payouts_amount = 0
    }
    return { source_amount, destination_amount, closed_payments_amount, closed_payouts_amount, }
  }

  update_transactions_status(trans: ITransaction[]) {
    if (!trans) return trans;
    trans.forEach(t => {
      let requries_action = false;
      let canceled = false;
      let closed = false;
      let update = false;

      // update closed amount if you can
      let r = this.reduce_transaction_amounts(t);
      t.source_amount = r.source_amount as any
      t.destination_amount = r.destination_amount as any
      t.closed_payments_amount = r.closed_payments_amount
      t.closed_payouts_amount = r.closed_payouts_amount
      console.log("-----> closed t.closed_payments_amount", t.closed_payments_amount);

      // === loop payments
      t.payments?.forEach(p => {
        // Check if hase response
        if (p.response && p.response.body.status.status == "SUCCESS") {
          var payment_res = p.response.body.data;

          // is one active
          if (payment_res.status == "ACT") {
            requries_action = true
            update = true;
          }
          // is all closed
          if (payment_res.status == "CLO") {
            closed = true
            update = true;
          }
          // is cancaled
          if (payment_res.status == "CAN") {
            canceled = true;
            update = false;
          }
        }
      })

      if (update)
        t.status = canceled ? "canceled" : closed ? "closed" : requries_action ? "requires_action" : "saved";
    })
    return trans;
  }

  // === get status
  action_status_type_payment(full_payment: ITransactionFull_payment): PaymentPayoutDetails_internal {

    var payment_response: PostCreatePayment.Response = full_payment.response?.body?.data
    var payment_status_response: IRapydStatusResponse = full_payment.response?.body?.status
    var result: PaymentPayoutDetails_internal = {} as any

    console.log("=== action_status_type_payment started ===> full_payment");
    console.log(full_payment);

    console.log("payment_response");
    console.log(payment_response);

    // If payment doesn't have server response and was not requested
    if (!payment_response) {
      result = {
        btn_active: false,
        btn_text: "Waiting",
        Status: "Not executed",
        message: "Payment was not executed, go back and click Do Payments to continue",
        instructions: "" as any,
        redirect_url: "",
        amount: full_payment?.request?.amount,
        error_message: "",
        response_code: "",
      }
      result.category = full_payment?.request?.metadata?.category
      return result;
    }
    switch (payment_response.status) {
      case "ACT":
        result = {
          btn_active: true,
          btn_text: "Click to Confirm manually",
          Status: "Active and awaiting payment. Can be updated",
          message: "Click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CAN":
        // case "Canceled":
        result = {
          btn_active: false,
          btn_text: "Cancled",
          Status: "Cancled",
          message: "Canceled by the merchant or the customer's bank.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CLO":
        // case "Completed":
        result = {
          btn_active: false,
          btn_text: "Done",
          Status: "Done",
          message: "Closed and paid.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "ERR":
        // case "Error":
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "EXP":
        // case "Expired":
        result = {
          btn_active: false,
          btn_text: "Expired",
          Status: "Active and awaiting payment. Can be updated",
          message: "The payment has expired.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "REV":
        result = {
          btn_active: true,
          btn_text: "REV",
          Status: "New, refresh after a while",
          message: "Reversed by Rapyd. See cancel reason",
          cancel_reason: payment_response.cancel_reason,
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      default:
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
    }
    console.log("===action_status_type_payment done ===> status");
    console.log(status);
    result.amount = payment_response.amount
    result.category = payment_response?.payment_method_data?.category
    return result;
  }
  // === get status
  action_status_type_payout(full_payment: ITransactionFull_payout): PaymentPayoutDetails_internal {

    var payment_response: ICreatePayout.Response = full_payment.response?.body?.data
    var payment_status_response: IRapydStatusResponse = full_payment.response?.body?.status
    var result: PaymentPayoutDetails_internal = {} as any

    console.log("=== action_status_type_payment started ===> full_payment");
    console.log(full_payment);

    console.log("payment_response");
    console.log(payment_response);

    // If payment doesn't have server response and was not requested
    if (!payment_response) {
      result = {
        btn_active: false,
        btn_text: "Waiting",
        Status: "Not executed",
        message: "Payment was not executed, go back and click Do Payments to continue",
        instructions: "" as any,
        redirect_url: "",
        amount: full_payment?.request?.payout_amount,
        error_message: "",
        response_code: "",
      }
      return result;
    }
    // status = response?.body?.data?.status as any;

    // for response status type, as I don't garunte the status response
    let condition: any = payment_response.status
    switch (condition) {
      case "Confirmation":
        result = {
          btn_active: false,
          btn_text: "Confirmation",
          Status: "The payout is waiting for a confirmation of the FX rate",
          message: "you might need to click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "ACT":
        result = {
          btn_active: true,
          btn_text: "Click to Confirm manually",
          Status: "Active and awaiting payment. Can be updated",
          message: "Click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CAN":
      case "Canceled":
        result = {
          btn_active: false,
          btn_text: "Cancled",
          Status: "Cancled",
          message: "Canceled by the merchant or the customer's bank.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "CLO":
      case "Completed":
        result = {
          btn_active: false,
          btn_text: "Done",
          Status: "Done",
          message: "Closed and paid.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "ERR":
      case "Error":
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "EXP":
      case "Expired":
        result = {
          btn_active: false,
          btn_text: "Expired",
          Status: "Active and awaiting payment. Can be updated",
          message: "The payment has expired.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      case "REV":
        result = {
          btn_active: true,
          btn_text: "REV",
          Status: "New, refresh after a while",
          message: "Reversed by Rapyd. See cancel reason",
          cancel_reason: payment_response.cancel_reason,
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
      default:
        result = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: payment_response.instructions,
          redirect_url: payment_response.redirect_url,
          amount: payment_response.amount,
          error_message: payment_status_response.message,
          response_code: payment_status_response.response_code,
        }
        break;
    }
    console.log("===action_status_type_payment done ===> status");
    console.log(status);
    result.amount = payment_response.amount;
    return result;
  }
}
