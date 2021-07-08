import { HelperService } from 'src/app/services/util/helper';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.page.html',
  styleUrls: ['./qr-payment.page.scss'],
})
export class QrPaymentPage implements OnInit {

  checkout_url: string
  constructor(public rx: RX,private h:HelperService) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.checkout_url = this.rx.temp?.checkouts[0]?.redirect_url;
    this.generate_qr_code();
  }

  generate_qr_code() {
    if (this.checkout_url) {
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: this.checkout_url,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  copy_link(){
    this.checkout_url?this.h.copy(this.checkout_url)
  }

}
