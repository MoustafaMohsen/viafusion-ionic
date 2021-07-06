import { WalletService } from 'src/app/services/wallet/wallet.service';
import { RX } from 'src/app/services/rx/events.service';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insta-send',
  templateUrl: './insta-send.page.html',
  styleUrls: ['./insta-send.page.scss'],
})
export class InstaSendPage implements OnInit {

  amount_form = new FormControl("")
  message_form = new FormControl("")
  constructor(private router: Router,private rx:RX, private walletSrv:WalletService) {

  }

  ngOnInit() {
    this.walletSrv.get_wallet_balance();
    this.amount_form.setValidators([Validators.required,Validators.max(this.walletSrv.balance$.value || 0)])
  }
  to_phone() {
    if (this.amount_form.value > 0) {
      this.rx.temp.wallet2wallet.value.amount = this.amount_form.value
      this.rx.temp.wallet2wallet.value.message = this.message_form.value
      this.rx.temp.wallet2wallet.next(this.rx.temp.wallet2wallet.value);
      this.router.navigateByUrl('/insta-send/enter-phone')
    }
  }

}
