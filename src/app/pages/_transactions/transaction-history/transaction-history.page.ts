import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { TPoint, TransactionPoint } from '../../../interfaces/interfaces';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/interfaces/interfaces';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
})
export class TransactionHistoryPage implements OnInit {

  saved_trans:ITransaction[]=[];
  saved_trans_amount:number;
  past_trans:ITransaction[]=[];
  constructor(public loading:LoadingService, public router:Router,private rx:RX) { }

  ionViewWillEnter() {
    this.saved_trans = this.rx.meta$.value.transactions.filter(t=>t.status=="saved")
    this.past_trans = this.rx.meta$.value.transactions.filter(t=>t.status!="saved")
  }
  ngOnInit() {
  }


}
