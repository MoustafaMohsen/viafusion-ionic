import { WalletService } from 'src/app/services/wallet/wallet.service';
import { RX } from 'src/app/services/rx/events.service';
import { LoadingService } from '../../services/loading.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
import { PayoutService } from 'src/app/services/auth/payout';
import { ICurrency } from 'src/app/interfaces/rapyd/iwallet';
@Component({
  selector: 'app-bottom-drawer-amount-modal',
  templateUrl: './bottom-drawer-amount.component.html',
  styleUrls: ['./bottom-drawer-amount.component.scss'],
})
export class BottomDrawerModalComponent {

  @Input() currencies: string[] = ["USD"];
  @Input() remaing_ballance;
  amount = 0;

  ionViewWillEnter() {
    this.remaing_ballance = this.walletSrv.balance$.value
  }

  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("USD", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx: RX, private payoutSrv: PayoutService, private loading: LoadingService, private walletSrv: WalletService,
  ) { }

  async close() {
  }
  async continue() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss({
      amount: this.form.value.amount
    });

  }

}




