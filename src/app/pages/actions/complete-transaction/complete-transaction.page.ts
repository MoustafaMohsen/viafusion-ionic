import { ITransaction } from './../../../interfaces/db/idbmetacontact';
import { RX } from './../../../services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-complete-transaction',
  templateUrl: './complete-transaction.page.html',
  styleUrls: ['./complete-transaction.page.scss'],
})
export class CompleteTransactionPage implements OnInit {


  source = {
    amount:50,
    metadata:{
      category:"card",
      name:"Card with visa or mastercard wads",
      image:""
    }
  }

  constructor(private rx:RX) { }

  tran_id="";
  transaction:ITransaction;

  private _sub$ : Subscription;
  ionViewWillEnter() {
    this._sub$ = this.rx.meta$.subscribe(meta=>{
      for (let i = 0; i < meta.transactions.length; i++) {
        let tran = meta.transactions[i];
        if(tran.id == this.tran_id) {
          this.transaction = tran;
          break;
        }
      }

    })
  }

  ionViewWillLeave() {
    this._sub$.unsubscribe();
  }
  ngOnInit() {
  }

  card_clicked(){
    console.log(this.source)
  }
}
