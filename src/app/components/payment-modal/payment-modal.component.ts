import { HelperService } from 'src/app/services/util/helper';
import { LoadingService } from './../../services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { ITransactionFull_payment, ITransactionFull_payout } from 'src/app/interfaces/db/idbmetacontact';
import { PaymentPayoutDetails_internal } from 'src/app/interfaces/interfaces';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { ICreatePayout } from 'src/app/interfaces/rapyd/ipayout';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit {

  @Input() payment: any
  @Input() operation_type: "payment"|"payout"
  constructor(private modalCtrl:ModalController, private rx:RX,private loading:LoadingService,private h:HelperService) { }

  ngOnInit() { }
  status:PaymentPayoutDetails_internal={} as any
  ionViewWillEnter() {
    if(this.operation_type="payment")this.status = this.h.action_status_type_payment(this.payment);
    if(this.operation_type="payout")this.status = this.h.action_status_type_payout(this.payment);
  }

  continue_btn(){

  }
  close(){
    this.modalCtrl.dismiss()
  }


  btn_active(payment: ITransactionFull_payment) {
    return this.status.btn_active && !this.loading.loading
  }



}
