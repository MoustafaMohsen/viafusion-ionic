import { HelperService } from 'src/app/services/util/helper';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { QrCodeHelper } from 'ngx-kjua';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.page.html',
  styleUrls: ['./qr-payment.page.scss'],
})
export class QrPaymentPage implements OnInit {

  checkout_url: string
  constructor(public rx: RX, private h: HelperService) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.checkout_url = this.rx.temp?.checkouts[0]?.redirect_url;
    // this.generate_qr_code();
  }

  copy_link() {
    this.checkout_url && this.h.copy(this.checkout_url)
  }

}
