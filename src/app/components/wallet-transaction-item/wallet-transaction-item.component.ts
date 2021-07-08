import { IWalletTransaction, wallet_transaction_description } from './../../interfaces/rapyd/iwallet';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RX } from 'src/app/services/rx/events.service';
import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus, TPoint  as _TPoint, TransactionPoint } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-wallet-transaction-item',
  templateUrl: './wallet-transaction-item.component.html',
  styleUrls: ['./wallet-transaction-item.component.scss'],
})
export class WalletTransactionItemComponent implements OnInit {

  @Input() transaction:IWalletTransaction;
  trans_desc = wallet_transaction_description
  constructor(private router:Router,private rx:RX, private alertCtr:AlertController) { }

  ngOnInit() {}

  dash_class(p_length:number,i:number){
    let key = "points_count_"+p_length
    return {
      [key]:true
    }
  }
}
