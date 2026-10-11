import { WalletService } from 'src/app/services/wallet/wallet.service';
import { RX } from 'src/app/services/rx/events.service';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MONEY_PATTERN } from 'src/app/services/util/money';

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
    this.walletSrv.get_wallet_balance().catch(() => { });
    // the balance arrives after the page opens, keep the limit in step with it
    this.walletSrv.balance$.subscribe(balance => {
      this.amount_form.setValidators([Validators.required, Validators.min(0.01), Validators.pattern(MONEY_PATTERN), Validators.max(balance || 0)])
      this.amount_form.updateValueAndValidity();
    })
  }
  to_phone() {
    if (this.amount_form.invalid) {
      this.rx.toast("Enter an amount greater than zero, with at most two decimals, and no more than your wallet balance.", "Error", 4000);
      return;
    }
    if (this.amount_form.value > 0) {
      this.rx.temp.wallet2wallet.value.amount = this.amount_form.value
      this.rx.temp.wallet2wallet.value.message = this.message_form.value
      this.rx.temp.wallet2wallet.next(this.rx.temp.wallet2wallet.value);
      this.router.navigateByUrl('/insta-send/enter-phone')
    }
  }

}
