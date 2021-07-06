import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { ITransactionFull_payment, ITransactionFull_payout } from 'src/app/interfaces/db/idbmetacontact';
import { PaymentDetails_internal } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit {

  @Input() payment: ITransactionFull_payment
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() { }
  status:PaymentDetails_internal={} as any
  ionViewWillEnter() {
    this.status = this.action_status_type()
  }

  continue_btn(){

  }
  close(){
    this.modalCtrl.dismiss()
  }

  action_status_type() {
    var response: PaymentDetails_internal

    console.log("action_status_type() ");
    console.log("this.payment");
    console.log(this.payment);

    if (!this.payment.response) {
      response = {
        btn_active: false,
        btn_text: "Waiting",
        Status: "Not executed",
        message: "Payment was not executed, go back and click Do Payments to continue",
        instructions: "" as any,
        redirect_url: "",
        amount: this.payment.request.amount,
        error_message: "",
        response_code: "",
      }
      return response;
    }
    var status = this.payment.response.body.data.status;

    switch (status) {
      case "ACT":
        response = {
          btn_active: true,
          btn_text: "Click to Confirm manually",
          Status: "Active and awaiting payment. Can be updated",
          message: "Click on the link below to complete transaction (you are in sandbox, use rapyd:success as credentials)",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      case "CAN":
        response = {
          btn_active: false,
          btn_text: "Cancled",
          Status: "Cancled",
          message: "Canceled by the merchant or the customer's bank.",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      case "CLO":
        response = {
          btn_active: false,
          btn_text: "Done",
          Status: "Done",
          message: "Closed and paid.",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      case "ERR":
        response = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      case "EXP":
        response = {
          btn_active: false,
          btn_text: "Expired",
          Status: "Active and awaiting payment. Can be updated",
          message: "The payment has expired.",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      case "REV":
        response = {
          btn_active: true,
          btn_text: "REV",
          Status: "New, refresh after a while",
          message: "Reversed by Rapyd. See cancel reason",
          cancel_reason: this.payment.response.body.data.cancel_reason,
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
      default:
        response = {
          btn_active: false,
          btn_text: "Errored",
          Status: "Errored",
          message: "Error. An attempt was made to create or complete a payment, but it failed.",
          instructions: this.payment.response.body.data.instructions,
          redirect_url: this.payment.response.body.data.redirect_url,
          amount: this.payment.response.body.data.amount,
          error_message: this.payment.response.body.status.message,
          response_code: this.payment.response.body.status.response_code,
        }
        break;
    }
    console.log(response);

    return response;
  }


}
