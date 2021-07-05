import { Router } from '@angular/router';
import { ITransaction, ITransactionFull_payment } from './../../../interfaces/db/idbmetacontact';
import { RX } from './../../../services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-complete-transaction',
  templateUrl: './complete-transaction.page.html',
  styleUrls: ['./complete-transaction.page.scss'],
})
export class CompleteTransactionPage implements OnInit {



  constructor(private rx: RX, private router: Router) { }

  tran_id = "";
  @Input() transaction: ITransaction = {
    "payments": [
      {
        "request": {
          "amount": 333,
          "payment_method": {
            "type": "us_mastercard_card",
            "fields": {
              "name": "fasf",
              "number": "5446627313825177",
              "expiration_month": "12",
              "expiration_year": "25",
              "cvv": "555"
            }
          },
          "metadata": {
            "name": "Mastercard",
            "image": "https://iconslib.rapyd.net/checkout/us_mastercard_card.png",
            "category": "card"
          },
          "3DS_requirede": false,
          "address": {
            "id": "address_c487057e5e227bf36ce24a459cc56b88",
            "name": "asfds",
            "line_1": "asdfsdaf",
            "line_2": "",
            "line_3": "",
            "city": "asdf",
            "state": "fadsf",
            "country": "US",
            "zip": "5500",
            "phone_number": "",
            "metadata": {},
            "canton": "",
            "district": "",
            "created_at": 1625479611
          },
          "currency": "USD",
          "complete_payment_url": "https://google.com/",
          "error_payment_url": "https://google.com/",
          "description": "",
          "capture": true,
          "customer": "cus_89358af8f82d0d61ccad7055efd22f5e",
          "statement_descriptor": "Test Transfer",
          "ewallets": [
            {
              "ewallet": "ewallet_eba088836a8e0fe6d29c8909be7cbe13",
              "percentage": 100
            }
          ]
        }
      }
    ],
    "id": "tranid_bQrWd",
    "source_amount": "333",
    "destination_amount": "0333",
    "payouts": [
      {
        "request": {
          "payout_amount": "333",
          "payout_method_type": "us_mastercard_card",
          "payout_currency": "USD",
          "beneficiary_country": "US",
          "beneficiary_entity_type": "individual",
          "beneficiary": {
            "email": "ffas@ffsdf.com",
            "company_name": "af",
            "postcode": "165165",
            "number": "5446627313825177",
            "expiration_month": "12",
            "expiration_year": "25",
            "cvv": "555"
          },
          "sender": {
            "email": "ffas@ffsdf.com",
            "company_name": "af",
            "postcode": "165165"
          },
          "sender_country": "US",
          "sender_currency": "USD",
          "sender_entity_type": "individual",
          "ewallet": "ewallet_eba088836a8e0fe6d29c8909be7cbe13",
          "merchant_reference_id": "vZjGq",
          "metadata": {
            "name": "null",
            "image": "null",
            "category": "null"
          },
          "description": "",
          "confirm_automatically": true,
          "statement_descriptor": "Test Transfer"
        }
      }
    ],
    "transfer_resoponse": {},
    "execute": true,
    "executed": false,
    "type": "many2many"
  } as any;

  ionViewWillEnter() {
    this.transaction = this.transaction ? this.transaction : this.rx.temp.view_transaction
  }

  ionViewWillLeave() {
  }
  ngOnInit() {
  }

  card_clicked(payment: ITransactionFull_payment) {
    console.log(payment)
  }
}
