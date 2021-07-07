import { WalletService } from 'src/app/services/wallet/wallet.service';
import { IWalletTransaction } from './../../../interfaces/rapyd/iwallet';
import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';
import { TPoint, TransactionPoint } from '../../../interfaces/interfaces';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/interfaces/interfaces';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';

@Component({
  selector: 'app-wallet-transaction-history',
  templateUrl: './wallet-transaction-history.page.html',
  styleUrls: ['./wallet-transaction-history.page.scss'],
})
export class WalletTransactionHistoryPage implements OnInit {

  wallet_trans:IWalletTransaction[]=[];
  constructor(public loading:LoadingService, public router:Router,private rx:RX,private walletSrv:WalletService) { }

  async ionViewWillEnter() {
    await this.walletSrv.get_detailed_wallet_transactions().subscribe(d=>{
      if(d.success){
        this.wallet_trans = d.data.data
      }else{
        this.rx.toastError(d as any)
      }
    })
  }
  ngOnInit() {
  }


}
